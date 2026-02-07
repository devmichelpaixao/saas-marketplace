import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getQuestions, answerQuestion } from '../controllers/question.controller';

const router = Router();

router.use(authenticate);

router.get('/', getQuestions);
router.post('/:id/answer', answerQuestion);

export default router;
