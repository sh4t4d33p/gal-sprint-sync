import { Request, Response } from 'express';
import { PrismaClient, User } from '../generated/prisma';
import { SafeUser } from '../types/SafeUser';
import logger from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Get all users (admin only)
 * @route GET /api/users
 * @access Admin
 * @returns {SafeUser[]} 200 - List of users (without passwords)
 * @returns {Error} 403 - Forbidden if not admin
 * @returns {Error} 500 - Internal server error
 */
export async function getAllUsers(req: Request, res: Response): Promise<void> {
  logger.info('START getAllUsers', { userId: req.user?.userId });
  try {
    // Check if requester is admin
    if (!req.user?.isAdmin) {
      res.status(403).json({ message: 'Forbidden: Admins only' });
      return;
    }
    // Fetch all users, omit passwords
    const users: Array<User> = await prisma.user.findMany();
    const safeUsers: SafeUser[] = users.map(({ password, ...rest }) => rest);
    res.status(200).json(safeUsers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: JSON.stringify(err) });
  }
  logger.info('END getAllUsers');
}

/**
 * Get a user by ID
 * @route GET /api/users/:id
 * @access Authenticated
 * @param {number} id - User ID
 * @returns {SafeUser} 200 - User object (without password)
 * @returns {Error} 404 - User not found
 * @returns {Error} 500 - Internal server error
 */
export async function getUserById(req: Request, res: Response): Promise<void> {
  logger.info('START getUserById', { userId: req.user?.userId, targetId: req.params.id });
  try {
    const userId: number = Number(req.params.id);
    // Fetch user by ID
    const user: User | null = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    // Omit password from response
    const { password, ...safeUser } = user;
    res.status(200).json(safeUser as SafeUser);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: JSON.stringify(err) });
  }
  logger.info('END getUserById');
}

/**
 * Update a user (self or admin)
 * @route PUT /api/users/:id
 * @access Self or Admin
 * @param {number} id - User ID
 * @body {string} name - New name
 * @body {string} email - New email
 * @returns {SafeUser} 200 - Updated user object (without password)
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 500 - Update failed
 */
export async function updateUser(req: Request, res: Response): Promise<void> {
  logger.info('START updateUser', { userId: req.user?.userId, body: req.body });
  const userId: number = Number(req.params.id);
  // Only allow self or admin to update
  if (!req.user || (req.user.userId !== userId && !req.user.isAdmin)) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  // Only allow updating name and email (not password or isAdmin here)
  const { name, email } = req.body;
  try {
    const updatedUser: User = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
    });
    const { password, ...safeUser } = updatedUser;
    res.status(200).json(safeUser as SafeUser);
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: JSON.stringify(err) });
  }
  logger.info('END updateUser');
}

/**
 * Delete a user (admin only)
 * @route DELETE /api/users/:id
 * @access Admin
 * @param {number} id - User ID
 * @returns {string} 200 - Success message
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 500 - Delete failed
 */
export async function deleteUser(req: Request, res: Response): Promise<void> {
  logger.info('START deleteUser', { userId: req.user?.userId, targetId: req.params.id });
  // Only admin can delete users
  if (!req.user?.isAdmin) {
    res.status(403).json({ message: 'Forbidden: Admins only' });
    return;
  }
  const userId: number = Number(req.params.id);
  try {
    await prisma.user.delete({ where: { id: userId } });
    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: JSON.stringify(err) });
  }
  logger.info('END deleteUser');
}

/**
 * Get top users by total minutes logged (admin only)
 * @route GET /api/users/stats/top-users
 * @access Admin
 * @returns {object[]} 200 - List of top users with totalMinutes
 * @returns {Error} 403 - Forbidden if not admin
 * @returns {Error} 500 - Failed to fetch top users
 */
export async function statsTopUsers(req: Request, res: Response): Promise<void> {
  logger.info('START statsTopUsers', { userId: req.user?.userId });
  if (!req.user?.isAdmin) {
    res.status(403).json({ message: 'Forbidden: Admins only' });
    logger.info('END statsTopUsers');
    return;
  }
  try {
    // Aggregate totalMinutes per user
    const results = await prisma.task.groupBy({
      by: ['userId'],
      _sum: { totalMinutes: true },
      orderBy: { _sum: { totalMinutes: 'desc' } },
    });
    // Join with user info
    const users = await prisma.user.findMany({
      where: { id: { in: results.map(r => r.userId) } },
      select: { id: true, name: true, email: true },
    });
    // Merge user info with totals
    const topUsers = results.map(r => {
      const user = users.find(u => u.id === r.userId);
      return {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        totalMinutes: r._sum.totalMinutes || 0,
      };
    });
    res.status(200).json(topUsers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch top users', error: JSON.stringify(err) });
  }
  logger.info('END statsTopUsers');
} 