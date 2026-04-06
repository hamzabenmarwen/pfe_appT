import { Request, Response, NextFunction } from 'express';
import { InvoicesService } from './invoices.service';
import path from 'path';

const service = new InvoicesService();

export class InvoicesController {
  async createFromOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.body;
      if (!orderId) { res.status(400).json({ error: 'L\'ID de la commande est requis.' }); return; }
      res.status(201).json(await service.createInvoiceFromOrder(orderId));
    } catch (err) { next(err); }
  }

  async createFromDevis(req: Request, res: Response, next: NextFunction) {
    try {
      const { devisId } = req.body;
      if (!devisId) { res.status(400).json({ error: 'L\'ID du devis est requis.' }); return; }
      res.status(201).json(await service.createInvoiceFromDevis(devisId));
    } catch (err) { next(err); }
  }

  async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query;
      const isAdmin = req.user!.role === 'ADMIN';
      res.json(await service.getInvoices({
        userId: req.user!.userId, status: status as any,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        isAdmin,
      }));
    } catch (err) { next(err); }
  }

  async markAsPaid(req: Request, res: Response, next: NextFunction) {
    try { res.json(await service.markAsPaid(req.params.id)); } catch (err) { next(err); }
  }

  async downloadPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const pdfUrl = await service.getInvoicePdfPath(req.params.id);
      const filePath = path.join(process.cwd(), pdfUrl);
      res.download(filePath);
    } catch (err) { next(err); }
  }
}
