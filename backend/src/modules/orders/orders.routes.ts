import { Router } from 'express';
import { OrdersController } from './orders.controller';
import { authenticate, authorizeAdmin } from '../../middleware/auth';

const router = Router();
const controller = new OrdersController();

router.post('/', authenticate, (req, res, next) => controller.createOrder(req, res, next));
router.get('/', authenticate, (req, res, next) => controller.getOrders(req, res, next));
router.get('/production/board', authenticate, authorizeAdmin, (req, res, next) => controller.getProductionBoard(req, res, next));
router.get('/:id', authenticate, (req, res, next) => controller.getOrderById(req, res, next));
router.put('/:id/status', authenticate, authorizeAdmin, (req, res, next) => controller.updateStatus(req, res, next));

export default router;
