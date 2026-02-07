import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name, role } = req.body;
    const tenantId = req.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant não identificado' });
    }

    // Verificar se usuário já existe neste tenant
    const existingUser = await prisma.users.findUnique({ 
      where: { 
        tenantId_email: {
          tenantId,
          email
        }
      } 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await prisma.users.create({
      data: {
        tenantId,
        email,
        password: hashedPassword,
        name,
        role: role || 'OPERATOR',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });

    res.status(201).json({ message: 'Usuário criado com sucesso', user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    
    req.logger.info('Login attempt', { email });
    const tenantId = req.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant não identificado' });
    }

    // Buscar usuário com tenantId e email
    const user = await prisma.users.findUnique({ 
      where: { 
        tenantId_email: {
          tenantId,
          email
        }
      } 
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (!user.active) {
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    req.logger.info('Login successful', { userId: user.id, email: user.email, role: user.role });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (error: any) {
    req.logger.error('Login failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        active: true,
        createdAt: true,
        department: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
