import { Router } from 'express';
import { register, login, logout, googleLogin } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/google', googleLogin);

router.get('/me', authMiddleware, (req, res) => {
  res.status(200).json({ user: req.user });
});

export default router;
