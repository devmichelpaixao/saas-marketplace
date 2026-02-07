import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extender o tipo Request para incluir tenantId
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenant?: any;
    }
  }
}

/**
 * Middleware para extrair e validar o tenant baseado no subdomínio
 * Formato esperado: subdomain.sistema.com
 */
export const extractTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Em desenvolvimento, aceitar X-Tenant-ID do header
    const tenantIdHeader = req.get('X-Tenant-ID');
    let subdomain: string | null = null;
    
    if (tenantIdHeader && process.env.NODE_ENV === 'development') {
      subdomain = tenantIdHeader;
    } else {
      // Extrair subdomínio do host
      const host = req.get('host') || '';
      subdomain = extractSubdomain(host);
    }

    // Se não houver subdomínio, retornar erro
    if (!subdomain) {
      return res.status(400).json({
        error: 'Subdomínio inválido',
        message: 'Acesse através de seu subdomínio: empresa.sistema.com'
      });
    }

    // Buscar tenant no banco
    const tenant = await prisma.tenants.findUnique({
      where: { subdomain },
      include: {
        subscriptions: {
          include: {
            plan: true
          }
        }
      }
    });

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant não encontrado',
        message: 'Esta empresa não está cadastrada no sistema'
      });
    }

    // Validar se o tenant está ativo
    if (!tenant.active) {
      return res.status(403).json({
        error: 'Conta desativada',
        message: 'Entre em contato com o suporte'
      });
    }

    // Validar subscription
    if (tenant.subscriptions) {
      const now = new Date();
      
      // Se trial expirou e não tem subscription ativa
      if (tenant.trialEndsAt && tenant.trialEndsAt < now && 
          tenant.subscriptions.status !== 'ACTIVE') {
        return res.status(402).json({
          error: 'Período de trial expirado',
          message: 'Atualize seu plano para continuar usando o sistema'
        });
      }

      // Se subscription está cancelada ou expirada
      if (['CANCELED', 'EXPIRED'].includes(tenant.subscriptions.status)) {
        return res.status(402).json({
          error: 'Subscription inativa',
          message: 'Renove sua assinatura para continuar'
        });
      }

      // Se pagamento está atrasado
      if (tenant.subscriptions.status === 'PAST_DUE') {
        return res.status(402).json({
          error: 'Pagamento pendente',
          message: 'Atualize suas informações de pagamento',
          allowLimitedAccess: true // Permite acesso limitado
        });
      }
    }

    // Adicionar tenant no request para uso nos controllers
    req.tenantId = tenant.id;
    req.tenant = tenant;

    next();
  } catch (error) {
    console.error('Erro no middleware de tenant:', error);
    return res.status(500).json({
      error: 'Erro interno',
      message: 'Não foi possível validar o tenant'
    });
  }
};

/**
 * Extrair subdomínio do host
 * Exemplos:
 * - empresa1.sistema.com -> empresa1
 * - localhost:3000 -> localhost (dev)
 * - sistema.com -> null
 */
function extractSubdomain(host: string): string | null {
  // Remover porta se existir
  const hostname = host.split(':')[0];
  
  // Em desenvolvimento, aceitar localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return process.env.DEV_TENANT_SUBDOMAIN || 'demo';
  }

  // Dividir por pontos
  const parts = hostname.split('.');

  // Se tiver apenas 2 partes (dominio.com), não há subdomínio
  if (parts.length <= 2) {
    return null;
  }

  // Retornar a primeira parte (subdomínio)
  return parts[0];
}

/**
 * Middleware para verificar limites do plano
 */
export const checkPlanLimits = (resource: 'users' | 'products' | 'orders') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId, tenant } = req;

      if (!tenant || !tenant.subscription) {
        return next();
      }

      const plan = tenant.subscription.plan;
      let currentCount = 0;
      let limit = 0;

      switch (resource) {
        case 'users':
          currentCount = await prisma.users.count({ where: { tenantId } });
          limit = plan.maxUsers;
          break;
        case 'products':
          currentCount = await prisma.product.count({ where: { tenantId } });
          limit = plan.maxProducts;
          break;
        case 'orders':
          // Contar pedidos do mês atual
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);
          
          currentCount = await prisma.order.count({
            where: {
              tenantId,
              createdAt: { gte: startOfMonth }
            }
          });
          limit = plan.maxOrders;
          break;
      }

      if (currentCount >= limit) {
        return res.status(403).json({
          error: 'Limite do plano atingido',
          message: `Seu plano permite até ${limit} ${resource}. Faça upgrade para continuar.`,
          resource,
          current: currentCount,
          limit
        });
      }

      next();
    } catch (error) {
      console.error('Erro ao verificar limites do plano:', error);
      next(); // Em caso de erro, permitir continuar
    }
  };
};

/**
 * Middleware para adicionar filtro de tenant automaticamente nas queries
 * Deve ser usado após extractTenant
 */
export const tenantFilter = (req: Request, res: Response, next: NextFunction) => {
  if (!req.tenantId) {
    return res.status(401).json({
      error: 'Tenant não identificado',
      message: 'Acesse através de seu subdomínio'
    });
  }

  // Aqui poderíamos adicionar lógica para modificar automaticamente
  // as queries do Prisma, mas por enquanto apenas validamos
  next();
};

export default {
  extractTenant,
  checkPlanLimits,
  tenantFilter
};
