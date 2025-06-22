import { Request, Response } from 'express';
import { PrismaClient, Task } from '../generated/prisma';
import { generateTaskDescription } from '../services/aiService';
import logger from '../utils/logger';

const prisma: PrismaClient = new PrismaClient();

/**
 * Suggest a detailed task description for a given task title using AI (OpenAI or stub)
 * @route GET /api/ai/suggest
 * @access Authenticated
 * @queryparam {number} taskId - Task ID
 * @returns {string} 200 - AI-generated task description
 * @returns {Error} 400 - Missing or invalid taskId
 * @returns {Error} 404 - Task not found
 * @returns {Error} 500 - Failed to generate description
 */
export async function getTaskDescriptionSuggestion(req: Request, res: Response): Promise<void> {
  logger.info('START getTaskDescriptionSuggestion', { userId: req.user?.userId, taskId: req.query.taskId });
  const taskId: number = Number(req.query.taskId);
  if (!taskId) {
    res.status(400).json({ message: 'Missing or invalid taskId query parameter' });
    return;
  }
  try {
    // Fetch the task
    const task: Task | null = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    // Use aiService to generate description
    const description: string = await generateTaskDescription(task.title);
    res.status(200).json({ description });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate description', error: JSON.stringify(err) });
  }
  logger.info('END getTaskDescriptionSuggestion');
} 