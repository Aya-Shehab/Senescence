import express from 'express';
import { getSalesAnalytics, getDashboardOverview } from '../controllers/admin.js';
import { isAuthenticated, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Dashboard Overview Route
router.get('/dashboard-overview', isAuthenticated, isAdmin, getDashboardOverview);

// Sales Analytics Route
router.get('/sales-analytics', isAuthenticated, isAdmin, getSalesAnalytics);

export default router; 