import { Request, Response } from 'express';
import { PrismaClient, User } from '../generated/prisma';
import { SafeUser } from '../types/SafeUser';

const prisma = new PrismaClient();

// Get all users (admin only)
export async function getAllUsers(req: Request, res: Response): Promise<void> {
  // Check if requester is admin
  if (!req.user?.isAdmin) {
    res.status(403).json({ message: 'Forbidden: Admins only' });
    return;
  }
  // Fetch all users, omit passwords
  const users: Array<User> = await prisma.user.findMany();
  const safeUsers: SafeUser[] = users.map(({ password, ...rest }) => rest);
  res.json(safeUsers);
}

// Get user by ID
export async function getUserById(req: Request, res: Response): Promise<void> {
  const userId: number = Number(req.params.id);
  // Fetch user by ID
  const user: User | null = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  // Omit password from response
  const { password, ...safeUser } = user;
  res.json(safeUser as SafeUser);
}

// Update user (self or admin)
export async function updateUser(req: Request, res: Response): Promise<void> {
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
    res.json(safeUser as SafeUser);
  } catch (err) {
    res.status(400).json({ message: 'Update failed', error: err });
  }
}

// Delete user (admin only)
export async function deleteUser(req: Request, res: Response): Promise<void> {
  // Only admin can delete users
  if (!req.user?.isAdmin) {
    res.status(403).json({ message: 'Forbidden: Admins only' });
    return;
  }
  const userId: number = Number(req.params.id);
  try {
    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Delete failed', error: err });
  }
} 