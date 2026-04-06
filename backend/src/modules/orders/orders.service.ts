import prisma from '../../config/database';
import { OrderStatus } from '@prisma/client';

export class OrdersService {
  private readonly laneOrder: OrderStatus[] = ['PENDING', 'PREPARING', 'DELIVERING', 'DELIVERED'];

  async createOrder(userId: string, data: {
    items: Array<{ platId: string; quantity: number }>;
    deliveryAddress?: string;
    notes?: string;
  }) {
    // Validate items and get prices
    const platIds = data.items.map(i => i.platId);
    const plats = await prisma.plat.findMany({ where: { id: { in: platIds } } });

    if (plats.length !== platIds.length) {
      throw { status: 400, message: 'Un ou plusieurs plats sont invalides.' };
    }

    // Check stock & availability
    for (const item of data.items) {
      const plat = plats.find(p => p.id === item.platId);
      if (!plat?.available) throw { status: 400, message: `Le plat "${plat?.name}" n'est pas disponible.` };
      if (plat.stockQuantity < item.quantity) {
        throw { status: 400, message: `Stock insuffisant pour "${plat.name}". Disponible: ${plat.stockQuantity}` };
      }
    }

    // Calculate total
    let totalAmount = 0;
    const orderItems = data.items.map(item => {
      const plat = plats.find(p => p.id === item.platId)!;
      const unitPrice = plat.price;
      totalAmount += unitPrice * item.quantity;
      return { platId: item.platId, quantity: item.quantity, unitPrice };
    });

    // Generate order number
    const count = await prisma.order.count();
    const orderNumber = `CMD-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    // Create order & update stock
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          totalAmount,
          deliveryAddress: data.deliveryAddress,
          notes: data.notes,
          items: { create: orderItems },
        },
        include: {
          items: { include: { plat: { select: { name: true, image: true } } } },
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      });

      // Decrease stock
      for (const item of data.items) {
        await tx.plat.update({
          where: { id: item.platId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      // Add loyalty points (1 point per 10 TND)
      const points = Math.floor(totalAmount / 10);
      if (points > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { loyaltyPoints: { increment: points } },
        });
      }

      return newOrder;
    });

    return order;
  }

  async getOrders(params: {
    userId?: string;
    status?: OrderStatus;
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

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: { include: { plat: { select: { name: true, image: true } } } },
          user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
    };
  }

  async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { plat: true } },
        user: { select: { firstName: true, lastName: true, email: true, phone: true, address: true } },
        invoice: true,
      },
    });
    if (!order) throw { status: 404, message: 'Commande non trouvée.' };
    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      PREPARING: [OrderStatus.DELIVERING, OrderStatus.CANCELLED],
      DELIVERING: [OrderStatus.DELIVERED],
      DELIVERED: [],
      CANCELLED: [],
    };

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw { status: 404, message: 'Commande non trouvée.' };

    if (!validTransitions[order.status].includes(status)) {
      throw { status: 400, message: `Transition de statut invalide : ${order.status} → ${status}` };
    }

    // If cancelling, restore stock
    if (status === OrderStatus.CANCELLED) {
      const items = await prisma.orderItem.findMany({ where: { orderId: id } });
      await prisma.$transaction(async (tx) => {
        for (const item of items) {
          await tx.plat.update({
            where: { id: item.platId },
            data: { stockQuantity: { increment: item.quantity } },
          });
        }
        return tx.order.update({ where: { id }, data: { status } });
      });
    }

    return prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: { include: { plat: { select: { name: true } } } },
        user: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async getProductionBoard(params: { mode?: 'active' | 'range'; date?: string; windowDays?: number }) {
    const mode = params.mode || 'active';
    const selectedDate = params.date ? new Date(params.date) : new Date();
    const windowDays = Math.min(14, Math.max(1, params.windowDays || 1));

    if (Number.isNaN(selectedDate.getTime())) {
      throw { status: 400, message: 'Date invalide.' };
    }

    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + windowDays);

    const where: any = {};
    if (mode === 'active') {
      where.status = { in: ['PENDING', 'PREPARING', 'DELIVERING'] };
    } else {
      where.createdAt = { gte: start, lt: end };
      where.status = { not: 'CANCELLED' };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, phone: true } },
        items: { include: { plat: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const lanes = this.laneOrder.map((status) => ({
      status,
      label: this.toStatusLabel(status),
      orders: orders
        .filter((o) => o.status === status)
        .map((o) => ({
          ...o,
          workloadPoints: o.items.reduce((sum, item) => sum + item.quantity, 0),
          slotLabel: this.toSlotLabel(o.createdAt),
        })),
    }));

    const slotMap = new Map<string, { ordersCount: number; workloadPoints: number }>();
    for (const order of orders) {
      const slot = this.toSlotLabel(order.createdAt);
      const workloadPoints = order.items.reduce((sum, item) => sum + item.quantity, 0);
      const current = slotMap.get(slot) || { ordersCount: 0, workloadPoints: 0 };
      slotMap.set(slot, {
        ordersCount: current.ordersCount + 1,
        workloadPoints: current.workloadPoints + workloadPoints,
      });
    }

    const slotCapacity = Number(process.env.SLOT_CAPACITY_POINTS || 30);
    const slotWorkload = Array.from(slotMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([slot, info]) => ({
        slot,
        ...info,
        capacity: slotCapacity,
        isOverCapacity: info.workloadPoints > slotCapacity,
      }));

    const backlogCount = lanes
      .filter((l) => l.status === 'PENDING' || l.status === 'PREPARING')
      .reduce((sum, l) => sum + l.orders.length, 0);

    return {
      range: {
        from: start.toISOString(),
        to: end.toISOString(),
        windowDays,
        mode,
      },
      summary: {
        totalOrders: orders.length,
        backlogCount,
        slotCapacity,
        overloadedSlots: slotWorkload.filter((s) => s.isOverCapacity).length,
      },
      lanes,
      slotWorkload,
    };
  }

  private toStatusLabel(status: OrderStatus): string {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'PREPARING': return 'En preparation';
      case 'DELIVERING': return 'En livraison';
      case 'DELIVERED': return 'Livrees';
      case 'CANCELLED': return 'Annulees';
      default: return status;
    }
  }

  private toSlotLabel(date: Date): string {
    const hour = date.getHours();
    const slotStart = Math.floor(hour / 2) * 2;
    const slotEnd = slotStart + 2;
    const format = (h: number) => String(h).padStart(2, '0');
    return `${format(slotStart)}:00-${format(slotEnd)}:00`;
  }
}
