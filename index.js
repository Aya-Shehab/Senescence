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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

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
app.use("/api/v1/custom-order", customOrderRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/feedback", feedbackRoutes);
app.use(frontendRouter);

// Connect to database
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
