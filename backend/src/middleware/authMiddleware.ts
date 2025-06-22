import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../services/authService';

/**
 * Express middleware to authenticate requests using JWT.
 * Attaches the decoded user payload to req.user if valid.
 */
export function authenticateJwt(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or invalid Authorization header' });
    return;
  }
  const token = authHeader.split(' ')[1];
  const user = verifyJwt(token);
  if (!user) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }
  (req as any).user = user;
  next();
}
