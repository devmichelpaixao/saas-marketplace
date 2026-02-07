import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { date, status, departmentId } = req.query;

    const where: any = {};

    if (date) {
      const targetDate = new Date(date as string);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      where.dueDate = { gte: startOfDay, lte: endOfDay };
    }

    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        department: true,
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    });

    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, departmentId, title, description, dueDate, priority, assignedUsers } = req.body;

    const task = await prisma.task.create({
      data: {
        tenantId: req.tenantId!,
        orderId,
        departmentId,
        title,
        description,
        dueDate: new Date(dueDate),
        priority: priority || 'MEDIUM',
        assignments: assignedUsers
          ? {
              create: assignedUsers.map((userId: string) => ({ userId })),
            }
          : undefined,
      },
      include: {
        order: true,
        department: true,
        assignments: {
          include: {
            user: true,
          },
        },
      },
    });

    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const task = await prisma.task.update({
      where: { id },
      data,
      include: {
        order: true,
        department: true,
        assignments: {
          include: {
            user: true,
          },
        },
      },
    });

    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const completeTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
      include: {
        order: true,
      },
    });

    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
