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