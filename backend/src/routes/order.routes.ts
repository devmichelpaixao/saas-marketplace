import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { cache, invalidateCacheOn } from '../middlewares/cache.middleware';
import { validate, validateMultiple } from '../middlewares/validate.middleware';
import {
  createOrderSchema,
  getOrdersQuerySchema,
  orderIdParamSchema,
  updateOrderStatusSchema,
  moveToDepartmentSchema,
  scanBarcodeSchema,
} from '../schemas/order.schema';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  moveToDepartment,
  scanBarcode,
  printShippingLabel,
} from '../controllers/order.controller';

const router = Router();

router.use(authenticate);

router.post('/', 
  authorize('ADMIN', 'MANAGER', 'OPERATOR'), 
  validate(createOrderSchema),
  invalidateCacheOn(['orders', 'dashboard']), 
  createOrder
);

router.get('/', 
  validate(getOrdersQuerySchema, 'query'),
  cache({ ttl: 300, keyPrefix: 'orders', varyBy: ['tenantId'] }), 
  getOrders
);

router.get('/:id', 
  validate(orderIdParamSchema, 'params'),
  cache({ ttl: 180, keyPrefix: 'orders', varyBy: ['tenantId'] }), 
  getOrderById
);

router.patch('/:id/status', 
  authorize('ADMIN', 'MANAGER', 'OPERATOR'), 
  validateMultiple({ 
    params: orderIdParamSchema, 
    body: updateOrderStatusSchema 
  }),
  invalidateCacheOn(['orders', 'dashboard']), 
  updateOrderStatus
);

router.patch('/:id/department', 
  authorize('ADMIN', 'MANAGER', 'OPERATOR'), 
  validateMultiple({ 
    params: orderIdParamSchema, 
    body: moveToDepartmentSchema 
  }),
  invalidateCacheOn(['orders', 'dashboard']), 
  moveToDepartment
);

router.post('/scan', 
  validate(scanBarcodeSchema),
  scanBarcode
);

router.post('/:id/print-label', 
  validate(orderIdParamSchema, 'params'),
  printShippingLabel
);

export default router;
