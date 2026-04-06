import prisma from '../../config/database';
import { InvoiceStatus } from '@prisma/client';
import { generateInvoicePDF } from '../../utils/pdf';

export class InvoicesService {
  async createInvoiceFromOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: { include: { plat: { select: { name: true } } } },
        invoice: true,
      },
    });
    if (!order) throw { status: 404, message: 'Commande non trouvée.' };
    if (order.invoice) throw { status: 409, message: 'Une facture existe déjà pour cette commande.' };

    const count = await prisma.invoice.count();
    const invoiceNumber = `FAC-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Generate PDF
    const pdfUrl = await generateInvoicePDF({
      invoiceNumber,
      date: new Date().toLocaleDateString('fr-FR'),
      dueDate: dueDate.toLocaleDateString('fr-FR'),
      customerName: `${order.user.firstName} ${order.user.lastName}`,
      customerEmail: order.user.email,
      customerAddress: order.user.address || '',
      customerPhone: order.user.phone || '',
      items: order.items.map(item => ({
        description: item.plat.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      totalAmount: order.totalAmount,
      status: 'En attente',
    });

    return prisma.invoice.create({
      data: {
        invoiceNumber,
        userId: order.userId,
        orderId: order.id,
        amount: order.totalAmount,
        pdfUrl,
        dueDate,
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        order: { select: { orderNumber: true } },
      },
    });
  }

  async createInvoiceFromDevis(devisId: string) {
    const devis = await prisma.devis.findUnique({
      where: { id: devisId },
      include: {
        event: { include: { user: true } },
        items: true,
        invoice: true,
      },
    });
    if (!devis) throw { status: 404, message: 'Devis non trouvé.' };
    if (devis.invoice) throw { status: 409, message: 'Une facture existe déjà pour ce devis.' };

    const count = await prisma.invoice.count();
    const invoiceNumber = `FAC-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const pdfUrl = await generateInvoicePDF({
      invoiceNumber,
      date: new Date().toLocaleDateString('fr-FR'),
      dueDate: dueDate.toLocaleDateString('fr-FR'),
      customerName: `${devis.event.user.firstName} ${devis.event.user.lastName}`,
      customerEmail: devis.event.user.email,
      customerAddress: devis.event.user.address || '',
      customerPhone: devis.event.user.phone || '',
      items: devis.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      totalAmount: devis.totalAmount,
      status: 'En attente',
    });

    return prisma.invoice.create({
      data: {
        invoiceNumber,
        userId: devis.event.userId,
        devisId: devis.id,
        amount: devis.totalAmount,
        pdfUrl,
        dueDate,
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        devis: { select: { devisNumber: true } },
      },
    });
  }

  async getInvoices(params: { userId?: string; status?: InvoiceStatus; page?: number; limit?: number; isAdmin?: boolean }) {
    const { userId, status, page = 1, limit = 10, isAdmin = false } = params;
    const where: any = {};
    if (!isAdmin && userId) where.userId = userId;
    if (status) where.status = status;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          order: { select: { orderNumber: true } },
          devis: { select: { devisNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return { invoices, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async markAsPaid(id: string) {
    return prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.PAID, paidAt: new Date() },
    });
  }

  async getInvoicePdfPath(id: string) {
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice || !invoice.pdfUrl) throw { status: 404, message: 'Facture non trouvée.' };
    return invoice.pdfUrl;
  }
}
