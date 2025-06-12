import express from 'express';
import { getShopPage } from '../controllers/shopController.js';

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
    console.log('Shop route accessed:', req.method, req.url);
    next();
});

// Shop page route - handle both root and with query parameters
router.get('/', getShopPage);
router.get('/:category', getShopPage);

export default router; 