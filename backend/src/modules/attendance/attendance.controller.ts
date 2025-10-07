// src/modules/attendance/attendance.controller.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import * as service from './attendance.service';

// Créer ou mettre à jour un pointage
export async function createOrUpdateAttendance(req: AuthRequest, res: Response) {
  try {
    const { employeeId, date, checkIn, checkOut, status, notes } = req.body;

    const attendance = await service.createOrUpdateAttendance(
      employeeId,
      new Date(date),
      checkIn ? new Date(checkIn) : undefined,
      checkOut ? new Date(checkOut) : undefined,
      status,
      notes
    );

    res.status(201).json(attendance);
  } catch (error: any) {
    console.error('Error creating/updating attendance:', error);
    res.status(400).json({ error: error.message });
  }
}

// Check-in (arrivée)
export async function checkIn(req: AuthRequest, res: Response) {
  try {
    const { employeeId } = req.body;
    const attendance = await service.checkIn(employeeId);
    res.status(201).json(attendance);
  } catch (error: any) {
    console.error('Error checking in:', error);
    res.status(400).json({ error: error.message });
  }
}

// Check-out (départ)
export async function checkOut(req: AuthRequest, res: Response) {
  try {
    const { employeeId } = req.body;
    const attendance = await service.checkOut(employeeId);
    res.status(200).json(attendance);
  } catch (error: any) {
    console.error('Error checking out:', error);
    res.status(400).json({ error: error.message });
  }
}

// Obtenir les pointages d'un employé
export async function getEmployeeAttendance(req: AuthRequest, res: Response) {
  try {
    const employeeId = Number(req.params.employeeId);
    const { startDate, endDate } = req.query;

    const attendances = await service.getEmployeeAttendance(
      employeeId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json(attendances);
  } catch (error: any) {
    console.error('Error getting employee attendance:', error);
    res.status(500).json({ error: error.message });
  }
}

// Obtenir les pointages d'une entreprise
export async function getCompanyAttendance(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user?.companyId;
    if (!companyId && req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Company access required' });
    }

    const targetCompanyId = req.user?.role === 'SUPER_ADMIN' && req.query.companyId
      ? Number(req.query.companyId)
      : companyId;

    const { startDate, endDate } = req.query;

    const attendances = await service.getCompanyAttendance(
      targetCompanyId!,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json(attendances);
  } catch (error: any) {
    console.error('Error getting company attendance:', error);
    res.status(500).json({ error: error.message });
  }
}

// Obtenir le résumé des pointages
export async function getAttendanceSummary(req: AuthRequest, res: Response) {
  try {
    const employeeId = Number(req.params.employeeId);
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const summary = await service.getAttendanceSummary(
      employeeId,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json(summary);
  } catch (error: any) {
    console.error('Error getting attendance summary:', error);
    res.status(500).json({ error: error.message });
  }
}

// Marquer comme absent
export async function markAsAbsent(req: AuthRequest, res: Response) {
  try {
    const { employeeId, date, notes } = req.body;
    const attendance = await service.markAsAbsent(employeeId, new Date(date), notes);
    res.status(201).json(attendance);
  } catch (error: any) {
    console.error('Error marking as absent:', error);
    res.status(400).json({ error: error.message });
  }
}

// Supprimer un pointage
export async function deleteAttendance(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    await service.deleteAttendance(id);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ error: error.message });
  }
}