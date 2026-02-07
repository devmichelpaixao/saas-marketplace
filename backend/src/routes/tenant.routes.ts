import { Router } from 'express';
import {
  registerTenant,
  checkSubdomain,
  getPlans,
  getTenantInfo
} from '../controllers/tenant.controller';
import { extractTenant } from '../middlewares/tenant.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { cache } from '../middlewares/cache.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registerTenantSchema, checkSubdomainSchema } from '../schemas/tenant.schema';

const router = Router();

// Rotas públicas (não requerem autenticação ou tenant)
router.post('/register', validate(registerTenantSchema), registerTenant);
router.get('/check-subdomain/:subdomain', validate(checkSubdomainSchema, 'params'), checkSubdomain);
router.get('/plans', cache({ ttl: 3600, keyPrefix: 'plans' }), getPlans);

// Rotas privadas (requerem tenant e autenticação)
router.get('/info', extractTenant, authenticate, getTenantInfo);

export default router;
