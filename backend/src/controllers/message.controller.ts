import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import { io } from '../server';

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.query;

    const where: any = {};
    if (orderId) where.orderId = orderId;

    const messages = await prisma.message.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, content, attachments } = req.body;

    const user = await prisma.users.findUnique({
      where: { id: req.user!.userId },
    });

    const message = await prisma.message.create({
      data: {
        orderId,
        userId: req.user!.userId,
        sender: 'SELLER',
        senderName: user?.name || 'Sistema',
        content,
        attachments,
      },
      include: {
        order: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Notificar em tempo real
    io.emit('new-message', message);

    res.status(201).json(message);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const message = await prisma.message.update({
      where: { id },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    res.json(message);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
