import express from "express";
import {
  createCustomOrder,
  getAllCustomOrders,
  getCustomOrderById,
  deleteCustomOrder,
} from "../controllers/customOrder.js";

const router = express.Router();

router.post("/", createCustomOrder);
router.get("/", getAllCustomOrders);    
router.get("/:id", getCustomOrderById);
router.delete("/:id", deleteCustomOrder);

export default router;