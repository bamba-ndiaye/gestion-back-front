// src/modules/payslip/payslip.controller.ts
import { Request, Response } from 'express';
import * as service from './payslip.service';
import fs from 'fs';

// Générer tous les bulletins pour un PayRun
export async function generate(req: Request, res: Response) {
  try {
    const payRunId = Number(req.params.payRunId);
    const payslips = await service.generatePayslips(payRunId);
    res.status(201).json(payslips);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
// Télécharger le PDF d’un bulletin
export async function downloadPDF(req: Request, res: Response) {
  const payslipId = Number(req.params.payslipId);

  try {
    const payslip = await service.getPayslipById(payslipId);
    if (!payslip || !payslip.generatedPdfUrl) {
      return res.status(404).json({ error: 'PDF non trouvé' });
    }

    const filePath = payslip.generatedPdfUrl;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier PDF manquant' });
    }

    res.download(filePath, `payslip_${payslip.id}.pdf`);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Obtenir les bulletins d'un employé
export async function getEmployeePayslips(req: Request, res: Response) {
  const employeeId = Number(req.params.employeeId);

  try {
    const payslips = await service.getPayslipsByEmployee(employeeId);
    res.json(payslips);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Mettre à jour le paiement d'un bulletin
export async function updatePayment(req: Request, res: Response) {
  const payslipId = Number(req.params.payslipId);
  const { amountPaid } = req.body;

  try {
    const payslip = await service.updatePayslipPayment(payslipId, amountPaid);
    res.json(payslip);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}