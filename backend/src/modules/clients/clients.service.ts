import prisma from '../../config/database';

export class ClientsService {
  async getClients(params: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 10 } = params;
    const where: any = { role: 'CLIENT' };
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [clients, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, email: true, firstName: true, lastName: true, phone: true,
          address: true, loyaltyPoints: true, isActive: true, createdAt: true,
          _count: { select: { orders: true, events: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { clients, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getClientById(id: string) {
    const client = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true,
        address: true, loyaltyPoints: true, isActive: true, createdAt: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { id: true, orderNumber: true, status: true, totalAmount: true, createdAt: true },
        },
        events: {
          orderBy: { eventDate: 'desc' },
          take: 5,
          select: { id: true, title: true, eventType: true, eventDate: true, status: true },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { plat: { select: { name: true } } },
        },
        _count: { select: { orders: true, events: true, reviews: true } },
      },
    });
    if (!client) throw { status: 404, message: 'Client non trouvé.' };
    return client;
  }

  async updateLoyaltyPoints(id: string, points: number) {
    return prisma.user.update({
      where: { id },
      data: { loyaltyPoints: points },
      select: { id: true, firstName: true, lastName: true, loyaltyPoints: true },
    });
  }

  async toggleClientStatus(id: string) {
    const client = await prisma.user.findUnique({ where: { id } });
    if (!client) throw { status: 404, message: 'Client non trouvé.' };
    return prisma.user.update({
      where: { id },
      data: { isActive: !client.isActive },
      select: { id: true, firstName: true, lastName: true, isActive: true },
    });
  }
}
