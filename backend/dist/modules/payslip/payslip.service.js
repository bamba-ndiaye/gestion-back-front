"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePayslips = generatePayslips;
exports.getPayslipById = getPayslipById;
exports.getPayslipsByEmployee = getPayslipsByEmployee;
// src/modules/payslip/payslip.service.ts
const client_1 = require("@prisma/client");
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
// Calcul du salaire net
function calculateNetSalary(base, bonus, deductions) {
    return base + bonus - deductions;
}
// Générer le PDF pour un bulletin
function generatePDF(payslip, employeeName) {
    const pdfDir = path_1.default.join(__dirname, '../../../payslips-pdf');
    if (!fs_1.default.existsSync(pdfDir))
        fs_1.default.mkdirSync(pdfDir);
    const pdfPath = path_1.default.join(pdfDir, `payslip_${payslip.id}.pdf`);
    const doc = new pdfkit_1.default();
    doc.pipe(fs_1.default.createWriteStream(pdfPath));
    doc.fontSize(20).text('Bulletin de salaire', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Employé: ${employeeName}`);
    doc.text(`Salaire de base: ${payslip.baseSalary}`);
    doc.text(`Bonus: ${payslip.bonus}`);
    doc.text(`Déductions: ${payslip.deductions}`);
    doc.text(`Salaire net: ${payslip.netSalary}`);
    doc.end();
    return pdfPath;
}
// ➕ Générer les bulletins pour un PayRun + PDF
async function generatePayslips(payRunId) {
    // Récupérer le PayRun
    const payRun = await prisma.payRun.findUnique({
        where: {
            id: payRunId, // <-- Utiliser la variable, pas Int
        },
        // No 'include' needed here unless you want to include related models defined in your schema
    });
    if (!payRun)
        throw new Error('PayRun non trouvé');
    const employees = await prisma.employee.findMany({ where: { isActive: true } });
    const payslips = [];
    for (const emp of employees) {
        const baseSalary = 1000; // temporaire
        const bonus = 0;
        const deductions = 0;
        const netSalary = calculateNetSalary(baseSalary, bonus, deductions);
        // Créer le bulletin
        const payslip = await prisma.payslip.create({
            data: {
                employeeId: emp.id,
                payRunId,
                baseSalary,
                bonus,
                deductions,
                netSalary,
            },
        });
        // Générer le PDF et mettre à jour le chemin
        const pdfPath = generatePDF(payslip, emp.name);
        await prisma.payslip.update({
            where: { id: payslip.id },
            data: { generatedPdfUrl: pdfPath },
        });
        payslips.push({ ...payslip, generatedPdfUrl: pdfPath });
    }
    return payslips;
}
async function getPayslipById(id) {
    return prisma.payslip.findUnique({ where: { id } });
}
async function getPayslipsByEmployee(employeeId) {
    return prisma.payslip.findMany({
        where: { employeeId },
        include: {
            payRun: true,
        },
        orderBy: { createdAt: 'desc' },
    });
}
