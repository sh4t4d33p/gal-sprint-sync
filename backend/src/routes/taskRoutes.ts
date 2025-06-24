import { Router } from 'express';
import { createTask, listTasks, getTaskById, updateTask, deleteTask, patchTaskProgress } from '../controllers/taskController';
import { authenticateJwt } from '../middleware/authMiddleware';

const router: Router = Router();

// All routes require authentication
router.use(authenticateJwt);

/**
 * @openapi
 * /api/tasks:
 *   get:
 *     summary: Get all tasks (admin) or own tasks (user)
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to fetch tasks
 *       429:
 *         description: Too many requests, rate limit exceeded
 */
router.get('/', listTasks);

/**
 * @openapi
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task object
 *       403:
 *         description: Forbidden   
 *       404:
 *         description: Task not found
 *       500:
 *         description: Failed to fetch task
 *       429:
 *         description: Too many requests, rate limit exceeded
 */
router.get('/:id', getTaskById);

/**
 * @openapi
 * /api/tasks:
 *   post:
 *     summary: Create a new task (admin can assign to others)
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               totalMinutes:
 *                 type: integer
 *               userId:
 *                 type: integer
 *                 description: User ID to assign (admin only, optional)
 *     responses:
 *       201:
 *         description: Created task
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Task creation failed
 *       429:
 *         description: Too many requests, rate limit exceeded
 */
router.post('/', createTask);

/**
 * @openapi
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task (admin can reassign)
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               totalMinutes:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [ToDo, InProgress, Done]
 *               userId:
 *                 type: integer
 *                 description: User ID to assign (admin only, optional)
 *     responses:
 *       200:
 *         description: Updated task
 *       400:
 *         description: Invalid status value
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       500:
 *         description: Failed to update task
 *       429:
 *         description: Too many requests, rate limit exceeded
 */
router.put('/:id', updateTask);

/**
 * @openapi
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success message
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       500:
 *         description: Delete failed
 *       429:
 *         description: Too many requests, rate limit exceeded
 */
router.delete('/:id', deleteTask);

/**
 * @openapi
 * /api/tasks/{id}/progress:
 *   patch:
 *     summary: Update task progress
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ToDo, InProgress, Done]
 *               totalMinutes:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated task status
 *       400:
 *         description: Invalid status value
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       500:
 *         description: Failed to update task status
 *       429:
 *         description: Too many requests, rate limit exceeded
 */
router.patch('/:id/progress', patchTaskProgress);

export default router; 