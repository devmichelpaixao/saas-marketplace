import { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'

/**
 * Sistema de permissões no frontend
 * Sincronizado com o backend (permissions.ts)
 */

export enum Role {
  VIEWER = 'VIEWER',
  OPERATOR = 'OPERATOR',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum Resource {
  PRODUCTS = 'products',
  ORDERS = 'orders',
  USERS = 'users',
  DEPARTMENTS = 'departments',
  REPORTS = 'reports',
  INTEGRATIONS = 'integrations',
  SETTINGS = 'settings',
  AUDIT_LOGS = 'audit_logs',
  BILLING = 'billing',
  TASKS = 'tasks',
  MESSAGES = 'messages',
}

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  IMPORT = 'import',
}

type Permission = `${Resource}:${Action}`

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.VIEWER]: [
    'products:read',
    'orders:read',
    'departments:read',
    'tasks:read',
    'messages:read',
  ],
  
  [Role.OPERATOR]: [
    'products:read',
    'orders:read',
    'orders:update',
    'departments:read',
    'tasks:read',
    'tasks:create',
    'tasks:update',
    'messages:read',
    'messages:create',
  ],
  
  [Role.MANAGER]: [
    'products:read',
    'products:create',
    'products:update',
    'products:export',
    'orders:read',
    'orders:create',
    'orders:update',
    'orders:export',
    'users:read',
    'departments:read',
    'departments:create',
    'departments:update',
    'reports:read',
    'reports:export',
    'tasks:read',
    'tasks:create',
    'tasks:update',
    'tasks:delete',
    'messages:read',
    'messages:create',
    'messages:update',
  ],
  
  [Role.ADMIN]: [
    'products:read', 'products:create', 'products:update', 'products:delete', 'products:export', 'products:import',
    'orders:read', 'orders:create', 'orders:update', 'orders:delete', 'orders:export',
    'users:read', 'users:create', 'users:update', 'users:delete',
    'departments:read', 'departments:create', 'departments:update', 'departments:delete',
    'reports:read', 'reports:export',
    'integrations:read', 'integrations:update',
    'settings:read', 'settings:update',
    'audit_logs:read',
    'billing:read',
    'tasks:read', 'tasks:create', 'tasks:update', 'tasks:delete',
    'messages:read', 'messages:create', 'messages:update', 'messages:delete',
  ],
  
  [Role.SUPER_ADMIN]: [
    'products:read', 'products:create', 'products:update', 'products:delete', 'products:export', 'products:import',
    'orders:read', 'orders:create', 'orders:update', 'orders:delete', 'orders:export',
    'users:read', 'users:create', 'users:update', 'users:delete',
    'departments:read', 'departments:create', 'departments:update', 'departments:delete',
    'reports:read', 'reports:export',
    'integrations:read', 'integrations:update',
    'settings:read', 'settings:update',
    'audit_logs:read',
    'billing:read', 'billing:update',
    'tasks:read', 'tasks:create', 'tasks:update', 'tasks:delete',
    'messages:read', 'messages:create', 'messages:update', 'messages:delete',
  ],
}

/**
 * Hook para verificar permissões do usuário atual
 */
export function usePermissions() {
  const { user } = useAuth()

  const can = (resource: Resource, action: Action): boolean => {
    if (!user) return false
    const userRole = user.role as Role
    const permission: Permission = `${resource}:${action}`
    const permissions = ROLE_PERMISSIONS[userRole] || []
    return permissions.includes(permission)
  }

  const hasRole = (...roles: Role[]): boolean => {
    if (!user) return false
    const userRole = user.role as Role
    const hierarchy = [Role.VIEWER, Role.OPERATOR, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN]
    return roles.some(role => hierarchy.indexOf(userRole) >= hierarchy.indexOf(role))
  }

  return { can, hasRole, role: user?.role as Role }
}

/**
 * Componente para renderizar conteúdo apenas se tiver permissão
 * 
 * @example
 * <Can resource="products" action="create">
 *   <button>Criar Produto</button>
 * </Can>
 */
interface CanProps {
  resource: Resource
  action: Action
  children: ReactNode
  fallback?: ReactNode
}

export function Can({ resource, action, children, fallback = null }: CanProps) {
  const { can } = usePermissions()
  
  if (!can(resource, action)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

/**
 * Componente para renderizar conteúdo apenas se tiver role mínima
 * 
 * @example
 * <RequireRole role="ADMIN">
 *   <AdminPanel />
 * </RequireRole>
 */
interface RequireRoleProps {
  roles: Role | Role[]
  children: ReactNode
  fallback?: ReactNode
}

export function RequireRole({ roles, children, fallback = null }: RequireRoleProps) {
  const { hasRole } = usePermissions()
  const roleArray = Array.isArray(roles) ? roles : [roles]
  
  if (!hasRole(...roleArray)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}
