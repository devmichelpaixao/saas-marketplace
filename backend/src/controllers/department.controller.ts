import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, order, color } = req.body;

    const department = await prisma.departments.create({
      data: { tenantId: req.tenantId!, name, description, order, color },
    });

    res.status(201).json(department);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDepartments = async (req: AuthRequest, res: Response) => {
  try {
    const departments = await prisma.departments.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { orders: true, users: true },
        },
      },
    });

    res.json(departments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const department = await prisma.departments.update({
      where: { id },
      data,
    });

    res.json(department);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.departments.update({
      where: { id },
      data: { active: false },
    });

    res.json({ message: 'Departamento desativado com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createWorkflowStep = async (req: AuthRequest, res: Response) => {
  try {
    const { fromDepartmentId, toDepartmentId, order } = req.body;

    const workflow = await prisma.workflowStep.create({
      data: {
        fromDepartmentId,
        toDepartmentId,
        order: order || 0,
      },
      include: {
        fromDepartment: true,
        toDepartment: true,
      },
    });

    res.status(201).json(workflow);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getWorkflowSteps = async (req: AuthRequest, res: Response) => {
  try {
    const workflows = await prisma.workflowStep.findMany({
      where: { active: true },
      include: {
        fromDepartment: true,
        toDepartment: true,
      },
      orderBy: { order: 'asc' },
    });

    res.json(workflows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
