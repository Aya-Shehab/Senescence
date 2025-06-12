import Cart from '../models/cart.js';
import Order from '../models/order.js';
import axios from 'axios';
import crypto from 'crypto';
import { createPastOrder } from './pastOrder.js';

//user
export const placeOrder = async (req, res) => {
  try {
    const { userId } = req.params;
    const { shippingInfo, paymentMethod, items } = req.body;

    if (!shippingInfo || !shippingInfo.firstName || !shippingInfo.lastName || 
        !shippingInfo.email || !shippingInfo.phone || !shippingInfo.address ||
        !shippingInfo.address.street || !shippingInfo.address.city || 
        !shippingInfo.address.postCode || !shippingInfo.address.governorate) {
      return res.status(400).json({ error: 'Please fill all fields' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate totals
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const orderItems = items.map(item => ({
      productId: item.id,
      name: item.name,
      imageUrl: item.image,
      quantity: item.quantity,
      price: item.price
    }));

    const generateOrderNumber = async () => {
      let orderNumber;
      let isUnique = false;
      while (!isUnique) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9).toUpperCase();
        orderNumber = `ORD-${timestamp}-${random}`;
        const existingOrder = await Order.findOne({ orderNumber });
        if (!existingOrder) {
          isUnique = true;
        }
      }
      return orderNumber;
    };

    if (paymentMethod === 'cash') {
      const order = await Order.create({
        userId,
        orderNumber: await generateOrderNumber(),
        shippingInfo,
        items: orderItems,
        totalPrice,
        totalItems,
        amount: totalPrice,
        paymentMethod: 'cash',
        paymentStatus: 'pending'
      });

      // Create a past order record
      await createPastOrder(order);

      return res.status(201).json({ 
        message: 'Order placed successfully for Cash on Delivery', 
        order 
      });
    }

    if (paymentMethod === 'card') {
      try {
        // get authentication token
        const authResponse = await axios.post('https://accept.paymob.com/api/auth/tokens', { 
          api_key: process.env.PAYMOB_API_KEY 
        });
        const authToken = authResponse.data.token;

        // create Order in Paymob
        const orderData = {
          auth_token: authToken,
          delivery_needed: "false",
          amount_cents: totalPrice * 100, // Amount in cents
          currency: "EGP",
          items: []
        };
        const orderResponse = await axios.post('https://accept.paymob.com/api/ecommerce/orders', orderData);
        
        // create order in database with paymob order ID
        const order = await Order.create({
          userId,
          orderNumber: await generateOrderNumber(),
          shippingInfo,
          items: orderItems,
          totalPrice,
          totalItems,
          amount: totalPrice,
          paymentMethod: 'card',
          paymobOrderId: orderResponse.data.id,
          paymentStatus: 'pending'
        });

        // get Payment Key
        const paymentKeyData = {
          auth_token: authToken,
          amount_cents: totalPrice * 100,
          expiration: 3600,
          order_id: orderResponse.data.id,
          billing_data: {
            email: shippingInfo.email,
            first_name: shippingInfo.firstName,
            last_name: shippingInfo.lastName,
            phone_number: shippingInfo.phone,
            street: shippingInfo.address.street,
            building: "NA",
            floor: "NA", 
            apartment: "NA",
            city: shippingInfo.address.city,
            country: "Egypt",
            postal_code: shippingInfo.address.postCode,
            state: shippingInfo.address.governorate
          },
          currency: "EGP",
          integration_id: process.env.PAYMOB_INTEGRATION_ID
        };
        
        const paymentKeyResponse = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', paymentKeyData);
        const paymentToken = paymentKeyResponse.data.token;

        // generate payment URL
        const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;

        // Create a past order record
        await createPastOrder(order);

        return res.status(200).json({ 
          success: true, 
          paymentUrl, 
          order 
        });

      } catch (error) {
        console.error("Card payment initiation failed:", error.response?.data || error.message);
        return res.status(500).json({ error: 'Failed to create card payment' });
      }
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Handle Paymob callback
export const paymentCallback = async (req, res) => {
  const data = req.body;
  const receivedHmac = req.query.hmac;

  // HMAC Verification
  const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
  const concatenatedString = `${data.obj.amount_cents}${data.obj.created_at}${data.obj.currency}${data.obj.error_occured}${data.obj.has_parent_transaction}${data.obj.id}${data.obj.integration_id}${data.obj.is_3d_secure}${data.obj.is_auth}${data.obj.is_capture}${data.obj.is_refunded}${data.obj.is_standalone_payment}${data.obj.is_voided}${data.obj.order.id}${data.obj.owner}${data.obj.pending}${data.obj.source_data.pan}${data.obj.source_data.sub_type}${data.obj.source_data.type}${data.obj.success}`;

  const calculatedHmac = crypto.createHmac('sha512', hmacSecret).update(concatenatedString).digest('hex');

  if (calculatedHmac !== receivedHmac) {
    console.error("HMAC verification failed");
    return res.status(403).json({ message: 'HMAC verification failed' });
  }

  const { success, order: paymobOrderId } = data.obj;

  try {
    const order = await Order.findOne({ paymobOrderId: paymobOrderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (success && order.paymentStatus === 'pending') {
      order.paymentStatus = 'completed';
      await order.save();
      console.log(`Order ${order._id} successfully marked as paid`);
    } else if (!success && order.paymentStatus === 'pending') {
      order.paymentStatus = 'failed';
      await order.save();
      console.log(`Order ${order._id} marked as failed`);
    }
    
    return res.status(200).json({ message: 'Callback received successfully' });

  } catch (error) {
    console.error("Error processing callback:", error);
    return res.status(500).json({ message: 'Error processing callback' });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: 'Cancelled' },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json({ message: 'Order cancelled', order });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 }); // -1 means newest first
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

//admin

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
 
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};


export const renderUserOrders = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.redirect('/login');
    }

    const orders = await Order.find({ userId: req.user._id })
      .populate('items.productId', 'name imageUrl')
      .sort({ createdAt: -1 });
    
    res.render('pastorders', { 
      orders,
      user: req.user,
      title: 'Past Orders'
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.render('pastorders', { 
      orders: [],
      user: req.user,
      title: 'Past Orders',
      error: 'Failed to load orders'
    });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { items, shippingInfo, paymentMethod } = req.body;

    if (!items || !shippingInfo || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const order = new Order({
      userId: req.user._id,
      items,
      shippingInfo,
      paymentMethod,
      totalPrice: items.reduce((total, item) => total + (item.price * item.quantity), 0)
    });

    await order.save();

    // Create a past order record
    await createPastOrder(order);

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
};


