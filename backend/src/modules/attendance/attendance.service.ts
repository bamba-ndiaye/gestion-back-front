// src/modules/attendance/attendance.service.ts
import { PrismaClient, AttendanceStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Créer ou mettre à jour un pointage
export async function createOrUpdateAttendance(employeeId: number, date: Date, checkIn?: Date | null, checkOut?: Date | null, status?: AttendanceStatus, notes?: string | null) {
  console.log(`[DEBUG] Creating/updating attendance for employee ${employeeId} on ${date.toISOString().split('T')[0]}`);

  // Normaliser la date (seulement YYYY-MM-DD)
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const attendance = await prisma.attendance.upsert({
    where: {
      employeeId_date: {
        employeeId,
        date: normalizedDate
      }
    },
    update: {
      checkIn,
      checkOut,
      status: status || AttendanceStatus.PRESENT,
      notes
    },
    create: {
      employeeId,
      date: normalizedDate,
      checkIn,
      checkOut,
      status: status || AttendanceStatus.PRESENT,
      notes
    }
  });

  console.log(`[DEBUG] Attendance ${attendance.id} created/updated successfully`);
  return attendance;
}

// Enregistrer l'arrivée (check-in)
export async function checkIn(employeeId: number, date?: Date) {
  const checkInDate = date || new Date();
  console.log(`[DEBUG] Check-in for employee ${employeeId} at ${checkInDate.toISOString()}`);

  return createOrUpdateAttendance(employeeId, checkInDate, checkInDate, undefined, AttendanceStatus.PRESENT);
}

// Enregistrer le départ (check-out)
export async function checkOut(employeeId: number, date?: Date) {
  const checkOutDate = date || new Date();
  console.log(`[DEBUG] Check-out for employee ${employeeId} at ${checkOutDate.toISOString()}`);

  // Trouver le pointage du jour
  const normalizedDate = new Date(checkOutDate.getFullYear(), checkOutDate.getMonth(), checkOutDate.getDate());
  const existingAttendance = await prisma.attendance.findUnique({
    where: {
      employeeId_date: {
        employeeId,
        date: normalizedDate
      }
    }
  });

  if (!existingAttendance) {
    throw new Error('Aucun check-in trouvé pour cette date');
  }

  return createOrUpdateAttendance(employeeId, normalizedDate, existingAttendance.checkIn || undefined, checkOutDate, existingAttendance.status, existingAttendance.notes || undefined);
}

// Obtenir les pointages d'un employé
export async function getEmployeeAttendance(employeeId: number, startDate?: Date, endDate?: Date) {
  console.log(`[DEBUG] Getting attendance for employee ${employeeId} from ${startDate?.toISOString()} to ${endDate?.toISOString()}`);

  const where: any = { employeeId };

  if (startDate && endDate) {
    where.date = {
      gte: startDate,
      lte: endDate
    };
  }

  return prisma.attendance.findMany({
    where,
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
          service: true
        }
      }
    },
    orderBy: { date: 'desc' }
  });
}

// Obtenir les pointages pour une entreprise
export async function getCompanyAttendance(companyId: number | null, startDate?: Date, endDate?: Date) {
  console.log(`[DEBUG] Getting attendance for company ${companyId} from ${startDate?.toISOString()} to ${endDate?.toISOString()}`);

  const where: any = {};

  // Si companyId est fourni et non null, filtrer par entreprise
  if (companyId !== null && companyId !== undefined) {
    where.employee = {
      companyId
    };
  }

  if (startDate && endDate) {
    where.date = {
      gte: startDate,
      lte: endDate
    };
  }

  return prisma.attendance.findMany({
    where,
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
          service: true
        }
      }
    },
    orderBy: [
      { date: 'desc' },
      { employee: { name: 'asc' } }
    ]
  });
}

// Calculer les heures travaillées pour un pointage
export function calculateWorkedHours(attendance: any): number {
  if (!attendance.checkIn || !attendance.checkOut) {
    return 0;
  }

  const checkIn = new Date(attendance.checkIn);
  const checkOut = new Date(attendance.checkOut);
  const diffMs = checkOut.getTime() - checkIn.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  return Math.max(0, diffHours); // Ne pas retourner de valeurs négatives
}

// Obtenir le résumé des pointages pour une période
export async function getAttendanceSummary(employeeId: number, startDate: Date, endDate: Date) {
  const attendances = await getEmployeeAttendance(employeeId, startDate, endDate);

  const summary = {
    totalDays: attendances.length,
    presentDays: attendances.filter(a => a.status === AttendanceStatus.PRESENT).length,
    absentDays: attendances.filter(a => a.status === AttendanceStatus.ABSENT).length,
    lateDays: attendances.filter(a => a.status === AttendanceStatus.LATE).length,
    halfDays: attendances.filter(a => a.status === AttendanceStatus.HALF_DAY).length,
    totalWorkedHours: attendances.reduce((total, attendance) => total + calculateWorkedHours(attendance), 0)
  };

  return summary;
}

// Marquer comme absent
export async function markAsAbsent(employeeId: number, date: Date, notes?: string) {
  console.log(`[DEBUG] Marking employee ${employeeId} as absent on ${date.toISOString().split('T')[0]}`);

  return createOrUpdateAttendance(employeeId, date, undefined, undefined, AttendanceStatus.ABSENT, notes);
}

// Supprimer un pointage
export async function deleteAttendance(id: number) {
  console.log(`[DEBUG] Deleting attendance ${id}`);

  return prisma.attendance.delete({
    where: { id }
  });
}