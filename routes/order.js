import express from 'express';
import {
  placeOrder,
  getUserOrders,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  paymentCallback
} from '../controllers/order.js';

const router = express.Router();
//user functions
router.post('/:userId', placeOrder);
router.post('/callback', paymentCallback);
router.get('/user/:userId', getUserOrders);
router.put('/cancel/:orderId', cancelOrder);
//admin functions
router.get('/', getAllOrders);
router.put('/status/:orderId', updateOrderStatus);

export default router;
