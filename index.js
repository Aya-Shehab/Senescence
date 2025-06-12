import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/order.js";
import productRoutes from "./routes/product.js";
import customOrderRoutes from "./routes/customOrder.js";
import contactRoutes from "./routes/contact.js";
import chatRoutes from "./routes/chatMessage.js";
import feedbackRoutes from "./routes/feedback.js";
import shopRoutes from "./routes/shop.js";
import multer from "multer";
import path from "path";
import cookieParser from "cookie-parser";
import frontendRouter from "./routes/frontend.js"
dotenv.config();

const app = express();
const port = 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Set up EJS
app.set("view engine", "ejs");
app.use(express.static("public"));

// API Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/custom-orders", customOrderRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/feedback", feedbackRoutes);
app.use(frontendRouter);

connectDB();

// Add a catch-all route for debugging
app.use((req, res, next) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).render("404");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
