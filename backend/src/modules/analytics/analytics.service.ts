import prisma from '../../config/database';

export class AnalyticsService {
  async getOverview() {
    const [
      totalOrders, totalRevenue, totalClients, totalPlats,
      pendingOrders, activeEvents, lowStockCount
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { not: 'CANCELLED' } } }),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.plat.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.event.count({ where: { status: { in: ['PENDING', 'QUOTED', 'CONFIRMED'] } } }),
      prisma.plat.count({ where: { stockQuantity: { lte: 5 } } }),
    ]);

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true } },
        items: { include: { plat: { select: { name: true } } } },
      },
    });

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyOrders = await prisma.order.findMany({
      where: { 
        createdAt: { gte: sixMonthsAgo },
        status: { not: 'CANCELLED' },
      },
      select: { totalAmount: true, createdAt: true },
    });

    const monthlyRevenue: Record<string, number> = {};
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      monthlyRevenue[key] = 0;
    }

    monthlyOrders.forEach(order => {
      const d = new Date(order.createdAt);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      if (monthlyRevenue[key] !== undefined) {
        monthlyRevenue[key] += order.totalAmount;
      }
    });

    return {
      kpis: {
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalClients,
        totalPlats,
        pendingOrders,
        activeEvents,
        lowStockCount,
      },
      recentOrders,
      monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue })),
    };
  }

  async getTopPlats(limit: number = 10) {
    const items = await prisma.orderItem.groupBy({
      by: ['platId'],
      _sum: { quantity: true },
      _count: true,
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    const platIds = items.map(i => i.platId);
    const plats = await prisma.plat.findMany({
      where: { id: { in: platIds } },
      select: { id: true, name: true, price: true, image: true, category: { select: { name: true } } },
    });

    return items.map(item => {
      const plat = plats.find(p => p.id === item.platId);
      return {
        ...plat,
        totalQuantitySold: item._sum.quantity || 0,
        totalOrders: item._count,
      };
    });
  }

  async getOrdersByStatus() {
    const statuses = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
    });

    const statusLabels: Record<string, string> = {
      PENDING: 'En attente',
      PREPARING: 'En préparation',
      DELIVERING: 'En livraison',
      DELIVERED: 'Livrée',
      CANCELLED: 'Annulée',
    };

    return statuses.map(s => ({
      status: s.status,
      label: statusLabels[s.status] || s.status,
      count: s._count,
    }));
  }

  async getRevenueByPeriod(period: 'day' | 'week' | 'month' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        break;
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 12 * 7);
        break;
      default:
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' },
      },
      select: { totalAmount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    return orders;
  }
}
