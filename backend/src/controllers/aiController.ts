import { Request, Response } from 'express';
import { PrismaClient, Task } from '../generated/prisma';
import { generateTaskDescription } from '../services/aiService';
import logger from '../utils/logger';

const prisma: PrismaClient = new PrismaClient();

/**
 * Suggest a detailed task description for a given task title using AI (OpenAI or stub)
 * @route GET /api/ai/suggest
 * @access Authenticated
 * @queryparam {string} title - Task title
 * @returns {string} 200 - AI-generated task description
 * @returns {Error} 400 - Missing or invalid taskId
 * @returns {Error} 404 - Task not found
 * @returns {Error} 500 - Failed to generate description
 * @returns {Error} 429 - Too many requests, rate limit exceeded
 */
export async function getTaskDescriptionSuggestion(req: Request, res: Response): Promise<void> {
  logger.info('START getTaskDescriptionSuggestion', { userId: req.user?.userId, title: req.query.title });
  const title: string = String(req.query.title);
  if (!title) {
    res.status(400).json({ message: 'Missing or invalid title query parameter' });
    return;
  }
  try {
    // Use aiService to generate description
    const description: string = await generateTaskDescription(title);
    res.status(200).json({ description });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate description', error: JSON.stringify(err) });
  }
  logger.info('END getTaskDescriptionSuggestion');
} 