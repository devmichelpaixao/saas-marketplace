import { Router } from 'express'
import { getUsers, createUser, updateUser, deleteUser, resetPassword } from '../controllers/user.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

// Todas as rotas requerem autenticação
router.use(authenticate)

// Rotas CRUD de usuários
router.get('/', getUsers)
router.post('/', createUser)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)
router.post('/:id/reset-password', resetPassword)

export default router
