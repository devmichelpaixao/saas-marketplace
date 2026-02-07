import { Request, Response, NextFunction } from 'express';

/**
 * Middleware que verifica se o usuário é SUPER_ADMIN
 * Apenas super admins podem acessar rotas protegidas
 */
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        error: 'Não autorizado',
        message: 'Autenticação necessária'
      });
    }

    // Verificar se o usuário tem role SUPER_ADMIN
    if (user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        error: 'Acesso negado',
        message: 'Você não tem permissão para acessar este recurso'
      });
    }

    next();
  } catch (error) {
    console.error('Erro no middleware requireSuperAdmin:', error);
    return res.status(500).json({
      error: 'Erro interno',
      message: 'Falha ao verificar permissões'
    });
  }
};

/**
 * Middleware que permite acesso apenas se o usuário não pertence a nenhum tenant
 * Super admins não devem ter tenantId
 */
export const requireNoTenant = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        error: 'Não autorizado',
        message: 'Autenticação necessária'
      });
    }

    // Super admin não deve ter tenantId
    if (user.tenantId) {
      return res.status(403).json({
        error: 'Acesso negado',
        message: 'Super admins não podem ter tenant associado'
      });
    }

    next();
  } catch (error) {
    console.error('Erro no middleware requireNoTenant:', error);
    return res.status(500).json({
      error: 'Erro interno',
      message: 'Falha ao verificar tenant'
    });
  }
};
