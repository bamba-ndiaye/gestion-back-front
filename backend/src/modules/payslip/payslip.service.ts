// src/modules/payslip/payslip.service.ts
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Calcul du salaire net
function calculateNetSalary(base: number, bonus: number, deductions: number) {
  return base + bonus - deductions;
}

// Générer le PDF pour un bulletin
function generatePDF(payslip: any, employeeName: string) {
  const pdfDir = path.join(__dirname, '../../../payslips-pdf');
  if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir);

  const pdfPath = path.join(pdfDir, `payslip_${payslip.id}.pdf`);
  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(pdfPath));

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
export async function generatePayslips(payRunId: number) {
  // Récupérer le PayRun
  const payRun = await prisma.payRun.findUnique({
    where: {
      id: payRunId, // <-- Utiliser la variable, pas Int
    },
    // No 'include' needed here unless you want to include related models defined in your schema
  });

  if (!payRun) throw new Error('PayRun non trouvé');

  const employees = await prisma.employee.findMany({ where: { isActive: true } });
  const payslips = [];

  for (const emp of employees) {
    const baseSalary = 1000;  // temporaire
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
export async function getPayslipById(id: number) {
  return prisma.payslip.findUnique({ where: { id } });
}

