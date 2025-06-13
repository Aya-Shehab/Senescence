import express from "express";
import {
  createCustomOrder,
  getAllCustomOrders,
  getCustomOrderById,
  deleteCustomOrder,
  updateCustomOrder
} from "../controllers/customOrder.js";
import multer from "multer";
import path from "path";

const router = express.Router();

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

// Custom order routes
router.post("/", upload.single("imageUrl"), createCustomOrder);
router.get("/", getAllCustomOrders);
router.get("/:id", getCustomOrderById);
router.put("/:id", updateCustomOrder);
router.delete("/:id", deleteCustomOrder);

export default router;