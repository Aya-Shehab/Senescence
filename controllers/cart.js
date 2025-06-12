import Cart from '../models/cart.js';
import Product from '../models/product.js';

// GET /cart/:userId
export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const cart = await Cart.findOne({ user: userId }).populate('items.productId');
    if (!cart) {
      return res.status(200).json({
        user: userId,
        items: [],
        totalItems: 0,
        totalPrice: 0
      });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error getting cart:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// POST /cart/:userId/add/:productId
export const addToCart = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    if (!product.inStock) {
      return res.status(400).json({ error: "Product is out of stock" });
    }
    
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
    
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );
    
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId: product._id,
        productName: product.name, 
        category: product.category, 
        price: product.PricePackWhole, 
        imageUrl: product.imageUrl, 
        quantity
      });
    }
    
    await cart.save();
    
    res.status(200).json({
      message: "Item added to cart successfully",
      cart
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

// PUT /cart/:userId/update/:productId
export const updateCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    res.status(200).json({
      message: "Cart item updated successfully",
      cart
    });

  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE /cart/:userId/remove/:productId
export const removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.status(200).json({
      message: "Item removed from cart successfully",
      cart
    });

  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ error: "Server error" });
  }
};
