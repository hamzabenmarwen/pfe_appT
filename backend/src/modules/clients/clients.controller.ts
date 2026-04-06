import { Request, Response, NextFunction } from 'express';
import { ClientsService } from './clients.service';

const service = new ClientsService();

export class ClientsController {
  async getClients(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, page, limit } = req.query;
      res.json(await service.getClients({
        search: search as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      }));
    } catch (err) { next(err); }
  }

  async getClientById(req: Request, res: Response, next: NextFunction) {
    try { res.json(await service.getClientById(req.params.id)); } catch (err) { next(err); }
  }

  async updateLoyaltyPoints(req: Request, res: Response, next: NextFunction) {
    try {
      const { points } = req.body;
      if (points === undefined) { res.status(400).json({ error: 'Les points sont requis.' }); return; }
      res.json(await service.updateLoyaltyPoints(req.params.id, parseInt(points)));
    } catch (err) { next(err); }
  }

  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try { res.json(await service.toggleClientStatus(req.params.id)); } catch (err) { next(err); }
  }
}
