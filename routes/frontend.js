import express from "express";
import auth from "../middlewares/auth.js";
import shopRoutes from "./shop.js";
import jwt from "jsonwebtoken"
import User from "../models/user.js"
import { getProductById } from '../controllers/product.js';
import Product from "../models/product.js";
import { searchProducts } from '../controllers/searchController.js';
import customOrder from "../models/customOrder.js";
import Feedback from "../models/feedback.js";
import Order from "../models/order.js";

const router = express.Router();

// Middleware to check for user from JWT
router.use(async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.locals.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    res.locals.user = user || null;
    next();
  } catch (error) {
    console.error("JWT middleware error:", error);
    res.locals.user = null;
    return next();
  }
});

// Main Pages
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(3);
    res.render("index", { products, feedbacks });
  } catch (error) {
    console.error('Error loading index page:', error);
    res.status(500).render('error', { 
      message: 'Error loading index page',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

router.get("/customer", (req, res) => {
    res.redirect("/" );
  });
  
router.get("/account", auth(["customer"]), (req, res) => {
  res.render("account"); 
});

router.get("/about-us", (req, res) => {
  res.render("about-us");
});

router.get("/contact-us", (req, res) => {
  res.render("contact-us");
});

router.get("/custom-order", auth(["customer"]), (req, res) => {
  res.render("custom-order");
});

router.get("/checkout", (req, res) => {
  res.render("checkout");
});

router.get("/order-success", (req, res) => {
  res.render("order-success");
});

router.get("/categories", async (req, res) => {
    try {
        const products = await Product.find();
        res.render('categories', { products });
    } catch (error) {
        console.error('Error loading categories page:', error);
        res.status(500).render('error', { 
            message: 'Error loading categories page',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

router.get("/product/:id", getProductById);

router.get("/admin", auth(["admin"]),async (req, res) => {
  const customOrders = await customOrder.find();
  const feedbacks = await Feedback.find();
  const orders = await Order.find();
  res.render("admin" , {users : await User.find(), customOrders, feedbacks, orders});
});

// Mount shop routes before the catch-all route
router.use("/shop", shopRoutes);

const getUserFromToken = async (req, res, next) => {
  try {
    const token = req.cookies.token; // Assuming you store JWT in cookies
    if (!token) {
      return res.redirect('/login'); // Redirect to login if no token
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.redirect('/login');
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.redirect('/login');
  }
};

// Account route
router.get('/account', getUserFromToken, (req, res) => {
  res.render('account', { user: req.user });
});


//////////////

router.get('/account', async (req, res) => {
  try {
    // Get user data from your database
    // (Replace this with however you get the current user)
    const user = await User.findById(req.user.id); // Adjust based on your auth system
    
    res.render('account', { user: user });
  } catch (error) {
    console.error('Error:', error);
    res.render('account', { user: { name: 'User' } }); // Fallback
  }
});
router.get('/pastorders', getUserFromToken, async (req, res) => {
  try {
    const userId = req.user._id; 
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.render('pastorders', { orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.render('pastorders', { orders: [] }); 
  }
});

router.get('/favorites', getUserFromToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.render('favorites', { favorites: user.favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.render('favorites', { favorites: [] });
  }
});

// Add to favorites API
router.post('/api/v1/favorites/:productId', getUserFromToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    
    // Check if product is already in favorites
    if (user.favorites.includes(productId)) {
      return res.status(400).json({ error: 'Product already in favorites' });
    }
    
    // Add product to favorites
    user.favorites.push(productId);
    await user.save();
    
    res.status(200).json({ message: 'Product added to favorites' });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// Remove from favorites API
router.delete('/api/v1/favorites/:productId', getUserFromToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    
    // Remove product from favorites
    user.favorites = user.favorites.filter(id => id.toString() !== productId);
    await user.save();
    
    res.status(200).json({ message: 'Product removed from favorites' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

// Search route
router.post('/search', searchProducts);

export default router;
