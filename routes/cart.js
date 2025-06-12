import express from 'express';
import { 
    addToCart, 
    getCart, 
    updateCartItem, 
    removeFromCart, 
} from '../controllers/cart.js';

const router = express.Router();

router.post('/:userId/add/:productId', addToCart);
router.delete('/:userId/item/:productId', removeFromCart);
router.get('/:userId', getCart);
router.put('/:userId/item/:productId', updateCartItem);

export default router;