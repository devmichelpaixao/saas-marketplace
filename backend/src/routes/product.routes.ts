import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { cache, invalidateCacheOn } from '../middlewares/cache.middleware';
import { validate, validateMultiple } from '../middlewares/validate.middleware';
import { requirePermission, requireRole } from '../middlewares/permission.middleware';
import { Resource, Action, Role } from '../config/permissions';
import {
  createProductSchema,
  updateProductSchema,
  getProductsQuerySchema,
  productIdParamSchema,
  updatePhysicalStockSchema,
} from '../schemas/product.schema';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updatePhysicalStock,
} from '../controllers/product.controller';

const router = Router();

router.use(authenticate);

// POST/PUT/DELETE invalidam cache automaticamente
router.post('/', 
  requirePermission(Resource.PRODUCTS, Action.CREATE), // Novo sistema granular
  validate(createProductSchema), 
  invalidateCacheOn(['products', 'dashboard']), 
  createProduct
);

router.get('/', 
  requirePermission(Resource.PRODUCTS, Action.READ),
  validate(getProductsQuerySchema, 'query'), 
  cache({ ttl: 600, keyPrefix: 'products', varyBy: ['tenantId'] }), 
  getProducts
);

router.get('/:id', 
  requirePermission(Resource.PRODUCTS, Action.READ),
  validate(productIdParamSchema, 'params'),
  cache({ ttl: 300, keyPrefix: 'products', varyBy: ['tenantId'] }), 
  getProductById
);

router.put('/:id', 
  requirePermission(Resource.PRODUCTS, Action.UPDATE),
  validateMultiple({ 
    params: productIdParamSchema, 
    body: updateProductSchema 
  }),
  invalidateCacheOn(['products', 'dashboard']), 
  updateProduct
);

router.delete('/:id', 
  requirePermission(Resource.PRODUCTS, Action.DELETE),
  validate(productIdParamSchema, 'params'),
  invalidateCacheOn(['products', 'dashboard']), 
  deleteProduct
);

// Bulk delete - deve vir ANTES de /:id para não conflitar
router.post('/bulk-delete', 
  requirePermission(Resource.PRODUCTS, Action.DELETE),
  invalidateCacheOn(['products', 'dashboard']), 
  async (req, res, next) => {
    try {
      const { ids } = req.body;
      const tenantId = req.user!.tenantId;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'IDs array is required' });
      }

      // Delete multiple products
      const result = await req.prisma.product.deleteMany({
        where: {
          id: { in: ids },
          tenantId
        }
      });

      res.json({ 
        success: true, 
        count: result.count,
        message: `${result.count} produtos deletados com sucesso` 
      });
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/:id/physical-stock', 
  requireRole(Role.ADMIN, Role.MANAGER, Role.OPERATOR), // Exemplo de role hierárquica
  validateMultiple({ 
    params: productIdParamSchema, 
    body: updatePhysicalStockSchema 
  }),
  invalidateCacheOn(['products', 'dashboard']), 
  updatePhysicalStock
);

export default router;
