// src/modules/payslip/payslip.routes.ts
import { Router } from 'express';
import * as controller from './payslip.controller';

const router = Router();

// Générer les bulletins pour un cycle
router.post('/generate/:payRunId', controller.generate);

// Télécharger le PDF d’un bulletin
router.get('/download/:payslipId', controller.downloadPDF);

export default router;
