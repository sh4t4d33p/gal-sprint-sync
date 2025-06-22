import { Router } from 'express';
import { getTaskDescriptionSuggestion } from '../controllers/aiController';
import { authenticateJwt } from '../middleware/authMiddleware';

const router: Router = Router();

// All AI routes require authentication
router.use(authenticateJwt);

// GET /api/ai/suggest?taskId=ID - get AI-generated description for a task
router.get('/suggest', getTaskDescriptionSuggestion);

export default router; 