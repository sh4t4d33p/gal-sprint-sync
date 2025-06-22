import { Request, Response } from 'express';
import { PrismaClient, Task } from '../generated/prisma';
import { generateTaskDescription } from '../services/aiService';

const prisma: PrismaClient = new PrismaClient();

/**
 * Suggest a description for a task using OpenAI
 */
export async function getTaskDescriptionSuggestion(req: Request, res: Response): Promise<void> {
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
} 