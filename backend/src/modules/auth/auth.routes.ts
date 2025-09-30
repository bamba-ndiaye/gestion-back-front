import { Router } from 'express';
import { register, login, getUserInterface } from './auth.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/interface', authenticateToken, getUserInterface);

export default router;
