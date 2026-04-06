import { Router } from 'express';
import { CatalogueController } from './catalogue.controller';
import { authenticate, authorizeAdmin } from '../../middleware/auth';
import { upload } from '../../middleware/upload';

const router = Router();
const controller = new CatalogueController();

// Categories
router.get('/categories', (req, res, next) => controller.getCategories(req, res, next));
router.post('/categories', authenticate, authorizeAdmin, upload.single('image'), (req, res, next) => controller.createCategory(req, res, next));
router.put('/categories/:id', authenticate, authorizeAdmin, upload.single('image'), (req, res, next) => controller.updateCategory(req, res, next));
router.delete('/categories/:id', authenticate, authorizeAdmin, (req, res, next) => controller.deleteCategory(req, res, next));

// Plats
router.get('/plats', (req, res, next) => controller.getPlats(req, res, next));
router.get('/plats/:id', (req, res, next) => controller.getPlatById(req, res, next));
router.post('/plats', authenticate, authorizeAdmin, upload.single('image'), (req, res, next) => controller.createPlat(req, res, next));
router.put('/plats/:id', authenticate, authorizeAdmin, upload.single('image'), (req, res, next) => controller.updatePlat(req, res, next));
router.delete('/plats/:id', authenticate, authorizeAdmin, (req, res, next) => controller.deletePlat(req, res, next));

// Reviews
router.post('/plats/:id/reviews', authenticate, (req, res, next) => controller.createReview(req, res, next));
router.get('/plats/:id/reviews', (req, res, next) => controller.getReviews(req, res, next));

// Stock
router.get('/stock', authenticate, authorizeAdmin, (req, res, next) => controller.getStockLevels(req, res, next));
router.get('/stock/purchase-suggestions', authenticate, authorizeAdmin, (req, res, next) => controller.getPurchaseSuggestions(req, res, next));
router.put('/stock/:id', authenticate, authorizeAdmin, (req, res, next) => controller.updateStock(req, res, next));

export default router;
