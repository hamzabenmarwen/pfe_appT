import { Router } from 'express';
import { ClientsController } from './clients.controller';
import { authenticate, authorizeAdmin } from '../../middleware/auth';

const router = Router();
const c = new ClientsController();

router.get('/', authenticate, authorizeAdmin, (req, res, next) => c.getClients(req, res, next));
router.get('/:id', authenticate, authorizeAdmin, (req, res, next) => c.getClientById(req, res, next));
router.put('/:id/loyalty', authenticate, authorizeAdmin, (req, res, next) => c.updateLoyaltyPoints(req, res, next));
router.put('/:id/toggle-status', authenticate, authorizeAdmin, (req, res, next) => c.toggleStatus(req, res, next));

export default router;
