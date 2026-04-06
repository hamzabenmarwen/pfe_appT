import { Router } from 'express';
import { EventsController } from './events.controller';
import { authenticate, authorizeAdmin } from '../../middleware/auth';

const router = Router();
const c = new EventsController();

// Events
router.post('/', authenticate, (req, res, next) => c.createEvent(req, res, next));
router.get('/', authenticate, (req, res, next) => c.getEvents(req, res, next));
router.get('/:id', authenticate, (req, res, next) => c.getEventById(req, res, next));
router.put('/:id', authenticate, authorizeAdmin, (req, res, next) => c.updateEvent(req, res, next));
router.put('/:id/status', authenticate, authorizeAdmin, (req, res, next) => c.updateEventStatus(req, res, next));

// Devis
router.post('/:id/devis', authenticate, authorizeAdmin, (req, res, next) => c.createDevis(req, res, next));
router.get('/devis/:id', authenticate, (req, res, next) => c.getDevisById(req, res, next));
router.put('/devis/:id', authenticate, authorizeAdmin, (req, res, next) => c.updateDevis(req, res, next));
router.put('/devis/:id/send', authenticate, authorizeAdmin, (req, res, next) => c.sendDevis(req, res, next));
router.put('/devis/:id/accept', authenticate, (req, res, next) => c.acceptDevis(req, res, next));
router.put('/devis/:id/reject', authenticate, (req, res, next) => c.rejectDevis(req, res, next));

export default router;
