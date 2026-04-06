import prisma from '../../config/database';
const allowInMemoryFallback = process.env.ALLOW_IN_MEMORY_FALLBACK === 'true' || process.env.NODE_ENV !== 'production';

type MemoryCategory = {
  id: string;
  name: string;
  description?: string;
  image?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

type MemoryPlat = {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  allergens: string[];
  available: boolean;
  stockQuantity: number;
  preparationTime?: number;
  categoryId: string;
  isPlatDuJour: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type MemoryReview = {
  id: string;
  userId: string;
  platId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
};

function isDbUnavailableError(err: any): boolean {
  const message = String(err?.message || '');
  return (
    err?.code === 'P1000' ||
    err?.code === 'P1001' ||
    message.includes('Authentication failed against database server') ||
    message.includes("Can't reach database server") ||
    message.includes('ECONNREFUSED')
  );
}

function shouldUseMemoryFallback(err: any): boolean {
  return allowInMemoryFallback && isDbUnavailableError(err);
}

const now = new Date();
const memoryCategories: MemoryCategory[] = [
  {
    id: 'cat-signature',
    name: 'Signature',
    description: 'Selections premium de la maison',
    sortOrder: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'cat-events',
    name: 'Evenements',
    description: 'Offres adaptees aux receptions',
    sortOrder: 2,
    createdAt: now,
    updatedAt: now,
  },
];

const memoryPlats: MemoryPlat[] = [
  {
    id: 'plat-mini-verrines',
    name: 'Mini Verrines Gourmet',
    description: 'Assortiment raffine de verrines salees et sucrees',
    price: 7.5,
    allergens: ['lait'],
    available: true,
    stockQuantity: 60,
    preparationTime: 25,
    categoryId: 'cat-signature',
    isPlatDuJour: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'plat-buffet-mediterraneen',
    name: 'Buffet Mediterraneen',
    description: 'Plateaux mediterraneens pour 10 a 12 personnes',
    price: 145,
    allergens: ['gluten'],
    available: true,
    stockQuantity: 20,
    preparationTime: 60,
    categoryId: 'cat-events',
    isPlatDuJour: false,
    createdAt: now,
    updatedAt: now,
  },
];

const memoryReviews: MemoryReview[] = [];

export class CatalogueService {
  // === Categories ===
  async getCategories() {
    try {
      return await prisma.category.findMany({
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { plats: true } } },
      });
    } catch (err) {
      if (!shouldUseMemoryFallback(err)) throw err;
      return memoryCategories
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((c) => ({
          ...c,
          _count: { plats: memoryPlats.filter((p) => p.categoryId === c.id).length },
        }));
    }
  }

  async createCategory(data: { name: string; description?: string; image?: string; sortOrder?: number }) {
    try {
      return await prisma.category.create({ data });
    } catch (err) {
      if (!shouldUseMemoryFallback(err)) throw err;
      const category: MemoryCategory = {
        id: crypto.randomUUID(),
        name: data.name,
        description: data.description,
        image: data.image,
        sortOrder: data.sortOrder ?? memoryCategories.length + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryCategories.push(category);
      return category;
    }
  }

  async updateCategory(id: string, data: { name?: string; description?: string; image?: string; sortOrder?: number }) {
    try {
      return await prisma.category.update({ where: { id }, data });
    } catch (err) {
      if (!shouldUseMemoryFallback(err)) throw err;
      const category = memoryCategories.find((c) => c.id === id);
      if (!category) throw { status: 404, message: 'Categorie non trouvee.' };
      Object.assign(category, data, { updatedAt: new Date() });
      return category;
    }
  }

  async deleteCategory(id: string) {
    try {
      return await prisma.category.delete({ where: { id } });
    } catch (err) {
      if (!shouldUseMemoryFallback(err)) throw err;
      const idx = memoryCategories.findIndex((c) => c.id === id);
      if (idx === -1) throw { status: 404, message: 'Categorie non trouvee.' };
      const [deleted] = memoryCategories.splice(idx, 1);
      for (let i = memoryPlats.length - 1; i >= 0; i -= 1) {
        if (memoryPlats[i].categoryId === id) memoryPlats.splice(i, 1);
      }
      return deleted;
    }
  }

  // === Plats ===
  async getPlats(params: {
    categoryId?: string;
    search?: string;
    available?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const { categoryId, search, available, page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 12));

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (available !== undefined) where.available = available;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    try {
      const [plats, total] = await Promise.all([
        prisma.plat.findMany({
          where,
          include: {
            category: { select: { id: true, name: true } },
            reviews: { select: { rating: true } },
            _count: { select: { reviews: true } },
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (safePage - 1) * safeLimit,
          take: safeLimit,
        }),
        prisma.plat.count({ where }),
      ]);

      const platsWithRating = plats.map((plat) => {
        const avgRating = plat.reviews.length > 0
          ? plat.reviews.reduce((sum, r) => sum + r.rating, 0) / plat.reviews.length
          : 0;
        const { reviews, ...rest } = plat;
        return { ...rest, avgRating: Math.round(avgRating * 10) / 10 };
      });

      return {
        plats: platsWithRating,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages: Math.ceil(total / safeLimit),
        },
      };
    } catch (err) {
      if (!shouldUseMemoryFallback(err)) throw err;

      let plats = memoryPlats.slice();
      if (categoryId) plats = plats.filter((p) => p.categoryId === categoryId);
      if (available !== undefined) plats = plats.filter((p) => p.available === available);
      if (search) {
        const q = search.toLowerCase();
        plats = plats.filter((p) => (p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)) || (p.isPlatDuJour && 'plat du jour'.includes(q)));
      }

      plats.sort((a: any, b: any) => {
        const left = a[sortBy as keyof MemoryPlat];
        const right = b[sortBy as keyof MemoryPlat];
        if (left === right) return 0;
        if (sortOrder === 'asc') return left > right ? 1 : -1;
        return left < right ? 1 : -1;
      });

      const total = plats.length;
      const paged = plats.slice((safePage - 1) * safeLimit, (safePage - 1) * safeLimit + safeLimit);
      const payload = paged.map((p) => {
        const category = memoryCategories.find((c) => c.id === p.categoryId);
        const reviews = memoryReviews.filter((r) => r.platId === p.id);
        const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
        return {
          ...p,
          category: category ? { id: category.id, name: category.name } : null,
          _count: { reviews: reviews.length },
          avgRating: Math.round(avgRating * 10) / 10,
        };
      });

      return {
        plats: payload,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages: Math.ceil(total / safeLimit),
        },
      };
    }
  }

  async getPlatById(id: string) {
    try {
      const plat = await prisma.plat.findUnique({
        where: { id },
        include: {
          category: true,
          reviews: {
            include: { user: { select: { firstName: true, lastName: true } } },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      if (!plat) throw { status: 404, message: 'Plat non trouve.' };

      const avgRating = plat.reviews.length > 0
        ? plat.reviews.reduce((sum, r) => sum + r.rating, 0) / plat.reviews.length
        : 0;

      return { ...plat, avgRating: Math.round(avgRating * 10) / 10 };
    } catch (err) {
      if (!shouldUseMemoryFallback(err)) throw err;

      const plat = memoryPlats.find((p) => p.id === id);
      if (!plat) throw { status: 404, message: 'Plat non trouve.' };
      const category = memoryCategories.find((c) => c.id === plat.categoryId);
      const reviews = memoryReviews.filter((r) => r.platId === id);
      const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
      return {
        ...plat,
        category: category || null,
        reviews,
        avgRating: Math.round(avgRating * 10) / 10,
      };
    }
  }

  async createPlat(data: {
    name: string;
    description?: string;
    price: number;
    image?: string;
    allergens?: string[];
    available?: boolean;
    stockQuantity?: number;
    preparationTime?: number;
    categoryId: string;
    isPlatDuJour?: boolean;
  }) {
    try {
      return await prisma.plat.create({
        data,
        include: { category: { select: { id: true, name: true } } },
      });
    } catch (err) {
      if (!shouldUseMemoryFallback(err)) throw err;
      const plat: MemoryPlat = {
        id: crypto.randomUUID(),
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        allergens: data.allergens || [],
        available: data.available ?? true,
        stockQuantity: data.stockQuantity ?? 0,
        preparationTime: data.preparationTime,
        categoryId: data.categoryId,
        isPlatDuJour: data.isPlatDuJour ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryPlats.push(plat);
      const category = memoryCategories.find((c) => c.id === plat.categoryId);
      return {
        ...plat,
        category: category ? { id: category.id, name: category.name } : null,
      };
    }
  }

  async updatePlat(id: string, data: any) {
    try {
      return await prisma.plat.update({
        where: { id },
        data,
        include: { category: { select: { id: true, name: true } } },
      });
    } catch (err) {
      if (!shouldUseMemoryFallback(err)) throw err;
      const plat = memoryPlats.find((p) => p.id === id);
      if (!plat) throw { status: 404, message: 'Plat non trouve.' };
      Object.assign(plat, data, { updatedAt: new Date() });
      const category = memoryCategories.find((c) => c.id === plat.categoryId);
      return {
        ...plat,
        category: category ? { id: category.id, name: category.name } : null,
      };
    }
  }

  async deletePlat(id: string) {
    try {
      return await prisma.plat.delete({ where: { id } });
    } catch (err) {
      if (!shouldUseMemoryFallback(err)) throw err;
      const idx = memoryPlats.findIndex((p) => p.id === id);
      if (idx === -1) throw { status: 404, message: 'Plat non trouve.' };
      const [deleted] = memoryPlats.splice(idx, 1);
      return deleted;
    }
  }

  // === Reviews ===
  async createReview(userId: string, platId: string, data: { rating: number; comment?: string }) {
    if (data.rating < 1 || data.rating > 5) {
      throw { status: 400, message: 'La note doit etre entre 1 et 5.' };
    }
    try {
      return await prisma.review.create({
        data: { userId, platId, ...data },
        include: { user: { select: { firstName: true, lastName: true } } },
      });
    } catch (err) {
      if (!shouldUseMemoryFallback(err)) throw err;
      const review: MemoryReview = {
        id: crypto.randomUUID(),
        userId,
        platId,
        rating: data.rating,
        comment: data.comment,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryReviews.push(review);
      return review;
    }
  }

  async getReviews(platId: string) {
    try {
      return await prisma.review.findMany({
        where: { platId },
        include: { user: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      if (!shouldUseMemoryFallback(err)) throw err;
      return memoryReviews
        .filter((r) => r.platId === platId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  // === Stock ===
  async getStockLevels() {
    try {
      return await prisma.plat.findMany({
        select: {
          id: true,
          name: true,
          stockQuantity: true,
          available: true,
          category: { select: { name: true } },
        },
        orderBy: { stockQuantity: 'asc' },
      });
    } catch (err) {
      if (!shouldUseMemoryFallback(err)) throw err;
      return memoryPlats
        .slice()
        .sort((a, b) => a.stockQuantity - b.stockQuantity)
        .map((p) => ({
          id: p.id,
          name: p.name,
          stockQuantity: p.stockQuantity,
          available: p.available,
          category: { name: memoryCategories.find((c) => c.id === p.categoryId)?.name || 'N/A' },
        }));
    }
  }

  async updateStock(id: string, quantity: number) {
    try {
      return await prisma.plat.update({
        where: { id },
        data: { stockQuantity: quantity, available: quantity > 0 },
      });
    } catch (err) {
      if (!isDbUnavailableError(err)) throw err;
      const plat = memoryPlats.find((p) => p.id === id);
      if (!plat) throw { status: 404, message: 'Plat non trouve.' };
      plat.stockQuantity = quantity;
      plat.available = quantity > 0;
      plat.updatedAt = new Date();
      return plat;
    }
  }

  async getPurchaseSuggestions(params?: { threshold?: number; targetStock?: number }) {
    const threshold = Math.max(0, params?.threshold ?? 5);
    const targetStock = Math.max(threshold + 1, params?.targetStock ?? 20);

    const stockLevels = await this.getStockLevels();
    return stockLevels
      .filter((item: any) => Number(item.stockQuantity) <= threshold)
      .map((item: any) => {
        const current = Number(item.stockQuantity) || 0;
        const suggestedOrderQty = Math.max(0, targetStock - current);
        return {
          id: item.id,
          name: item.name,
          category: item.category?.name || 'N/A',
          currentStock: current,
          threshold,
          targetStock,
          suggestedOrderQty,
          urgency: current === 0 ? 'critical' : 'warning',
        };
      })
      .sort((a, b) => a.currentStock - b.currentStock);
  }
}
