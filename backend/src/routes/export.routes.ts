import { Router } from 'express'
import { exportProductsToExcel, exportOrdersToExcel, exportUsersToExcel } from '../controllers/export.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

// Todas as rotas requerem autenticação
router.use(authenticate)

// Rotas de exportação
router.get('/products/excel', exportProductsToExcel)
router.get('/orders/excel', exportOrdersToExcel)
router.get('/users/excel', exportUsersToExcel)

export default router
