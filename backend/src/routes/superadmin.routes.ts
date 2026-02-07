import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { requireSuperAdmin, requireNoTenant } from '../middlewares/superadmin.middleware';
import {
  listTenants,
  getTenant,
  updateTenantStatus,
  updateTenantPlan,
  getStats,
  listPlans,
  deleteTenant,
  createPlan,
  updatePlan,
  deletePlan,
  togglePlanStatus,
  listApprovals,
  approveTenant,
  rejectTenant
} from '../controllers/superadmin.controller';

const router = Router();

// Todas as rotas exigem autenticação + SUPER_ADMIN + sem tenant
router.use(authenticate, requireSuperAdmin, requireNoTenant);

/**
 * @route   GET /api/super-admin/stats
 * @desc    Obter estatísticas globais do sistema
 * @access  Super Admin
 */
router.get('/stats', getStats);

/**
 * @route   GET /api/super-admin/tenants
 * @desc    Listar todos os tenants com filtros
 * @access  Super Admin
 * @query   page, limit, search, status, planId
 */
router.get('/tenants', listTenants);

/**
 * @route   GET /api/super-admin/tenants/:id
 * @desc    Obter detalhes de um tenant específico
 * @access  Super Admin
 */
router.get('/tenants/:id', getTenant);

/**
 * @route   PATCH /api/super-admin/tenants/:id/status
 * @desc    Ativar/Desativar um tenant
 * @access  Super Admin
 * @body    { active: boolean }
 */
router.patch('/tenants/:id/status', updateTenantStatus);

/**
 * @route   PATCH /api/super-admin/tenants/:id/plan
 * @desc    Alterar plano de um tenant
 * @access  Super Admin
 * @body    { planId: string }
 */
router.patch('/tenants/:id/plan', updateTenantPlan);

/**
 * @route   DELETE /api/super-admin/tenants/:id
 * @desc    Deletar um tenant (use com cautela!)
 * @access  Super Admin
 */
router.delete('/tenants/:id', deleteTenant);

/**
 * @route   GET /api/super-admin/plans
 * @desc    Listar todos os planos disponíveis
 * @access  Super Admin
 */
router.get('/plans', listPlans);

/**
 * @route   POST /api/super-admin/plans
 * @desc    Criar novo plano
 * @access  Super Admin
 */
router.post('/plans', createPlan);

/**
 * @route   PUT /api/super-admin/plans/:id
 * @desc    Atualizar plano existente
 * @access  Super Admin
 */
router.put('/plans/:id', updatePlan);

/**
 * @route   DELETE /api/super-admin/plans/:id
 * @desc    Deletar plano
 * @access  Super Admin
 */
router.delete('/plans/:id', deletePlan);

/**
 * @route   PATCH /api/super-admin/plans/:id/status
 * @desc    Ativar/Desativar plano
 * @access  Super Admin
 */
router.patch('/plans/:id/status', togglePlanStatus);

/**
 * @route   GET /api/super-admin/approvals
 * @desc    Listar tenants pendentes de aprovação
 * @access  Super Admin
 */
router.get('/approvals', listApprovals);

/**
 * @route   POST /api/super-admin/approvals/:id/approve
 * @desc    Aprovar tenant
 * @access  Super Admin
 */
router.post('/approvals/:id/approve', approveTenant);

/**
 * @route   POST /api/super-admin/approvals/:id/reject
 * @desc    Rejeitar tenant
 * @access  Super Admin
 */
router.post('/approvals/:id/reject', rejectTenant);

export default router;
