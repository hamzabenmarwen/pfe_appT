import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';

const service = new AnalyticsService();

export class AnalyticsController {
  async getOverview(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await service.getOverview()); } catch (err) { next(err); }
  }

  async getTopPlats(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      res.json(await service.getTopPlats(limit));
    } catch (err) { next(err); }
  }

  async getOrdersByStatus(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await service.getOrdersByStatus()); } catch (err) { next(err); }
  }

  async getRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const period = (req.query.period as any) || 'month';
      res.json(await service.getRevenueByPeriod(period));
    } catch (err) { next(err); }
  }
}
