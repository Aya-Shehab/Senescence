import Cart from '../models/cart.js';
import Product from '../models/product.js';

// GET /cart/:userId
export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure the authenticated user is only accessing their own cart
    if (req.user && req.user._id.toString() !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart) {
      return res.status(200).json({
        userId,
        items: [],
        totalItems: 0,
        totalPrice: 0,
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
    const { quantity = 1, priceType = "whole" } = req.body;

    // Authorization guard
    if (req.user && req.user._id.toString() !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (!product.inStock) {
      return res.status(400).json({ error: "Product is out of stock" });
    }

    const price = priceType === "piece" ? product.pricePiece : product.pricePackWhole;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Find existing item with same product and priceType
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && item.priceType === priceType
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId: product._id,
        productName: product.name,
        category: product.category,
        price,
        priceType,
        imageUrl: product.imageUrl,
        quantity,
      });
    }

    await cart.save();

    res.status(200).json({
      message: "Item added to cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// PUT /cart/:userId/item/:productId
export const updateCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity, priceType } = req.body; // priceType optional for locating exact item

    if (req.user && req.user._id.toString() !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        (priceType ? item.priceType === priceType : true)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    res.status(200).json({
      message: "Cart item updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE /cart/:userId/item/:productId
export const removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { priceType } = req.body;

    if (req.user && req.user._id.toString() !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        (priceType ? item.priceType === priceType : true)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.status(200).json({
      message: "Item removed from cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ error: "Server error" });
  }
};
