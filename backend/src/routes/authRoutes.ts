import { Router, Request, Response, NextFunction } from 'express';
import * as authController from '../controllers/authController';
import { authenticateJwt } from '../middleware/authMiddleware';

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists or invalid input
 *       500:
 *         description: Registration failed
 *       429:
 *         description: Too many requests, rate limit exceeded
 */
router.post('/register', function(req: Request, res: Response, next: NextFunction) {
  authController.register(req, res).catch(next);
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Login failed
 *       429:
 *         description: Too many requests, rate limit exceeded
 */
router.post('/login', function(req: Request, res: Response, next: NextFunction) {
  authController.login(req, res).catch(next);
});

/**
 * @openapi
 * /api/auth/current-user:
 *   get:
 *     summary: Get current user info
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user info
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to get current user
 *       429:
 *         description: Too many requests, rate limit exceeded
 */
router.get('/current-user', authenticateJwt, async (req: Request, res: Response) => {
  await authController.getCurrentUser(req, res);
});

export default router;
