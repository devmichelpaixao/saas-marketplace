import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getAuditLogs, getAuditStats } from '../controllers/audit.controller';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Listar logs de auditoria
router.get('/', getAuditLogs);

// Estatísticas de auditoria
router.get('/stats', getAuditStats);

export default router;
