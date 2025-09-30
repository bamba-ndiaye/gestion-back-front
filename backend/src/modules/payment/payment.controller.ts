import { Request, Response } from 'express';
import * as service from './payment.service';

// Paiement d’un bulletin
export async function pay(req: Request, res: Response) {
  try {
    const payslipId = Number(req.params.payslipId);
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Montant invalide' });
    }

    const result = await service.payPayslip(payslipId, amount);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
