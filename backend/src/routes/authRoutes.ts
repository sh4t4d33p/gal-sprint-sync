import { Router, Request, Response, NextFunction } from 'express';
import * as authController from '../controllers/authController';
import { authenticateJwt } from '../middleware/authMiddleware';

const router = Router();

/**
 * @route POST /register
 * @desc Register a new user
 */
router.post('/register', function(req: Request, res: Response, next: NextFunction) {
  authController.register(req, res).catch(next);
});

/**
 * @route POST /login
 * @desc Login a user
 */
router.post('/login', function(req: Request, res: Response, next: NextFunction) {
  authController.login(req, res).catch(next);
});

/**
 * @route GET /current-user
 * @desc Get current user info (protected)
 */
router.get('/current-user', authenticateJwt, async (req: Request, res: Response) => {
  await authController.getCurrentUser(req, res);
});

export default router;
