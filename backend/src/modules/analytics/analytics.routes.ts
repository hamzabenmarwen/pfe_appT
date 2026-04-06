import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticate, authorizeAdmin } from '../../middleware/auth';

const router = Router();
const c = new AnalyticsController();

router.get('/overview', authenticate, authorizeAdmin, (req, res, next) => c.getOverview(req, res, next));
router.get('/top-plats', authenticate, authorizeAdmin, (req, res, next) => c.getTopPlats(req, res, next));
router.get('/orders-by-status', authenticate, authorizeAdmin, (req, res, next) => c.getOrdersByStatus(req, res, next));
router.get('/revenue', authenticate, authorizeAdmin, (req, res, next) => c.getRevenue(req, res, next));

export default router;
