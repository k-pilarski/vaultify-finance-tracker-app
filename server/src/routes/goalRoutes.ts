import { Router } from 'express';
import * as goalController from '../controllers/goalController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', goalController.getGoals);
router.post('/', goalController.createGoal);
router.delete('/:id', goalController.deleteGoal);

export default router;
