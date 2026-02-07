import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
  createWorkflowStep,
  getWorkflowSteps,
} from '../controllers/department.controller';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'MANAGER'), createDepartment);
router.get('/', getDepartments);
router.put('/:id', authorize('ADMIN', 'MANAGER'), updateDepartment);
router.delete('/:id', authorize('ADMIN'), deleteDepartment);
router.post('/workflow', authorize('ADMIN', 'MANAGER'), createWorkflowStep);
router.get('/workflow', getWorkflowSteps);

export default router;
