import mongoose from 'mongoose';
import express from 'express';

const router = express.Router();

const customOrderSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  address: String,
  description: String, // What the customer wants
  imageUrl: String,
  preferredDate: Date,
  notes: String,
  status: { type: String, enum: ['pending', 'processing', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const CustomOrder = mongoose.model('CustomOrder', customOrderSchema);
export default CustomOrder;

router.get("/", async (req, res) => {
  try {
    const orders = await CustomOrder.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch custom orders" });
  }
});
