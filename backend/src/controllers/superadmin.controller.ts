import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Listar todos os tenants com estatísticas
 * GET /api/super-admin/tenants
 */
export const listTenants = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, status, planId } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Construir filtros
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { subdomain: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    if (status === 'active') {
      where.active = true;
    } else if (status === 'inactive') {
      where.active = false;
    }

    if (planId) {
      where.subscriptions = {
        planId: String(planId)
      };
    }

    // Buscar tenants com dados relacionados
    const [tenants, total] = await Promise.all([
      prisma.tenants.findMany({
        where,
        skip,
        take,
        include: {
          subscriptions: {
            include: {
              plan: true
            }
          },
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              active: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              users: true,
              audit_logs: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.tenants.count({ where })
    ]);

    // Formatar resposta com estatísticas
    const tenantsWithStats = tenants.map(tenant => ({
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      active: tenant.active,
      trialEndsAt: tenant.trialEndsAt,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
      plan: tenant.subscriptions?.plan?.name || 'Sem plano',
      planId: tenant.subscriptions?.planId,
      subscriptionStatus: tenant.subscriptions?.status || 'INACTIVE',
      stats: {
        totalUsers: tenant._count.users,
        activeUsers: tenant.users.filter(u => u.active).length,
        totalAuditLogs: tenant._count.audit_logs
      },
      admin: tenant.users.find(u => u.role === 'ADMIN')
    }));

    return res.json({
      tenants: tenantsWithStats,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao listar tenants:', error);
    return res.status(500).json({
      error: 'Erro ao listar tenants',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * Obter detalhes de um tenant específico
 * GET /api/super-admin/tenants/:id
 */
export const getTenant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenants.findUnique({
      where: { id },
      include: {
        subscriptions: {
          include: {
            plan: true
          }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            active: true,
            createdAt: true,
            updatedAt: true
          }
        },
        audit_logs: {
          take: 50,
          orderBy: {
            timestamp: 'desc'
          },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            users: true,
            audit_logs: true
          }
        }
      }
    });

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant não encontrado',
        message: 'O tenant solicitado não existe'
      });
    }

    return res.json(tenant);
  } catch (error) {
    console.error('Erro ao buscar tenant:', error);
    return res.status(500).json({
      error: 'Erro ao buscar tenant',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * Atualizar status de um tenant (ativar/desativar)
 * PATCH /api/super-admin/tenants/:id/status
 */
export const updateTenantStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'O campo "active" deve ser booleano'
      });
    }

    const tenant = await prisma.tenants.update({
      where: { id },
      data: { active }
    });

    return res.json({
      message: `Tenant ${active ? 'ativado' : 'desativado'} com sucesso`,
      tenant
    });
  } catch (error) {
    console.error('Erro ao atualizar status do tenant:', error);
    return res.status(500).json({
      error: 'Erro ao atualizar tenant',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * Alterar plano de um tenant
 * PATCH /api/super-admin/tenants/:id/plan
 */
export const updateTenantPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'O campo "planId" é obrigatório'
      });
    }

    // Verificar se o plano existe
    const plan = await prisma.plans.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return res.status(404).json({
        error: 'Plano não encontrado',
        message: 'O plano solicitado não existe'
      });
    }

    // Atualizar subscription
    const subscription = await prisma.subscriptions.update({
      where: { tenantId: id },
      data: { planId }
    });

    return res.json({
      message: 'Plano atualizado com sucesso',
      subscription
    });
  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    return res.status(500).json({
      error: 'Erro ao atualizar plano',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * Obter estatísticas globais
 * GET /api/super-admin/stats
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    const [
      totalTenants,
      activeTenants,
      totalUsers,
      tenantsByPlan,
      recentTenants
    ] = await Promise.all([
      prisma.tenants.count(),
      prisma.tenants.count({ where: { active: true } }),
      prisma.users.count(),
      prisma.subscriptions.groupBy({
        by: ['planId'],
        _count: true
      }),
      prisma.tenants.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          subdomain: true,
          createdAt: true,
          active: true
        }
      })
    ]);

    // Buscar nomes dos planos
    const planIds = tenantsByPlan.map(item => item.planId);
    const plans = await prisma.plans.findMany({
      where: { id: { in: planIds } },
      select: { id: true, name: true }
    });

    const planMap = new Map(plans.map(p => [p.id, p.name]));

    const tenantsByPlanWithNames = tenantsByPlan.map(item => ({
      planId: item.planId,
      planName: planMap.get(item.planId) || 'Desconhecido',
      count: item._count
    }));

    return res.json({
      totalTenants,
      activeTenants,
      inactiveTenants: totalTenants - activeTenants,
      totalUsers,
      tenantsByPlan: tenantsByPlanWithNames,
      recentTenants
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return res.status(500).json({
      error: 'Erro ao buscar estatísticas',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * Listar todos os planos disponíveis
 * GET /api/super-admin/plans
 */
export const listPlans = async (req: Request, res: Response) => {
  try {
    const plans = await prisma.plans.findMany({
      orderBy: { price: 'asc' },
      include: {
        _count: {
          select: {
            subscriptions: true
          }
        }
      }
    });

    return res.json(plans);
  } catch (error) {
    console.error('Erro ao listar planos:', error);
    return res.status(500).json({
      error: 'Erro ao listar planos',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * Deletar tenant (use com cautela!)
 * DELETE /api/super-admin/tenants/:id
 */
export const deleteTenant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se tenant existe
    const tenant = await prisma.tenants.findUnique({
      where: { id }
    });

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant não encontrado',
        message: 'O tenant solicitado não existe'
      });
    }

    // Deletar tenant (cascade deleta users, subscriptions, audit_logs)
    await prisma.tenants.delete({
      where: { id }
    });

    return res.json({
      message: 'Tenant deletado com sucesso',
      deletedTenant: tenant.name
    });
  } catch (error) {
    console.error('Erro ao deletar tenant:', error);
    return res.status(500).json({
      error: 'Erro ao deletar tenant',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * Criar novo plano
 * POST /api/super-admin/plans
 */
export const createPlan = async (req: Request, res: Response) => {
  try {
    const { name, description, price, maxUsers, maxProducts, maxOrdersPerMonth, features, active } = req.body;

    // Validar dados obrigatórios
    if (!name || !description || price === undefined || !maxUsers || !maxProducts || !maxOrdersPerMonth) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'Todos os campos obrigatórios devem ser preenchidos'
      });
    }

    const plan = await prisma.plans.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        maxUsers: parseInt(maxUsers),
        maxProducts: parseInt(maxProducts),
        maxOrdersPerMonth: parseInt(maxOrdersPerMonth),
        features: features || [],
        active: active !== false
      }
    });

    return res.status(201).json(plan);
  } catch (error) {
    console.error('Erro ao criar plano:', error);
    return res.status(500).json({
      error: 'Erro ao criar plano',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * Atualizar plano
 * PUT /api/super-admin/plans/:id
 */
export const updatePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, maxUsers, maxProducts, maxOrdersPerMonth, features, active } = req.body;

    const plan = await prisma.plans.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        maxUsers: parseInt(maxUsers),
        maxProducts: parseInt(maxProducts),
        maxOrdersPerMonth: parseInt(maxOrdersPerMonth),
        features,
        active
      }
    });

    return res.json(plan);
  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    return res.status(500).json({
      error: 'Erro ao atualizar plano',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * Deletar plano
 * DELETE /api/super-admin/plans/:id
 */
export const deletePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se há subscriptions usando este plano
    const subscriptionsCount = await prisma.subscriptions.count({
      where: { planId: id }
    });

    if (subscriptionsCount > 0) {
      return res.status(400).json({
        error: 'Não é possível deletar',
        message: `Este plano está sendo usado por ${subscriptionsCount} tenant(s)`
      });
    }

    await prisma.plans.delete({
      where: { id }
    });

    return res.json({
      message: 'Plano deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar plano:', error);
    return res.status(500).json({
      error: 'Erro ao deletar plano',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * Ativar/Desativar plano
 * PATCH /api/super-admin/plans/:id/status
 */
export const togglePlanStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const plan = await prisma.plans.update({
      where: { id },
      data: { active }
    });

    return res.json({
      message: `Plano ${active ? 'ativado' : 'desativado'} com sucesso`,
      plan
    });
  } catch (error) {
    console.error('Erro ao atualizar status do plano:', error);
    return res.status(500).json({
      error: 'Erro ao atualizar plano',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * Listar tenants pendentes de aprovação
 * GET /api/super-admin/approvals
 */
export const listApprovals = async (req: Request, res: Response) => {
  try {
    const { status = 'PENDING' } = req.query;

    const where: any = {};
    
    if (status === 'PENDING') {
      where.active = false;
      where.subscriptions = {
        status: 'TRIAL'
      };
    }

    const tenants = await prisma.tenants.findMany({
      where,
      include: {
        subscriptions: {
          include: {
            plan: true
          }
        },
        users: {
          where: { role: 'ADMIN' },
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formatted = tenants.map(tenant => ({
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      adminName: tenant.users[0]?.name || 'N/A',
      adminEmail: tenant.users[0]?.email || 'N/A',
      requestedPlan: tenant.subscriptions?.plan?.name,
      createdAt: tenant.createdAt,
      status: tenant.active ? 'APPROVED' : 'PENDING'
    }));

    return res.json(formatted);
  } catch (error) {
    console.error('Erro ao listar aprovações:', error);
    return res.status(500).json({
      error: 'Erro ao listar aprovações',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * Aprovar tenant
 * POST /api/super-admin/approvals/:id/approve
 */
export const approveTenant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'O campo "planId" é obrigatório'
      });
    }

    // Verificar se o plano existe
    const plan = await prisma.plans.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return res.status(404).json({
        error: 'Plano não encontrado'
      });
    }

    // Atualizar tenant
    const tenant = await prisma.tenants.update({
      where: { id },
      data: { active: true }
    });

    // Atualizar/criar subscription
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    await prisma.subscriptions.upsert({
      where: { tenantId: id },
      update: {
        planId,
        status: 'ACTIVE',
        currentPeriodEnd: endDate
      },
      create: {
        tenantId: id,
        planId,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: endDate
      }
    });

    return res.json({
      message: 'Tenant aprovado com sucesso',
      tenant
    });
  } catch (error) {
    console.error('Erro ao aprovar tenant:', error);
    return res.status(500).json({
      error: 'Erro ao aprovar tenant',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * Rejeitar tenant
 * POST /api/super-admin/approvals/:id/reject
 */
export const rejectTenant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Aqui você pode implementar um sistema de notificação
    // Por enquanto, apenas desativa o tenant
    await prisma.tenants.update({
      where: { id },
      data: { active: false }
    });

    return res.json({
      message: 'Tenant rejeitado',
      reason
    });
  } catch (error) {
    console.error('Erro ao rejeitar tenant:', error);
    return res.status(500).json({
      error: 'Erro ao rejeitar tenant',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

