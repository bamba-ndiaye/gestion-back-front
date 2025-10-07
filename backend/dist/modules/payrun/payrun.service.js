"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPayRun = createPayRun;
exports.getPayRuns = getPayRuns;
exports.getPayRunById = getPayRunById;
exports.validatePayRun = validatePayRun;
exports.markPayRunAsPaid = markPayRunAsPaid;
// src/modules/payrun/payrun.service.ts
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ➕ Créer un cycle de paie
async function createPayRun(month, year, startDate, endDate) {
    return prisma.payRun.create({
        data: {
            month,
            year,
            startDate,
            endDate,
            status: client_1.PayRunStatus.DRAFT,
        },
    });
}
// 📋 Lister tous les cycles
async function getPayRuns() {
    return prisma.payRun.findMany({
        include: { payslips: true }, // optionnel pour avoir les bulletins liés
    });
}
// 🔍 Détails d’un cycle
async function getPayRunById(id) {
    return prisma.payRun.findUnique({
        where: { id },
        include: { payslips: true },
    });
}
// ✅ Valider un cycle (passer DRAFT → VALIDATED)
async function validatePayRun(id) {
    return prisma.payRun.update({
        where: { id },
        data: { status: client_1.PayRunStatus.VALIDATED },
    });
}
// 💸 Marquer comme payé
async function markPayRunAsPaid(id) {
    return prisma.payRun.update({
        where: { id },
        data: { status: client_1.PayRunStatus.PAID },
    });
}
