import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.tenantId;
    const { 
      page = 1, 
      limit = 50,
      entity,
      action,
      userId,
      startDate,
      endDate
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      tenantId: tenantId!,
    };

    if (entity) {
      where.entity = entity as string;
    }

    if (action) {
      where.action = action as string;
    }

    if (userId) {
      where.userId = userId as string;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: Number(limit),
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAuditStats = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.tenantId;

    const [totalLogs, actionCounts, entityCounts, recentActivity] = await Promise.all([
      prisma.auditLog.count({
        where: { tenantId: tenantId! },
      }),
      prisma.auditLog.groupBy({
        by: ['action'],
        where: { tenantId: tenantId! },
        _count: true,
      }),
      prisma.auditLog.groupBy({
        by: ['entity'],
        where: { tenantId: tenantId! },
        _count: true,
      }),
      prisma.auditLog.findMany({
        where: { tenantId: tenantId! },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      }),
    ]);

    res.json({
      totalLogs,
      actionCounts: actionCounts.map((item) => ({
        action: item.action,
        count: item._count,
      })),
      entityCounts: entityCounts.map((item) => ({
        entity: item.entity,
        count: item._count,
      })),
      recentActivity,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
