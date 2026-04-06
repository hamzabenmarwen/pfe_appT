import { Request, Response, NextFunction } from 'express';
import { CatalogueService } from './catalogue.service';

const service = new CatalogueService();

export class CatalogueController {
  // Categories
  async getCategories(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await service.getCategories()); } catch (err) { next(err); }
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, sortOrder } = req.body;
      if (!name) { res.status(400).json({ error: 'Le nom est requis.' }); return; }
      const image = req.file ? `/uploads/images/${req.file.filename}` : undefined;
      res.status(201).json(await service.createCategory({ name, description, image, sortOrder }));
    } catch (err) { next(err); }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const data: any = { ...req.body };
      if (req.file) data.image = `/uploads/images/${req.file.filename}`;
      res.json(await service.updateCategory(req.params.id, data));
    } catch (err) { next(err); }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try { await service.deleteCategory(req.params.id); res.json({ message: 'Catégorie supprimée.' }); } catch (err) { next(err); }
  }

  // Plats
  async getPlats(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId, search, available, page, limit, sortBy, sortOrder } = req.query;
      res.json(await service.getPlats({
        categoryId: categoryId as string,
        search: search as string,
        available: available !== undefined ? available === 'true' : undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as string,
      }));
    } catch (err) { next(err); }
  }

  async getPlatById(req: Request, res: Response, next: NextFunction) {
    try { res.json(await service.getPlatById(req.params.id)); } catch (err) { next(err); }
  }

  async createPlat(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, price, allergens, available, stockQuantity, preparationTime, categoryId } = req.body;
      if (!name || !price || !categoryId) {
        res.status(400).json({ error: 'Nom, prix et catégorie sont requis.' }); return;
      }
      const image = req.file ? `/uploads/images/${req.file.filename}` : undefined;
      const parsedAllergens = allergens ? (typeof allergens === 'string' ? JSON.parse(allergens) : allergens) : [];
      let parsedIsPlatDuJour = false;
      if (req.body.isPlatDuJour !== undefined) parsedIsPlatDuJour = req.body.isPlatDuJour === 'true' || req.body.isPlatDuJour === true;
      res.status(201).json(await service.createPlat({
        name, description, price: parseFloat(price), image,
        allergens: parsedAllergens,
        isPlatDuJour: parsedIsPlatDuJour,
        available: available !== undefined ? available === 'true' || available === true : true,
        stockQuantity: stockQuantity ? parseInt(stockQuantity) : 0,
        preparationTime: preparationTime ? parseInt(preparationTime) : undefined,
        categoryId,
      }));
    } catch (err) { next(err); }
  }

  async updatePlat(req: Request, res: Response, next: NextFunction) {
    try {
      const data: any = { ...req.body };
      if (req.file) data.image = `/uploads/images/${req.file.filename}`;
      if (data.price) data.price = parseFloat(data.price);
      if (data.stockQuantity) data.stockQuantity = parseInt(data.stockQuantity);
      if (data.preparationTime) data.preparationTime = parseInt(data.preparationTime);
      if (data.allergens && typeof data.allergens === 'string') data.allergens = JSON.parse(data.allergens);
      if (data.available !== undefined) data.available = data.available === 'true' || data.available === true;
      if (data.isPlatDuJour !== undefined) data.isPlatDuJour = data.isPlatDuJour === 'true' || data.isPlatDuJour === true;
      res.json(await service.updatePlat(req.params.id, data));
    } catch (err) { next(err); }
  }

  async deletePlat(req: Request, res: Response, next: NextFunction) {
    try { await service.deletePlat(req.params.id); res.json({ message: 'Plat supprimé.' }); } catch (err) { next(err); }
  }

  // Reviews
  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { rating, comment } = req.body;
      if (!rating) { res.status(400).json({ error: 'La note est requise.' }); return; }
      res.status(201).json(await service.createReview(req.user!.userId, req.params.id, { rating: parseInt(rating), comment }));
    } catch (err) { next(err); }
  }

  async getReviews(req: Request, res: Response, next: NextFunction) {
    try { res.json(await service.getReviews(req.params.id)); } catch (err) { next(err); }
  }

  // Stock
  async getStockLevels(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await service.getStockLevels()); } catch (err) { next(err); }
  }

  async getPurchaseSuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const threshold = req.query.threshold ? parseInt(req.query.threshold as string, 10) : undefined;
      const targetStock = req.query.targetStock ? parseInt(req.query.targetStock as string, 10) : undefined;
      res.json(await service.getPurchaseSuggestions({ threshold, targetStock }));
    } catch (err) { next(err); }
  }

  async updateStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { quantity } = req.body;
      if (quantity === undefined) { res.status(400).json({ error: 'La quantité est requise.' }); return; }
      res.json(await service.updateStock(req.params.id, parseInt(quantity)));
    } catch (err) { next(err); }
  }
}
