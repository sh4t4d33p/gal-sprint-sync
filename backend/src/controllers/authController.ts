import { Request, Response } from 'express';
import { PrismaClient, User } from '../generated/prisma';
import { hashPassword, comparePassword, signJwt } from '../services/authService';
import { SafeUser } from '../types/SafeUser';
import { UserPayload } from '../types/UserPayload';

const prisma = new PrismaClient();

/**
 * Register a new user
 */
export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, name } = req.body;
  try {
    // Check if user already exists
    const existingUser: User | null = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }
    // Hash password and create user
    const hashedPassword: string = await hashPassword(password);
    const user: User = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });
    // Sign JWT
    const token: string = signJwt({ userId: user.id, email: user.email, isAdmin: user.isAdmin });
    // Omit password from response
    const { password: _, ...safeUser } = user;
    res.status(201).json({ token, user: safeUser as SafeUser });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: JSON.stringify(err) });
  }
}

/**
 * Login a user
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  try {
    const user: User | null = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    // Compare password
    const isMatch: boolean = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    // Sign JWT
    const token: string = signJwt({ userId: user.id, email: user.email, isAdmin: user.isAdmin });
    // Omit password from response
    const { password: _, ...safeUser } = user;
    res.status(200).json({ token, user: safeUser as SafeUser });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: JSON.stringify(err) });
  }
}

/**
 * Get current user info (requires auth middleware)
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    const user: UserPayload | undefined = req.user;
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get current user', error: JSON.stringify(err) });
  }
}
