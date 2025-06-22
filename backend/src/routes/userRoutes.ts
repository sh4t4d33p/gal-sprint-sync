import { Router } from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser, statsTopUsers, statsTimeLoggedPerDay } from '../controllers/userController';
import { authenticateJwt } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateJwt);

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users (without passwords)
 *       403:
 *         description: Forbidden if not admin
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllUsers);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags:
 *       - Users
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
 *         description: User object (without password)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getUserById);

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Update a user (self or admin)
 *     tags:
 *       - Users
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated user object (without password)
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Update failed
 */
router.put('/:id', updateUser);

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags:
 *       - Users
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
 *       500:
 *         description: Delete failed
 */
router.delete('/:id', deleteUser);

/**
 * @openapi
 * /api/users/stats/top-users:
 *   get:
 *     summary: Get top users by total minutes logged (admin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of top users with totalMinutes
 *       403:
 *         description: Forbidden if not admin
 *       500:
 *         description: Failed to fetch top users
 */
router.get('/stats/top-users', statsTopUsers);

/**
 * @openapi
 * /api/users/stats/time-logged-per-day:
 *   get:
 *     summary: "Get time logged per user per day (admin: all users, user: self)"
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: User ID (optional, admin only)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of time logged per day for each user
 *       403:
 *         description: Forbidden if not admin
 *       500:
 *         description: Failed to fetch time logged per day
 */
router.get('/stats/time-logged-per-day', statsTimeLoggedPerDay);

export default router; 