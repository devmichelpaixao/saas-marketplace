import { Request, Response, NextFunction } from 'express'
import { Role, Resource, Action, can, hasRoleLevel } from '../config/permissions'

/**
 * Middleware de autorização granular baseado em permissões
 * 
 * @example
 * // Verificar permissão específica
 * router.post('/products', 
 *   authenticate, 
 *   requirePermission('products', 'create'), 
 *   createProduct
 * )
 * 
 * @example
 * // Verificar role mínima
 * router.delete('/users/:id', 
 *   authenticate, 
 *   requireRole('ADMIN'), 
 *   deleteUser
 * )
 */

/**
 * Middleware para verificar permissão específica (resource:action)
 */
export function requirePermission(resource: Resource, action: Action) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!(req as any).user) {
        return res.status(401).json({ error: 'Não autenticado' })
      }

      const userRole = (req as any).user.role as Role

      if (!can(userRole, resource, action)) {
        return res.status(403).json({ 
          error: 'Acesso negado',
          message: `Você não tem permissão para ${action} em ${resource}`,
          required: `${resource}:${action}`,
          userRole: userRole
        })
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Middleware para verificar role mínima hierárquica
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!(req as any).user) {
        return res.status(401).json({ error: 'Não autenticado' })
      }

      const userRole = (req as any).user.role as Role

      // Verificar se o usuário tem alguma das roles permitidas
      const hasRequiredRole = allowedRoles.some(requiredRole => 
        hasRoleLevel(userRole, requiredRole)
      )

      if (!hasRequiredRole) {
        return res.status(403).json({ 
          error: 'Acesso negado',
          message: 'Você não tem permissão para acessar este recurso',
          required: allowedRoles,
          userRole: userRole
        })
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Middleware para verificar se usuário pode acessar apenas seus próprios recursos
 */
export function requireOwnership(userIdField: string = 'userId') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!(req as any).user) {
        return res.status(401).json({ error: 'Não autenticado' })
      }

      // ADMIN e SUPER_ADMIN podem acessar tudo
      const userRole = (req as any).user.role as Role
      if (userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN) {
        return next()
      }

      // Buscar ID do recurso nos params ou body
      const resourceUserId = req.params[userIdField] || req.body[userIdField]
      
      if (!resourceUserId) {
        return res.status(400).json({ 
          error: 'ID do usuário não encontrado',
          field: userIdField 
        })
      }

      if (resourceUserId !== (req as any).user.id) {
        return res.status(403).json({ 
          error: 'Acesso negado',
          message: 'Você só pode acessar seus próprios recursos'
        })
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Decorator para adicionar permissões verificadas no request
 */
export function attachPermissions(req: Request, res: Response, next: NextFunction) {
  if ((req as any).user) {
    const userRole = (req as any).user.role as Role
    
    // Adicionar helper no request
    (req as any).can = (resource: Resource, action: Action) => can(userRole, resource, action);
    (req as any).hasRole = (...roles: Role[]) => roles.some(role => hasRoleLevel(userRole, role))
  }
  
  next()
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      can?: (resource: Resource, action: Action) => boolean
      hasRole?: (...roles: Role[]) => boolean
    }
  }
}
