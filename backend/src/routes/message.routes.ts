import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getMessages, sendMessage, markAsRead } from '../controllers/message.controller';

const router = Router();

router.use(authenticate);

router.get('/', getMessages);
router.post('/', sendMessage);
router.patch('/:id/read', markAsRead);

export default router;
