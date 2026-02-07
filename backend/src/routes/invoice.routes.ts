import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import * as invoiceController from '../controllers/invoice.controller'

const router = Router()

// Todas as rotas requerem autenticação
router.use(authenticate)

// Rotas de Empresa
router.get('/companies', invoiceController.getCompanies)
router.post('/companies', invoiceController.upsertCompany)

// Rotas de Notas Fiscais
router.get('/', invoiceController.getInvoices)
router.post('/', invoiceController.createInvoice)
router.post('/:id/emit', invoiceController.emitInvoice)
router.post('/:id/cancel', invoiceController.cancelInvoice)
router.get('/:id/pdf', invoiceController.downloadPDF)

export default router
