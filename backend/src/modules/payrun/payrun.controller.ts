// src/modules/payrun/payrun.controller.ts
import { Request, Response } from 'express';
import * as service from './payrun.service';

// ➕ Créer un cycle
export async function createPayRun(req: Request, res: Response) {
  try {
    const { month, year, startDate, endDate } = req.body;
    const payRun = await service.createPayRun(month, year, new Date(startDate), new Date(endDate));
    res.status(201).json(payRun);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// 📋 Lister tous les cycles
export async function listPayRuns(_req: Request, res: Response) {
  try {
    const payRuns = await service.getPayRuns();
    res.json(payRuns);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list pay runs' });
  }
}

// 🔍 Détails
export async function getPayRun(req: Request, res: Response) {
  try {
    const payRun = await service.getPayRunById(Number(req.params.id));
    if (!payRun) return res.status(404).json({ error: 'PayRun not found' });
    res.json(payRun);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get pay run' });
  }
}

// ✅ Valider
export async function validate(req: Request, res: Response) {
  try {
    const payRun = await service.validatePayRun(Number(req.params.id));
    res.json(payRun);
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate pay run' });
  }
}

// 💸 Payer
export async function pay(req: Request, res: Response) {
  try {
    const payRun = await service.markPayRunAsPaid(Number(req.params.id));
    res.json(payRun);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark pay run as paid' });
  }
}
