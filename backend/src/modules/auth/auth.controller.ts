import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service';
import { validateBody } from '../../utils/validation';

const authService = new AuthService();

const registerSchema = z.object({
  email: z.string().email('Email invalide.'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caracteres.'),
  firstName: z.string().min(1, 'Le prenom est requis.'),
  lastName: z.string().min(1, 'Le nom est requis.'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Email invalide.'),
  password: z.string().min(1, 'Le mot de passe est requis.'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Token de rafraichissement requis.'),
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Au moins un champ doit etre fourni.',
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis.'),
  newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caracteres.'),
});

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName, phone, address } = validateBody(registerSchema, req.body);
      const result = await authService.register({ email, password, firstName, lastName, phone, address });
      res.status(201).json(result);
    } catch (err) { next(err); }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = validateBody(loginSchema, req.body);
      const result = await authService.login(email, password);
      res.json(result);
    } catch (err) { next(err); }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = validateBody(refreshSchema, req.body);
      const result = await authService.refreshToken(refreshToken);
      res.json(result);
    } catch (err) { next(err); }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.userId);
      res.json(user);
    } catch (err) { next(err); }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = validateBody(updateProfileSchema, req.body);
      const user = await authService.updateProfile(req.user!.userId, payload);
      res.json(user);
    } catch (err) { next(err); }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = validateBody(changePasswordSchema, req.body);
      const result = await authService.changePassword(req.user!.userId, currentPassword, newPassword);
      res.json(result);
    } catch (err) { next(err); }
  }
}
