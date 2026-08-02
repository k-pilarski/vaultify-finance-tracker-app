import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/summary', analyticsController.getMonthlySummary);
router.get('/by-category', analyticsController.getCategoryBreakdown);

export default router;
