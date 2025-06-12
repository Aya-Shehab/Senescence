import express from "express";
import auth from "../middlewares/auth.js";
import shopRoutes from "./shop.js";
import jwt from "jsonwebtoken"
import User from "../models/user.js"
import { getProductById } from '../controllers/product.js';
import Product from "../models/product.js";
import { getUserPastOrders, getPastOrder } from '../controllers/pastOrder.js';
import Order from "../models/order.js"; 



const router = express.Router();

// Middleware to check for user from JWT
const getUserFromToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).redirect('/login');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).redirect('/login');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT middleware error:", error);
    return res.status(401).redirect('/login');
  }
};

// Main Pages
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.render("index", { products });
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
  res.render("admin" , {users : await User.find()});
});

// Mount shop routes before the catch-all route
router.use("/shop", shopRoutes);

// Account route
router.get('/account', getUserFromToken, (req, res) => {
  res.render('account', { user: req.user });
});

// Past Orders Routes
router.get('/pastorders', auth(["customer"]), getUserPastOrders);
router.get('/api/orders/:orderId', auth(["customer"]), getPastOrder);

router.get('/favorites', (req, res) => {
    res.render('favorites');
});



export default router;
