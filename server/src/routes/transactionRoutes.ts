import { Router } from 'express';
import * as transactionController from '../controllers/transactionController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Apply auth middleware to all routes in this router
router.use(authMiddleware);

router.get('/', transactionController.getTransactions);
router.post('/', transactionController.createTransaction);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

export default router;
