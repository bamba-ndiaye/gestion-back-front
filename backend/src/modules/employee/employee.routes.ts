import { Router } from 'express';
import * as controller from './employee.controller';
import { authenticateToken, requireAdmin, requireSuperAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// Appliquer l'authentification à toutes les routes
router.use(authenticateToken);

// Seuls les Admins et Super Admins peuvent créer des employés
router.post('/', requireAdmin, controller.createEmployee);

// Tous les rôles authentifiés peuvent lire les employés (mais filtrés)
router.get('/', controller.listEmployees);
router.get('/:id', controller.getEmployee);

// Seuls les Admins et Super Admins peuvent modifier/supprimer
router.put('/:id', requireAdmin, controller.updateEmployeeController);
router.delete('/:id', requireAdmin, controller.deleteEmployeeController);

export default router;
