import { Router } from 'express';
import { registerUser, getAllUsers } from './user.service';
import { authenticateToken, requireSuperAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// Appliquer l'authentification à toutes les routes
router.use(authenticateToken);

// Créer un utilisateur (Super Admin seulement)
router.post('/', requireSuperAdmin, async (req, res) => {
  const {userName, email, password, role } = req.body;
  try {
   const user = await registerUser({ name: userName, email, password, role });
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Récupérer tous les utilisateurs (Super Admin seulement)
router.get('/', requireSuperAdmin, async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;