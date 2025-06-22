import { Router } from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/userController';
import { authenticateJwt } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateJwt);

// GET /api/users - get all users (admin only)
router.get('/', getAllUsers);

// GET /api/users/:id - get user by ID
router.get('/:id', getUserById);

// PUT /api/users/:id - update user
router.put('/:id', updateUser);

// DELETE /api/users/:id - delete user (admin only)
router.delete('/:id', deleteUser);

export default router; 