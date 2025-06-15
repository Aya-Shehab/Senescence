import express from "express";
import { 
    getAllProducts,
    getProductById, 
    createProduct,
    updateProduct,
    deleteProduct 
} from "../controllers/product.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configure multer storage (reuse uploads folder)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Get all products
router.get("/", getAllProducts);

// Get product by ID
router.get("/:id", getProductById);

// Create new product (admin only)
router.post("/", isAuthenticated, isAdmin, upload.single("imageUrl"), createProduct);

// Update product (admin only)
router.put("/:id", isAuthenticated, isAdmin, upload.single("imageUrl"), updateProduct);

// Delete product (admin only)
router.delete("/:id", isAuthenticated, isAdmin, deleteProduct);

export default router;