// src/modules/payrun/payrun.routes.ts
import { Router } from 'express';
import * as controller from './payrun.controller';
import { authenticateToken, requireAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// Appliquer l'authentification à toutes les routes
router.use(authenticateToken);

// Routes REST PayRun (Admins seulement pour création/modification)
router.post('/', requireAdmin, controller.createPayRun);
router.put('/:id/validate', requireAdmin, controller.validate);  // passer DRAFT → VALIDATED
router.put('/:id/pay', requireAdmin, controller.pay);            // passer VALIDATED → PAID

// Lecture accessible à tous les rôles authentifiés
router.get('/', controller.listPayRuns);
router.get('/:id', controller.getPayRun);

export default router;
