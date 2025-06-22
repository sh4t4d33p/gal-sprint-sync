import { Router } from 'express';
import { createTask, listTasks, getTaskById, updateTask, deleteTask, patchTaskProgress } from '../controllers/taskController';
import { authenticateJwt } from '../middleware/authMiddleware';

const router: Router = Router();

// All routes require authentication
router.use(authenticateJwt);

// POST /api/tasks - create task
router.post('/', createTask);

// GET /api/tasks - list tasks
router.get('/', listTasks);

// GET /api/tasks/:id - get single task
router.get('/:id', getTaskById);

// PUT /api/tasks/:id - update task
router.put('/:id', updateTask);

// DELETE /api/tasks/:id - delete task
router.delete('/:id', deleteTask);

// PATCH /api/tasks/:id/progress - update status and/or totalMinutes
router.patch('/:id/progress', patchTaskProgress);

export default router; 