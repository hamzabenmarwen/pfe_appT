import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  logger.error({
    requestId: _req.requestId,
    method: _req.method,
    url: _req.originalUrl,
    userId: _req.user?.userId,
    error: err?.message || err,
    stack: err?.stack,
  }, 'Request failed');

  const errMessage = (err?.message || '').toString();
  const isDbAuthError = errMessage.includes('Authentication failed against database server');
  const isDbUnavailableError = errMessage.includes('Can\'t reach database server') || errMessage.includes('ECONNREFUSED');

  if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err.code === 'P2002') {
    res.status(409).json({ error: 'Cette entrée existe déjà.' });
    return;
  }

  if (err.code === 'P2025') {
    res.status(404).json({ error: 'Ressource non trouvée.' });
    return;
  }

  if (err.code === 'P1000') {
    res.status(503).json({ error: 'Connexion base de donnees refusee: identifiants invalides.' });
    return;
  }

  if (err.code === 'P1001') {
    res.status(503).json({ error: 'Base de donnees injoignable.' });
    return;
  }

  if (err.name === 'PrismaClientInitializationError' || isDbAuthError || isDbUnavailableError) {
    res.status(503).json({ error: 'Base de donnees indisponible ou identifiants invalides (DATABASE_URL).' });
    return;
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'La taille du fichier ne doit pas dépasser 5MB.' });
      return;
    }
    res.status(400).json({ error: err.message });
    return;
  }

  res.status(err.status || 500).json({
    error: err.message || 'Erreur interne du serveur',
  });
}
