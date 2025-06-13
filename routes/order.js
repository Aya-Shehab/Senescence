import express from 'express';
import {
  placeOrder,
  getUserOrders,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  paymentCallback
} from '../controllers/order.js';
import { isAuthenticated, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// User functions
router.post('/:userId', placeOrder);
router.get('/user/:userId', getUserOrders);

// Admin functions
router.get('/', isAuthenticated, isAdmin, getAllOrders);
router.put('/status/:orderId', isAuthenticated, isAdmin, updateOrderStatus);
router.put('/cancel/:orderId', isAuthenticated, isAdmin, cancelOrder);
router.delete('/:orderId', isAuthenticated, isAdmin, cancelOrder);

export default router;
