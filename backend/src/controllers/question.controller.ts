import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const { status, listingId } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (listingId) where.listingId = listingId;

    const questions = await prisma.questions.findMany({
      where,
      include: {
        listing: {
          include: {
            product: true,
            integration: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(questions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const answerQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    const question = await prisma.questions.update({
      where: { id },
      data: {
        answer,
        status: 'ANSWERED',
        answeredAt: new Date(),
      },
      include: {
        listing: {
          include: {
            integration: true,
          },
        },
      },
    });

    // Aqui você enviaria a resposta para a API do marketplace
    // Exemplo: await marketplaceService.answerQuestion(question)

    res.json(question);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
