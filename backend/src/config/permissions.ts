/**
 * Sistema de Permissões Granular
 * 
 * Define roles, permissões e recursos do sistema
 */

// Roles hierárquicas (do menor para o maior privilégio)
export enum Role {
  VIEWER = 'VIEWER',       // Apenas visualizar
  OPERATOR = 'OPERATOR',   // Executar ações básicas
  MANAGER = 'MANAGER',     // Gerenciar recursos
  ADMIN = 'ADMIN',         // Acesso total
  SUPER_ADMIN = 'SUPER_ADMIN' // Super administrador (multi-tenant)
}

// Recursos do sistema
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

// Ações possíveis
export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  IMPORT = 'import',
}

// Tipo de permissão: resource:action
export type Permission = `${Resource}:${Action}`

// Matriz de permissões por role
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.VIEWER]: [
    'products:read',
    'orders:read',
    'departments:read',
    'tasks:read',
    'messages:read',
  ],
  
  [Role.OPERATOR]: [
    // Permissões de VIEWER +
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
    // Permissões de OPERATOR +
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
    // Permissões de MANAGER +
    'products:read',
    'products:create',
    'products:update',
    'products:delete',
    'products:export',
    'products:import',
    'orders:read',
    'orders:create',
    'orders:update',
    'orders:delete',
    'orders:export',
    'users:read',
    'users:create',
    'users:update',
    'users:delete',
    'departments:read',
    'departments:create',
    'departments:update',
    'departments:delete',
    'reports:read',
    'reports:export',
    'integrations:read',
    'integrations:update',
    'settings:read',
    'settings:update',
    'audit_logs:read',
    'billing:read',
    'tasks:read',
    'tasks:create',
    'tasks:update',
    'tasks:delete',
    'messages:read',
    'messages:create',
    'messages:update',
    'messages:delete',
  ],
  
  [Role.SUPER_ADMIN]: [
    // Todas as permissões
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
 * Verifica se uma role tem uma permissão específica
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || []
  return permissions.includes(permission)
}

/**
 * Verifica se uma role tem permissão para um recurso e ação
 */
export function can(role: Role, resource: Resource, action: Action): boolean {
  const permission: Permission = `${resource}:${action}`
  return hasPermission(role, permission)
}

/**
 * Retorna todas as permissões de uma role
 */
export function getPermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

/**
 * Verifica se uma role tem nível hierárquico maior ou igual a outra
 */
export function hasRoleLevel(userRole: Role, requiredRole: Role): boolean {
  const hierarchy = [Role.VIEWER, Role.OPERATOR, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN]
  return hierarchy.indexOf(userRole) >= hierarchy.indexOf(requiredRole)
}
