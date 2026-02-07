import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { cache } from '../middlewares/cache.middleware';
import { getDashboardStats, getSalesReport, getProductGroupReport } from '../controllers/dashboard.controller';

const router = Router();

router.use(authenticate);

// Cache agressivo para dashboard (queries pesadas)
router.get('/stats', cache({ ttl: 120, keyPrefix: 'dashboard', varyBy: ['tenantId'] }), getDashboardStats);
router.get('/sales', cache({ ttl: 180, keyPrefix: 'dashboard', varyBy: ['tenantId'] }), getSalesReport);
router.get('/product-groups', cache({ ttl: 300, keyPrefix: 'dashboard', varyBy: ['tenantId'] }), getProductGroupReport);

export default router;
