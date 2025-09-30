// src/modules/payrun/payrun.routes.ts
import { Router } from 'express';
import * as controller from './payrun.controller';

const router = Router();

// Routes REST PayRun
router.post('/', controller.createPayRun);
router.get('/', controller.listPayRuns);
router.get('/:id', controller.getPayRun);
router.put('/:id/validate', controller.validate);  // passer DRAFT → VALIDATED
router.put('/:id/pay', controller.pay);            // passer VALIDATED → PAID

export default router;
