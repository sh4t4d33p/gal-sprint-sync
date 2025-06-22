import { Request, Response } from 'express';
import { PrismaClient, Task, TaskStatus } from '../generated/prisma';

const prisma: PrismaClient = new PrismaClient();

const allowedStatuses: TaskStatus[] = [TaskStatus.ToDo, TaskStatus.InProgress, TaskStatus.Done];

// Create a new task
export async function createTask(req: Request, res: Response): Promise<void> {
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
    res.status(400).json({ message: 'Task creation failed', error: err });
  }
}

// List tasks (admin: all, user: own)
export async function listTasks(req: Request, res: Response): Promise<void> {
  const userId: number | undefined = req.user?.userId;
  const isAdmin: boolean | undefined = req.user?.isAdmin;
  try {
    // Admins see all tasks, users see only their own
    const tasks: Task[] = await prisma.task.findMany({
      where: isAdmin ? {} : { userId },
    });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(400).json({ message: 'Failed to fetch tasks', error: err });
  }
}

// Get single task by ID (admin: any, user: own)
export async function getTaskById(req: Request, res: Response): Promise<void> {
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
    res.status(400).json({ message: 'Failed to fetch task', error: err });
  }
}

// Update task (admin: any, user: own)
export async function updateTask(req: Request, res: Response): Promise<void> {
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
    res.status(400).json({ message: 'Failed to update task', error: err });
  }
}

// Delete task (admin: any, user: own)
export async function deleteTask(req: Request, res: Response): Promise<void> {
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
    res.status(400).json({ message: 'Failed to delete task', error: err });
  }
}

// PATCH /api/tasks/:id/progress - update status and/or totalMinutes
export async function patchTaskProgress(req: Request, res: Response): Promise<void> {
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
    res.status(400).json({ message: 'Failed to update task progress', error: err });
  }
} 