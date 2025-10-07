// src/modules/payslip/payslip.routes.ts
import { Router } from 'express';
import * as controller from './payslip.controller';
import { authenticateToken, requireAdmin, requireCashier } from '../../middlewares/auth.middleware';

const router = Router();

// Appliquer l'authentification à toutes les routes
router.use(authenticateToken);

// Générer les bulletins pour un cycle (Admins seulement)
router.post('/generate/:payRunId', requireAdmin, controller.generate);

// Télécharger le PDF d'un bulletin (Tous les rôles authentifiés)
router.get('/download/:payslipId', controller.downloadPDF);

// Obtenir les bulletins d'un employé (Tous les rôles authentifiés)
router.get('/employee/:employeeId', controller.getEmployeePayslips);

// Mettre à jour le paiement d'un bulletin (Cashiers et Admins)
router.put('/:payslipId/payment', requireCashier, controller.updatePayment);

export default router;
