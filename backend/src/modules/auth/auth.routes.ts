import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const controller = new AuthController();

router.post('/register', (req, res, next) => controller.register(req, res, next));
router.post('/login', (req, res, next) => controller.login(req, res, next));
router.post('/refresh', (req, res, next) => controller.refreshToken(req, res, next));
router.get('/me', authenticate, (req, res, next) => controller.getProfile(req, res, next));
router.put('/profile', authenticate, (req, res, next) => controller.updateProfile(req, res, next));
router.put('/password', authenticate, (req, res, next) => controller.changePassword(req, res, next));

export default router;
