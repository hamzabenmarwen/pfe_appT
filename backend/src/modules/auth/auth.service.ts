import prisma from '../../config/database';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, TokenPayload } from '../../utils/jwt';

type MemoryUser = {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  role: 'ADMIN' | 'CLIENT';
  loyaltyPoints: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const memoryUsers: MemoryUser[] = [];
const allowInMemoryFallback = process.env.ALLOW_IN_MEMORY_FALLBACK === 'true' || process.env.NODE_ENV !== 'production';

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

function toPublicUser(user: MemoryUser) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    address: user.address,
    role: user.role,
    loyaltyPoints: user.loyaltyPoints,
    createdAt: user.createdAt,
  };
}

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
  }) {
    try {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing) {
        throw { status: 409, message: 'Un compte avec cet email existe deja.' };
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
          role: 'CLIENT',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          address: true,
          role: true,
          loyaltyPoints: true,
          createdAt: true,
        },
      });

      const payload: TokenPayload = { userId: user.id, email: user.email, role: user.role };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
      return { user, accessToken, refreshToken };
    } catch (err) {
      if (!shouldUseMemoryFallback(err)) throw err;

      const existingMemoryUser = memoryUsers.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
      if (existingMemoryUser) {
        throw { status: 409, message: 'Un compte avec cet email existe deja.' };
      }

      const now = new Date();
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const memoryUser: MemoryUser = {
        id: crypto.randomUUID(),
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        role: 'CLIENT',
        loyaltyPoints: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      memoryUsers.push(memoryUser);

      const payload: TokenPayload = { userId: memoryUser.id, email: memoryUser.email, role: memoryUser.role };
      return {
        user: toPublicUser(memoryUser),
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
      };
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw { status: 401, message: 'Email ou mot de passe incorrect.' };
      }

      if (!user.isActive) {
        throw { status: 403, message: 'Votre compte a ete desactive.' };
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw { status: 401, message: 'Email ou mot de passe incorrect.' };
      }

      const payload: TokenPayload = { userId: user.id, email: user.email, role: user.role };
      const { password: _pwd, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
      };
    } catch (err) {
      if (!shouldUseMemoryFallback(err)) throw err;

      const user = memoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) throw { status: 401, message: 'Email ou mot de passe incorrect.' };
      if (!user.isActive) throw { status: 403, message: 'Votre compte a ete desactive.' };

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) throw { status: 401, message: 'Email ou mot de passe incorrect.' };

      const payload: TokenPayload = { userId: user.id, email: user.email, role: user.role };
      return {
        user: toPublicUser(user),
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
      };
    }
  }

  async refreshToken(token: string) {
    const decoded = verifyRefreshToken(token);
    try {
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user || !user.isActive) {
        throw { status: 401, message: 'Token de rafraichissement invalide.' };
      }

      const payload: TokenPayload = { userId: user.id, email: user.email, role: user.role };
      return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
      };
    } catch (err) {
      if (!shouldUseMemoryFallback(err)) throw err;

      const user = memoryUsers.find((u) => u.id === decoded.userId);
      if (!user || !user.isActive) {
        throw { status: 401, message: 'Token de rafraichissement invalide.' };
      }

      const payload: TokenPayload = { userId: user.id, email: user.email, role: user.role };
      return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
      };
    }
  }

  async getProfile(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          address: true,
          role: true,
          loyaltyPoints: true,
          createdAt: true,
          _count: { select: { orders: true, events: true, reviews: true } },
        },
      });

      if (!user) throw { status: 404, message: 'Utilisateur non trouve.' };
      return user;
    } catch (err) {
      if (!shouldUseMemoryFallback(err)) throw err;

      const user = memoryUsers.find((u) => u.id === userId);
      if (!user) throw { status: 404, message: 'Utilisateur non trouve.' };
      return {
        ...toPublicUser(user),
        _count: { orders: 0, events: 0, reviews: 0 },
      };
    }
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; phone?: string; address?: string }) {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          address: true,
          role: true,
          loyaltyPoints: true,
          createdAt: true,
        },
      });
    } catch (err) {
      if (!shouldUseMemoryFallback(err)) throw err;

      const user = memoryUsers.find((u) => u.id === userId);
      if (!user) throw { status: 404, message: 'Utilisateur non trouve.' };
      Object.assign(user, data, { updatedAt: new Date() });
      return toPublicUser(user);
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw { status: 404, message: 'Utilisateur non trouve.' };

      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) throw { status: 400, message: 'Mot de passe actuel incorrect.' };

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
      return { message: 'Mot de passe mis a jour avec succes.' };
    } catch (err) {
      if (!shouldUseMemoryFallback(err)) throw err;

      const user = memoryUsers.find((u) => u.id === userId);
      if (!user) throw { status: 404, message: 'Utilisateur non trouve.' };

      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) throw { status: 400, message: 'Mot de passe actuel incorrect.' };

      user.password = await bcrypt.hash(newPassword, 10);
      user.updatedAt = new Date();
      return { message: 'Mot de passe mis a jour avec succes.' };
    }
  }
}
