import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middlewares/auth.middleware'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req

    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant não identificado' })
    }

    const users = await prisma.users.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(users)
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    res.status(500).json({ message: 'Erro ao buscar usuários' })
  }
}

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId, user: currentUser } = req
    const { email, name, password, role, departmentId } = req.body

    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant não identificado' })
    }

    // Apenas ADMINs podem criar usuários
    if (currentUser?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Sem permissão para criar usuários' })
    }

    // Verificar se email já existe no tenant
    const existingUser = await prisma.users.findFirst({
      where: {
        tenantId,
        email
      }
    })

    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado neste tenant' })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.users.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || 'USER',
        tenantId,
        active: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true
      }
    })

    res.status(201).json(newUser)
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    res.status(500).json({ message: 'Erro ao criar usuário' })
  }
}

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId, user: currentUser } = req
    const { id } = req.params
    const { email, name, role, departmentId, active } = req.body

    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant não identificado' })
    }

    // Apenas ADMINs podem atualizar usuários
    if (currentUser?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Sem permissão para atualizar usuários' })
    }

    // Verificar se usuário existe e pertence ao tenant
    const existingUser = await prisma.users.findFirst({
      where: {
        id,
        tenantId
      }
    })

    if (!existingUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' })
    }

    // Não permitir que o usuário altere seu próprio role
    if (existingUser.id === (currentUser as any)?.id && role && role !== existingUser.role) {
      return res.status(400).json({ message: 'Você não pode alterar seu próprio cargo' })
    }

    const updatedUser = await prisma.users.update({
      where: { id },
      data: {
        email: email || existingUser.email,
        name: name || existingUser.name,
        role: role || existingUser.role,
        active: active !== undefined ? active : existingUser.active
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true
      }
    })

    res.json(updatedUser)
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    res.status(500).json({ message: 'Erro ao atualizar usuário' })
  }
}

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId, user: currentUser } = req
    const { id } = req.params

    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant não identificado' })
    }

    // Apenas ADMINs podem excluir usuários
    if (currentUser?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Sem permissão para excluir usuários' })
    }

    // Verificar se usuário existe e pertence ao tenant
    const existingUser = await prisma.users.findFirst({
      where: {
        id,
        tenantId
      }
    })

    if (!existingUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' })
    }

    // Não permitir que o usuário exclua a si mesmo
    if (existingUser.id === (currentUser as any)?.id) {
      return res.status(400).json({ message: 'Você não pode excluir sua própria conta' })
    }

    await prisma.users.delete({
      where: { id }
    })

    res.json({ message: 'Usuário excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    res.status(500).json({ message: 'Erro ao excluir usuário' })
  }
}

export const resetPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId, user: currentUser } = req
    const { id } = req.params
    const { newPassword } = req.body

    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant não identificado' })
    }

    // Apenas ADMINs podem resetar senhas
    if (currentUser?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Sem permissão para resetar senhas' })
    }

    // Verificar se usuário existe e pertence ao tenant
    const existingUser = await prisma.users.findFirst({
      where: {
        id,
        tenantId
      }
    })

    if (!existingUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' })
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.users.update({
      where: { id },
      data: {
        password: hashedPassword
      }
    })

    res.json({ message: 'Senha resetada com sucesso' })
  } catch (error) {
    console.error('Erro ao resetar senha:', error)
    res.status(500).json({ message: 'Erro ao resetar senha' })
  }
}
