import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Registrar novo tenant (empresa)
 * POST /api/tenant/register
 */
export const registerTenant = async (req: Request, res: Response) => {
  try {
    const {
      companyName,
      subdomain,
      adminName,
      adminEmail,
      adminPassword,
      planId
    } = req.body;

    // Validações
    if (!companyName || !subdomain || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({
        error: 'Dados incompletos',
        message: 'Todos os campos são obrigatórios'
      });
    }

    // Validar formato do subdomínio (apenas letras, números e hífen)
    const subdomainRegex = /^[a-z0-9-]+$/;
    if (!subdomainRegex.test(subdomain)) {
      return res.status(400).json({
        error: 'Subdomínio inválido',
        message: 'Use apenas letras minúsculas, números e hífen'
      });
    }

    // Subdomínios reservados
    const reservedSubdomains = [
      'www', 'api', 'admin', 'app', 'sistema', 'suporte', 'help',
      'mail', 'smtp', 'ftp', 'ssh', 'cdn', 'assets', 'static'
    ];

    if (reservedSubdomains.includes(subdomain)) {
      return res.status(400).json({
        error: 'Subdomínio reservado',
        message: 'Este subdomínio não está disponível'
      });
    }

    // Verificar se subdomínio já existe
    const existingTenant = await prisma.tenants.findUnique({
      where: { subdomain }
    });

    if (existingTenant) {
      return res.status(409).json({
        error: 'Subdomínio em uso',
        message: 'Este subdomínio já está sendo usado'
      });
    }

    // Verificar se email já existe
    const existingUser = await prisma.users.findFirst({
      where: { email: adminEmail }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Email em uso',
        message: 'Este email já está cadastrado'
      });
    }

    // Buscar plano (usar plano básico por padrão se não especificado)
    let plan = null;
    if (planId) {
      plan = await prisma.plans.findUnique({ where: { id: planId } });
    } else {
      plan = await prisma.plans.findFirst({
        where: { name: 'Básico', active: true }
      });
    }

    if (!plan) {
      return res.status(400).json({
        error: 'Plano não encontrado',
        message: 'Selecione um plano válido'
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Calcular data de fim do trial (14 dias)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    // Criar tenant, usuário admin e subscription em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar tenant
      const tenant = await tx.tenants.create({
        data: {
          name: companyName,
          subdomain: subdomain.toLowerCase(),
          active: true,
          trialEndsAt
        }
      });

      // Criar usuário admin
      const adminUser = await tx.users.create({
        data: {
          tenantId: tenant.id,
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          active: true
        }
      });

      // Criar subscription
      const now = new Date();
      const periodEnd = new Date(trialEndsAt);

      const subscription = await tx.subscriptions.create({
        data: {
          tenantId: tenant.id,
          planId: plan!.id,
          status: 'TRIAL',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd
        }
      });

      // Criar departamentos padrão
      const departments = await Promise.all([
        tx.departments.create({
          data: {
            tenantId: tenant.id,
            name: 'Criação',
            description: 'Design e criação de artes',
            order: 1,
            color: '#3b82f6'
          }
        }),
        tx.departments.create({
          data: {
            tenantId: tenant.id,
            name: 'Pré-impressão',
            description: 'Preparação para impressão',
            order: 2,
            color: '#8b5cf6'
          }
        }),
        tx.departments.create({
          data: {
            tenantId: tenant.id,
            name: 'Impressão',
            description: 'Impressão dos produtos',
            order: 3,
            color: '#f59e0b'
          }
        }),
        tx.departments.create({
          data: {
            tenantId: tenant.id,
            name: 'Expedição',
            description: 'Embalagem e envio',
            order: 4,
            color: '#10b981'
          }
        })
      ]);

      return {
        tenant,
        adminUser,
        subscription,
        departments
      };
    });

    return res.status(201).json({
      message: 'Conta criada com sucesso!',
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        subdomain: result.tenant.subdomain,
        trialEndsAt: result.tenant.trialEndsAt
      },
      admin: {
        id: result.adminUser.id,
        name: result.adminUser.name,
        email: result.adminUser.email
      },
      subscription: {
        plan: plan.name,
        status: result.subscription.status,
        trialEndsAt: result.tenant.trialEndsAt
      },
      accessUrl: `https://${result.tenant.subdomain}.sistema.com`,
      devAccessUrl: `http://localhost:5173` // Para desenvolvimento
    });

  } catch (error) {
    console.error('Erro ao registrar tenant:', error);
    return res.status(500).json({
      error: 'Erro interno',
      message: 'Não foi possível criar a conta'
    });
  }
};

/**
 * Verificar disponibilidade de subdomínio
 * GET /api/tenant/check-subdomain/:subdomain
 */
export const checkSubdomain = async (req: Request, res: Response) => {
  try {
    const { subdomain } = req.params;

    // Validar formato
    const subdomainRegex = /^[a-z0-9-]+$/;
    if (!subdomainRegex.test(subdomain)) {
      return res.json({
        available: false,
        message: 'Use apenas letras minúsculas, números e hífen'
      });
    }

    // Subdomínios reservados
    const reservedSubdomains = [
      'www', 'api', 'admin', 'app', 'sistema', 'suporte', 'help',
      'mail', 'smtp', 'ftp', 'ssh', 'cdn', 'assets', 'static'
    ];

    if (reservedSubdomains.includes(subdomain)) {
      return res.json({
        available: false,
        message: 'Este subdomínio está reservado'
      });
    }

    // Verificar no banco
    const existing = await prisma.tenants.findUnique({
      where: { subdomain: subdomain.toLowerCase() }
    });

    return res.json({
      available: !existing,
      message: existing ? 'Este subdomínio já está em uso' : 'Subdomínio disponível!'
    });

  } catch (error) {
    console.error('Erro ao verificar subdomínio:', error);
    return res.status(500).json({
      error: 'Erro interno',
      message: 'Não foi possível verificar o subdomínio'
    });
  }
};

/**
 * Listar planos disponíveis
 * GET /api/tenant/plans
 */
export const getPlans = async (req: Request, res: Response) => {
  try {
    const plans = await prisma.plans.findMany({
      where: { active: true },
      orderBy: { price: 'asc' }
    });

    return res.json(plans);

  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    return res.status(500).json({
      error: 'Erro interno',
      message: 'Não foi possível buscar os planos'
    });
  }
};

/**
 * Obter informações do tenant atual
 * GET /api/tenant/info
 */
export const getTenantInfo = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req;

    if (!tenantId) {
      return res.status(401).json({
        error: 'Não autenticado',
        message: 'Tenant não identificado'
      });
    }

    const tenant = await prisma.tenants.findUnique({
      where: { id: tenantId },
      include: {
        subscription: {
          include: {
            plan: true,
            payments: {
              orderBy: { createdAt: 'desc' },
              take: 5
            }
          }
        },
        _count: {
          select: {
            users: true,
            products: true,
            orders: true,
            departments: true
          }
        }
      }
    });

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant não encontrado'
      });
    }

    return res.json(tenant);

  } catch (error) {
    console.error('Erro ao buscar tenant:', error);
    return res.status(500).json({
      error: 'Erro interno',
      message: 'Não foi possível buscar informações do tenant'
    });
  }
};

export default {
  registerTenant,
  checkSubdomain,
  getPlans,
  getTenantInfo
};
