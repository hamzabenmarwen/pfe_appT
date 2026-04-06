import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import prisma from './config/database';
import { logger } from './utils/logger';
import { requestLogger } from './middleware/requestLogger';

// Routes
import authRoutes from './modules/auth/auth.routes';
import catalogueRoutes from './modules/catalogue/catalogue.routes';
import ordersRoutes from './modules/orders/orders.routes';
import eventsRoutes from './modules/events/events.routes';
import clientsRoutes from './modules/clients/clients.routes';
import invoicesRoutes from './modules/invoices/invoices.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

const configuredOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const localhostDevOriginRegex = /^http:\/\/localhost:\d+$/;

function isAllowedOrigin(origin?: string): boolean {
  if (!origin) return true;
  if (configuredOrigins.includes(origin)) return true;
  if (!isProduction && localhostDevOriginRegex.test(origin)) return true;
  return false;
}

// Middleware
app.set('trust proxy', 1);
app.use(helmet());
app.use(requestLogger);
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requetes. Reessayez plus tard.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 25 : 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives d authentification. Reessayez plus tard.' },
});

app.use('/api', apiLimiter);

// Static files (uploads)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api', catalogueRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check (includes DB connectivity)
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'OK', db: 'UP', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({
      status: 'DEGRADED',
      db: 'DOWN',
      message: 'Database connection failed. Check DATABASE_URL credentials.',
      timestamp: new Date().toISOString(),
    });
  }
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ port: PORT }, `Serveur demarre sur http://localhost:${PORT}`);
  logger.info(`API disponible sur http://localhost:${PORT}/api`);

  prisma.$connect()
    .then(() => {
      logger.info('Database connected');
    })
    .catch(() => {
      logger.error('Database connection failed. Verify DATABASE_URL in backend/.env');
    });
});

export default app;
