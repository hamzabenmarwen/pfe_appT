import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { OrdersService } from './orders.service';
import { validateBody, validateQuery } from '../../utils/validation';

const service = new OrdersService();

const orderItemSchema = z.object({
  platId: z.string().uuid('platId invalide.'),
  quantity: z.number().int().positive('La quantite doit etre un entier positif.'),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'La commande doit contenir au moins un article.'),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
});

const getOrdersQuerySchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

const productionBoardQuerySchema = z.object({
  mode: z.enum(['active', 'range']).optional(),
  date: z.string().optional(),
  windowDays: z.coerce.number().int().min(1).max(14).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'PREPARING', 'DELIVERING', 'DELIVERED', 'CANCELLED']),
});

export class OrdersController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { items, deliveryAddress, notes } = validateBody(createOrderSchema, req.body);
      const order = await service.createOrder(req.user!.userId, { items, deliveryAddress, notes });
      res.status(201).json(order);
    } catch (err) { next(err); }
  }

  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = validateQuery(getOrdersQuerySchema, req.query);
      const isAdmin = req.user!.role === 'ADMIN';
      const result = await service.getOrders({
        userId: req.user!.userId,
        status: status as any,
        page,
        limit,
        isAdmin,
      });
      res.json(result);
    } catch (err) { next(err); }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try { res.json(await service.getOrderById(req.params.id)); } catch (err) { next(err); }
  }

  async getProductionBoard(req: Request, res: Response, next: NextFunction) {
    try {
      const { mode, date, windowDays } = validateQuery(productionBoardQuerySchema, req.query);
      res.json(await service.getProductionBoard({ mode, date, windowDays }));
    } catch (err) { next(err); }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = validateBody(updateStatusSchema, req.body);
      res.json(await service.updateOrderStatus(req.params.id, status));
    } catch (err) { next(err); }
  }
}
