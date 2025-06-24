import { Router } from 'express';
import { getTaskDescriptionSuggestion } from '../controllers/aiController';
import { authenticateJwt } from '../middleware/authMiddleware';

const router: Router = Router();

// All AI routes require authentication
router.use(authenticateJwt);

// GET /api/ai/suggest?taskId=ID - get AI-generated description for a task
router.get('/suggest', getTaskDescriptionSuggestion);

/**
 * @openapi
 * /api/ai/suggest:
 *   post:
 *     summary: Generate a task description from a short title using AI
 *     tags:
 *       - AI
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Task title
 *     responses:
 *       200:
 *         description: Generated task description
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Task not found
 *       500:
 *         description: AI service error
 *       429:
 *         description: Too many requests, rate limit exceeded
 */
router.post('/suggest', getTaskDescriptionSuggestion);

export default router; 