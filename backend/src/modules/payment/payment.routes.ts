import { Router } from 'express';
import * as controller from './payment.controller';

const router = Router();

// Payer un bulletin
router.put('/payslip/:payslipId', controller.pay);

export default router;
