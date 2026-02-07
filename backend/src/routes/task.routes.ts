import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getTasks, createTask, updateTask, completeTask } from '../controllers/task.controller';

const router = Router();

router.use(authenticate);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/complete', completeTask);

export default router;
