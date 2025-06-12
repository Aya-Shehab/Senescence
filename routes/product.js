import express from "express";
import { 
    getAllProducts,
    getProductById, 
    createProduct, 
    deleteProduct 
} from "../controllers/product.js";

const router = express.Router();

router.post("/", createProduct);
router.get("/",  getAllProducts);
router.get("/:id", getProductById);
router.delete("/:id", deleteProduct);

export default router;