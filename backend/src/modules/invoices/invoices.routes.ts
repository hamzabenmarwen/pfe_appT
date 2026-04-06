import { Router } from 'express';
import { InvoicesController } from './invoices.controller';
import { authenticate, authorizeAdmin } from '../../middleware/auth';

const router = Router();
const c = new InvoicesController();

router.get('/', authenticate, (req, res, next) => c.getInvoices(req, res, next));
router.post('/from-order', authenticate, authorizeAdmin, (req, res, next) => c.createFromOrder(req, res, next));
router.post('/from-devis', authenticate, authorizeAdmin, (req, res, next) => c.createFromDevis(req, res, next));
router.put('/:id/paid', authenticate, authorizeAdmin, (req, res, next) => c.markAsPaid(req, res, next));
router.get('/:id/pdf', authenticate, (req, res, next) => c.downloadPdf(req, res, next));

export default router;
