// src/modules/payrun/payrun.service.ts
import { PrismaClient, PayRunStatus } from '@prisma/client';
const prisma = new PrismaClient();

// ➕ Créer un cycle de paie
export async function createPayRun(month: number, year: number, startDate: Date, endDate: Date) {
  return prisma.payRun.create({
    data: {
      month,
      year,
      startDate,
      endDate,
      status: PayRunStatus.DRAFT,
    },
  });
}

// 📋 Lister tous les cycles
export async function getPayRuns() {
  return prisma.payRun.findMany({
    include: { payslips: true }, // optionnel pour avoir les bulletins liés
  });
}

// 🔍 Détails d’un cycle
export async function getPayRunById(id: number) {
  return prisma.payRun.findUnique({
    where: { id },
    include: { payslips: true },
  });
}

// ✅ Valider un cycle (passer DRAFT → VALIDATED)
export async function validatePayRun(id: number) {
  return prisma.payRun.update({
    where: { id },
    data: { status: PayRunStatus.VALIDATED },
  });
}

// 💸 Marquer comme payé
export async function markPayRunAsPaid(id: number) {
  return prisma.payRun.update({
    where: { id },
    data: { status: PayRunStatus.PAID },
  });
}
