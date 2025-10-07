"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.payPayslip = payPayslip;
const client_1 = require("@prisma/client");
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
// Effectuer un paiement partiel ou total pour un bulletin
async function payPayslip(payslipId, amountPaid) {
    const payslip = await prisma.payslip.findUnique({ where: { id: payslipId } });
    if (!payslip)
        throw new Error('Payslip non trouvé');
    const employee = await prisma.employee.findUnique({ where: { id: payslip.employeeId } });
    const remaining = Number(payslip.netSalary) - (Number(payslip.amountPaid) ?? 0) - amountPaid;
    const newAmountPaid = (payslip.amountPaid ?? 0) + amountPaid;
    const updatedPayslip = await prisma.payslip.update({
        where: { id: payslipId },
        data: { amountPaid: newAmountPaid },
    });
    // Générer PDF
    const receiptDir = path_1.default.join(__dirname, '../../../receipts-pdf');
    if (!fs_1.default.existsSync(receiptDir))
        fs_1.default.mkdirSync(receiptDir);
    const receiptPath = path_1.default.join(receiptDir, `receipt_${payslip.id}_${Date.now()}.pdf`);
    const doc = new pdfkit_1.default();
    doc.pipe(fs_1.default.createWriteStream(receiptPath));
    doc.fontSize(20).text('Reçu de paiement', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Employé: ${employee?.name || payslip.employeeId}`);
    doc.text(`Bulletin ID: ${payslip.id}`);
    doc.text(`Montant payé: ${amountPaid}`);
    doc.text(`Montant restant: ${remaining < 0 ? 0 : remaining}`);
    doc.end();
    await prisma.payslip.update({
        where: { id: payslipId },
        data: { receiptPdfUrl: receiptPath },
    });
    return { updatedPayslip, receiptPdfUrl: receiptPath };
}
