import { Request, Response } from 'express';
import { PrismaClient, User } from '../generated/prisma';
import { hashPassword, comparePassword, signJwt } from '../services/authService';
import { SafeUser } from '../types/SafeUser';
import { UserPayload } from '../types/UserPayload';
import logger from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 * @body {string} email - User email
 * @body {string} password - User password
 * @body {string} name - User name
 * @returns {object} 201 - User registered successfully
 * @returns {Error} 400 - User already exists or invalid input
 * @returns {Error} 500 - Registration failed
 * @returns {Error} 429 - Too many requests, rate limit exceeded
 */
export async function register(req: Request, res: Response): Promise<void> {
  logger.info('START register', { email: req.body.email, name: req.body.name });
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
  logger.info('END register', { email: req.body.email });
}

/**
 * Login a user
 * @route POST /api/auth/login
 * @access Public
 * @body {string} email - User email
 * @body {string} password - User password
 * @returns {object} 200 - User logged in successfully
 * @returns {Error} 401 - Invalid credentials
 * @returns {Error} 500 - Login failed
 * @returns {Error} 429 - Too many requests, rate limit exceeded
 */
export async function login(req: Request, res: Response): Promise<void> {
  logger.info('START login', { email: req.body.email });
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
  logger.info('END login');
}

/**
 * Get current user info (requires auth middleware)
 * @route GET /api/auth/current-user
 * @access Authenticated
 * @returns {object} 200 - Current user info
 * @returns {Error} 401 - Unauthorized
 * @returns {Error} 500 - Failed to get current user
 * @returns {Error} 429 - Too many requests, rate limit exceeded
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  logger.info('START getCurrentUser', { userId: req.user?.userId });
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
  logger.info('END getCurrentUser');
}
