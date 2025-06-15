import express from 'express';
import {
  placeOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  paymentCallback,
  deleteOrder
} from '../controllers/order.js';
import { isAuthenticated, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// user functions
router.post('/:userId', placeOrder);
router.post('/paymob/callback', paymentCallback);
router.get('/user/:userId', getUserOrders);

// admin functions
router.get('/', isAuthenticated, isAdmin, getAllOrders);
router.put('/status/:orderId', isAuthenticated, isAdmin, updateOrderStatus);
router.delete('/:orderId', isAuthenticated, isAdmin, deleteOrder);

export default router;
