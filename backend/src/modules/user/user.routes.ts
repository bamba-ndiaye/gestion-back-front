import { Router } from 'express';
import { registerUser } from './user.service';

const router = Router();

router.post('/', async (req, res) => {
  const {userName, email, password, role } = req.body;
  try {
   const user = await registerUser({ name: userName, email, password, role });
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});


export default router;