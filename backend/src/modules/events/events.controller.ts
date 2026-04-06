import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { EventsService } from './events.service';
import { validateBody, validateQuery } from '../../utils/validation';

const service = new EventsService();

const createEventSchema = z.object({
  eventType: z.enum(['WEDDING', 'SEMINAR', 'BIRTHDAY', 'CORPORATE', 'OTHER']),
  title: z.string().min(2, 'Le titre est requis.'),
  eventDate: z.string().min(1, 'La date est requise.'),
  guestCount: z.coerce.number().int().positive('Le nombre d invites doit etre positif.'),
  venue: z.string().optional(),
  notes: z.string().optional(),
  budget: z.coerce.number().positive().optional(),
});

const getEventsQuerySchema = z.object({
  status: z.enum(['PENDING', 'QUOTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'QUOTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
});

const devisItemSchema = z.object({
  description: z.string().min(1, 'Description requise.'),
  quantity: z.coerce.number().int().positive('Quantite invalide.'),
  unitPrice: z.coerce.number().positive('Prix unitaire invalide.'),
});

const createDevisSchema = z.object({
  items: z.array(devisItemSchema).min(1, 'Au moins un article est requis.'),
  validUntil: z.string().min(1, 'Date de validite requise.'),
  notes: z.string().optional(),
});

export class EventsController {
  async createEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventType, title, eventDate, guestCount, venue, notes, budget } = validateBody(createEventSchema, req.body);
      res.status(201).json(await service.createEvent(req.user!.userId, {
        eventType, title, eventDate, guestCount, venue, notes,
        budget,
      }));
    } catch (err) { next(err); }
  }

  async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = validateQuery(getEventsQuerySchema, req.query);
      const isAdmin = req.user!.role === 'ADMIN';
      res.json(await service.getEvents({
        userId: req.user!.userId, status: status as any,
        page,
        limit,
        isAdmin,
      }));
    } catch (err) { next(err); }
  }

  async getEventById(req: Request, res: Response, next: NextFunction) {
    try { res.json(await service.getEventById(req.params.id)); } catch (err) { next(err); }
  }

  async updateEvent(req: Request, res: Response, next: NextFunction) {
    try { res.json(await service.updateEvent(req.params.id, req.body)); } catch (err) { next(err); }
  }

  async updateEventStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = validateBody(updateStatusSchema, req.body);
      res.json(await service.updateEventStatus(req.params.id, status));
    } catch (err) { next(err); }
  }

  async createDevis(req: Request, res: Response, next: NextFunction) {
    try {
      const { items, validUntil, notes } = validateBody(createDevisSchema, req.body);
      res.status(201).json(await service.createDevis(req.params.id, { items, validUntil, notes }));
    } catch (err) { next(err); }
  }

  async updateDevis(req: Request, res: Response, next: NextFunction) {
    try { res.json(await service.updateDevis(req.params.id, req.body)); } catch (err) { next(err); }
  }

  async sendDevis(req: Request, res: Response, next: NextFunction) {
    try { res.json(await service.sendDevis(req.params.id)); } catch (err) { next(err); }
  }

  async acceptDevis(req: Request, res: Response, next: NextFunction) {
    try { res.json(await service.acceptDevis(req.params.id)); } catch (err) { next(err); }
  }

  async rejectDevis(req: Request, res: Response, next: NextFunction) {
    try { res.json(await service.rejectDevis(req.params.id)); } catch (err) { next(err); }
  }

  async getDevisById(req: Request, res: Response, next: NextFunction) {
    try { res.json(await service.getDevisById(req.params.id)); } catch (err) { next(err); }
  }
}
