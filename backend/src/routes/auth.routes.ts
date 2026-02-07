import { Router } from 'express';
import { login, register, me } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { extractTenant } from '../middlewares/tenant.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/register', extractTenant, validate(registerSchema), register);
router.post('/login', extractTenant, validate(loginSchema), login);
router.get('/me', authenticate, me);

export default router;
