import prisma from '../../config/database';
import { EventStatus, DevisStatus } from '@prisma/client';

export class EventsService {
  async createEvent(userId: string, data: {
    eventType: string;
    title: string;
    eventDate: string;
    guestCount: number;
    venue?: string;
    notes?: string;
    budget?: number;
  }) {
    return prisma.event.create({
      data: {
        userId,
        eventType: data.eventType as any,
        title: data.title,
        eventDate: new Date(data.eventDate),
        guestCount: data.guestCount,
        venue: data.venue,
        notes: data.notes,
        budget: data.budget,
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
      },
    });
  }

  async getEvents(params: {
    userId?: string;
    status?: EventStatus;
    page?: number;
    limit?: number;
    isAdmin?: boolean;
  }) {
    const { userId, status, page = 1, limit = 10, isAdmin = false } = params;
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));
    const where: any = {};
    if (!isAdmin && userId) where.userId = userId;
    if (status) where.status = status;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, email: true, phone: true } },
          devis: { select: { id: true, devisNumber: true, totalAmount: true, status: true } },
        },
        orderBy: { eventDate: 'desc' },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      }),
      prisma.event.count({ where }),
    ]);

    return { events, pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } };
  }

  async getEventById(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true, address: true } },
        devis: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!event) throw { status: 404, message: 'Événement non trouvé.' };
    return event;
  }

  async updateEvent(id: string, data: any) {
    if (data.eventDate) data.eventDate = new Date(data.eventDate);
    if (data.guestCount) data.guestCount = parseInt(data.guestCount);
    if (data.budget) data.budget = parseFloat(data.budget);
    return prisma.event.update({
      where: { id },
      data,
      include: {
        user: { select: { firstName: true, lastName: true } },
        devis: { select: { id: true, devisNumber: true, totalAmount: true, status: true } },
      },
    });
  }

  async updateEventStatus(id: string, status: EventStatus) {
    return prisma.event.update({ where: { id }, data: { status } });
  }

  // Devis
  async createDevis(eventId: string, data: {
    items: Array<{ description: string; quantity: number; unitPrice: number }>;
    validUntil: string;
    notes?: string;
  }) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw { status: 404, message: 'Événement non trouvé.' };

    const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const count = await prisma.devis.count();
    const devisNumber = `DEV-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const devis = await prisma.devis.create({
      data: {
        devisNumber,
        eventId,
        totalAmount,
        validUntil: new Date(data.validUntil),
        notes: data.notes,
        status: DevisStatus.DRAFT,
        items: { create: data.items },
      },
      include: { items: true, event: { include: { user: { select: { firstName: true, lastName: true } } } } },
    });

    // Update event status to QUOTED
    await prisma.event.update({ where: { id: eventId }, data: { status: EventStatus.QUOTED } });

    return devis;
  }

  async updateDevis(id: string, data: any) {
    return prisma.devis.update({
      where: { id },
      data,
      include: { items: true },
    });
  }

  async sendDevis(id: string) {
    return prisma.devis.update({
      where: { id },
      data: { status: DevisStatus.SENT },
    });
  }

  async acceptDevis(id: string) {
    const devis = await prisma.devis.findUnique({ where: { id }, include: { event: true } });
    if (!devis) throw { status: 404, message: 'Devis non trouvé.' };

    await prisma.$transaction([
      prisma.devis.update({ where: { id }, data: { status: DevisStatus.ACCEPTED } }),
      prisma.event.update({ where: { id: devis.eventId }, data: { status: EventStatus.CONFIRMED } }),
    ]);

    return { message: 'Devis accepté et événement confirmé.' };
  }

  async rejectDevis(id: string) {
    return prisma.devis.update({
      where: { id },
      data: { status: DevisStatus.REJECTED },
    });
  }

  async getDevisById(id: string) {
    const devis = await prisma.devis.findUnique({
      where: { id },
      include: {
        items: true,
        event: {
          include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } },
        },
      },
    });
    if (!devis) throw { status: 404, message: 'Devis non trouvé.' };
    return devis;
  }
}
