import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  saveConfig,
  getIntegrations,
  authMercadoLivre,
  callbackMercadoLivre,
  authShopee,
  callbackShopee,
  connectMercadoLivre,
  connectShopee,
  syncListings,
  syncOrders,
} from '../controllers/marketplace.controller';

const router = Router();

router.use(authenticate);

// Configuração
router.post('/config', authorize('ADMIN', 'MANAGER'), saveConfig);
router.get('/integrations', getIntegrations);

// OAuth Mercado Livre
router.get('/mercadolivre/auth', authMercadoLivre);
router.get('/mercadolivre/callback', callbackMercadoLivre);

// OAuth Shopee
router.get('/shopee/auth', authShopee);
router.get('/shopee/callback', callbackShopee);

// Legado
router.post('/mercadolivre/connect', authorize('ADMIN', 'MANAGER'), connectMercadoLivre);
router.post('/shopee/connect', authorize('ADMIN', 'MANAGER'), connectShopee);
router.post('/sync/listings', syncListings);
router.post('/sync/orders', syncOrders);

export default router;
