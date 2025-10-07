// src/modules/attendance/attendance.routes.ts
import { Router } from 'express';
import * as controller from './attendance.controller';
import { authenticateToken, requireAdmin, requireCashier } from '../../middlewares/auth.middleware';

const router = Router();

// Appliquer l'authentification à toutes les routes
router.use(authenticateToken);

// Créer ou mettre à jour un pointage (Admins et Cashiers)
router.post('/', requireCashier, controller.createOrUpdateAttendance);

// Check-in et check-out (Tous les rôles authentifiés peuvent faire leur propre pointage)
router.post('/checkin', controller.checkIn);
router.post('/checkout', controller.checkOut);

// Obtenir les pointages d'un employé (Tous les rôles authentifiés)
router.get('/employee/:employeeId', controller.getEmployeeAttendance);

// Obtenir les pointages d'une entreprise (Admins et Super Admins)
router.get('/company', requireAdmin, controller.getCompanyAttendance);

// Résumé des pointages d'un employé
router.get('/summary/:employeeId', controller.getAttendanceSummary);

// Marquer comme absent (Admins seulement)
router.post('/absent', requireAdmin, controller.markAsAbsent);

// Supprimer un pointage (Admins seulement)
router.delete('/:id', requireAdmin, controller.deleteAttendance);

export default router;