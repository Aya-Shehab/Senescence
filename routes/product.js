import express from "express";
import { 
    getAllProducts,
    getProductById, 
    createProduct,
    updateProduct,
    deleteProduct 
} from "../controllers/product.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Get all products
router.get("/", getAllProducts);

// Get product by ID
router.get("/:id", getProductById);

// Create new product (admin only)
router.post("/", isAuthenticated, isAdmin, createProduct);

// Update product (admin only)
router.put("/:id", isAuthenticated, isAdmin, updateProduct);

// Delete product (admin only)
router.delete("/:id", isAuthenticated, isAdmin, deleteProduct);

export default router;