import { Request, Response } from 'express';
import { PrismaClient, Task, TaskStatus } from '../generated/prisma';
import logger from '../utils/logger';

const prisma: PrismaClient = new PrismaClient();

const allowedStatuses: TaskStatus[] = [TaskStatus.ToDo, TaskStatus.InProgress, TaskStatus.Done];

/**
 * Create a new task
 * @route POST /api/tasks
 * @access Authenticated
 * @body {string} title - Task title
 * @body {string} description - Task description
 * @body {string} status - Task status (ToDo, InProgress, Done)
 * @returns {Task} 201 - Created task
 * @returns {Error} 401 - Unauthorized
 * @returns {Error} 500 - Task creation failed
 */
export async function createTask(req: Request, res: Response): Promise<void> {
  logger.info('START createTask', { userId: req.user?.userId, body: req.body });
  // Extract task data from request body
  const { title, description, status }: { title: string; description: string; status: string } = req.body;
  // Get userId from authenticated user
  const userId: number | undefined = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  // Validate and cast status
  const statusValue: TaskStatus = allowedStatuses.includes(status as TaskStatus)
    ? (status as TaskStatus)
    : TaskStatus.ToDo;
  try {
    // Always set totalMinutes to 0 on creation, ignore any client value
    const task: Task = await prisma.task.create({
      data: { title, description, status: statusValue, userId, totalMinutes: 0 },
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Task creation failed', error: JSON.stringify(err) });
  }
  logger.info('END createTask');
}

/**
 * List tasks (admin: all, user: own)
 * @route GET /api/tasks
 * @access Authenticated
 * @returns {Task[]} 200 - List of tasks
 * @returns {Error} 500 - Failed to fetch tasks
 */
export async function listTasks(req: Request, res: Response): Promise<void> {
  logger.info('START listTasks', { userId: req.user?.userId });
  const userId: number | undefined = req.user?.userId;
  const isAdmin: boolean | undefined = req.user?.isAdmin;
  try {
    // Admins see all tasks, users see only their own
    const tasks: Task[] = await prisma.task.findMany({
      where: isAdmin ? {} : { userId },
    });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: JSON.stringify(err) });
  }
  logger.info('END listTasks');
}

/**
 * Get single task by ID (admin: any, user: own)
 * @route GET /api/tasks/:id
 * @access Authenticated
 * @param {number} id - Task ID
 * @returns {Task} 200 - Task object
 * @returns {Error} 404 - Task not found
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 500 - Failed to fetch task
 */
export async function getTaskById(req: Request, res: Response): Promise<void> {
  logger.info('START getTaskById', { userId: req.user?.userId, taskId: req.params.id });
  const taskId: number = Number(req.params.id);
  const userId: number | undefined = req.user?.userId;
  const isAdmin: boolean | undefined = req.user?.isAdmin;
  try {
    const task: Task | null = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    // Only allow if admin or owner
    if (!isAdmin && task.userId !== userId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch task', error: JSON.stringify(err) });
  }
  logger.info('END getTaskById');
}

/**
 * Update task (admin: any, user: own)
 * @route PUT /api/tasks/:id
 * @access Authenticated
 * @param {number} id - Task ID
 * @body {string} title - New title
 * @body {string} description - New description
 * @body {string} status - New status
 * @body {number} totalMinutes - New total minutes
 * @returns {Task} 200 - Updated task
 * @returns {Error} 404 - Task not found
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 400 - Invalid status value
 * @returns {Error} 500 - Failed to update task
 */
export async function updateTask(req: Request, res: Response): Promise<void> {
  logger.info('START updateTask', { userId: req.user?.userId, taskId: req.params.id, body: req.body });
  const taskId: number = Number(req.params.id);
  const userId: number | undefined = req.user?.userId;
  const isAdmin: boolean | undefined = req.user?.isAdmin;
  const { title, description, status, totalMinutes }: { title?: string; description?: string; status?: string; totalMinutes?: number } = req.body;
  try {
    const task: Task | null = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    // Only allow if admin or owner
    if (!isAdmin && task.userId !== userId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    // Validate and cast status if provided
    let statusValue: TaskStatus | undefined = undefined;
    if (status !== undefined) {
      if (!allowedStatuses.includes(status as TaskStatus)) {
        res.status(400).json({ message: 'Invalid status value' });
        return;
      }
      statusValue = status as TaskStatus;
    }
    // Update allowed fields, including totalMinutes
    const updatedTask: Task = await prisma.task.update({
      where: { id: taskId },
      data: { title, description, status: statusValue, totalMinutes },
    });
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task', error: JSON.stringify(err) });
  }
  logger.info('END updateTask');
}

/**
 * Delete task (admin: any, user: own)
 * @route DELETE /api/tasks/:id
 * @access Authenticated
 * @param {number} id - Task ID
 * @returns {string} 200 - Success message
 * @returns {Error} 404 - Task not found
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 500 - Failed to delete task
 */
export async function deleteTask(req: Request, res: Response): Promise<void> {
  logger.info('START deleteTask', { userId: req.user?.userId, taskId: req.params.id });
  const taskId: number = Number(req.params.id);
  const userId: number | undefined = req.user?.userId;
  const isAdmin: boolean | undefined = req.user?.isAdmin;
  try {
    const task: Task | null = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    // Only allow if admin or owner
    if (!isAdmin && task.userId !== userId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    await prisma.task.delete({ where: { id: taskId } });
    res.status(200).json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task', error: JSON.stringify(err) });
  }
  logger.info('END deleteTask');
}

/**
 * Update task progress (status and/or totalMinutes)
 * @route PATCH /api/tasks/:id/progress
 * @access Authenticated
 * @param {number} id - Task ID
 * @body {string} status - New status (optional)
 * @body {number} totalMinutes - New total minutes (optional)
 * @returns {Task} 200 - Updated task
 * @returns {Error} 400 - Invalid status value
 * @returns {Error} 404 - Task not found
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 500 - Failed to update task progress
 */
export async function patchTaskProgress(req: Request, res: Response): Promise<void> {
  logger.info('START patchTaskProgress', { userId: req.user?.userId, taskId: req.params.id, body: req.body });
  const taskId: number = Number(req.params.id);
  const userId: number | undefined = req.user?.userId;
  const isAdmin: boolean | undefined = req.user?.isAdmin;
  const { status, totalMinutes }: { status?: string; totalMinutes?: number } = req.body;

  if (status === undefined && totalMinutes === undefined) {
    res.status(400).json({ message: 'At least one of status or totalMinutes must be provided' });
    return;
  }

  try {
    const task: Task | null = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    // Only allow if admin or owner
    if (!isAdmin && task.userId !== userId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    // Validate and cast status if provided
    let statusValue: TaskStatus | undefined = undefined;
    if (status !== undefined) {
      if (!allowedStatuses.includes(status as TaskStatus)) {
        res.status(400).json({ message: 'Invalid status value' });
        return;
      }
      statusValue = status as TaskStatus;
    }
    // Build update data
    const updateData: { status?: TaskStatus; totalMinutes?: number } = {};
    if (statusValue !== undefined) updateData.status = statusValue;
    if (totalMinutes !== undefined) updateData.totalMinutes = totalMinutes;
    const updatedTask: Task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task progress', error: JSON.stringify(err) });
  }
  logger.info('END patchTaskProgress');
} 