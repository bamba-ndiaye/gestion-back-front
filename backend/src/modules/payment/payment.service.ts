import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Effectuer un paiement partiel ou total pour un bulletin
export async function payPayslip(payslipId: number, amountPaid: number) {
  const payslip = await prisma.payslip.findUnique({ where: { id: payslipId } });
if (!payslip) throw new Error('Payslip non trouvé');

const employee = await prisma.employee.findUnique({ where: { id: payslip.employeeId } });

const remaining = Number(payslip.netSalary) - (Number(payslip.amountPaid) ?? 0) - amountPaid;
const newAmountPaid = (payslip.amountPaid ?? 0) + amountPaid;

const updatedPayslip = await prisma.payslip.update({
  where: { id: payslipId },
  data: { amountPaid: newAmountPaid },
});

// Générer PDF
const receiptDir = path.join(__dirname, '../../../receipts-pdf');
if (!fs.existsSync(receiptDir)) fs.mkdirSync(receiptDir);

const receiptPath = path.join(receiptDir, `receipt_${payslip.id}_${Date.now()}.pdf`);
const doc = new PDFDocument();
doc.pipe(fs.createWriteStream(receiptPath));

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
