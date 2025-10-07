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
  console.log(`[DEBUG] Starting PDF generation for payslip ID: ${payslip.id}, Employee: ${employeeName}`);

  const pdfDir = path.join(__dirname, '../../../payslips-pdf');
  console.log(`[DEBUG] PDF directory: ${pdfDir}`);

  if (!fs.existsSync(pdfDir)) {
    console.log(`[DEBUG] Creating PDF directory: ${pdfDir}`);
    fs.mkdirSync(pdfDir);
  }

  const pdfPath = path.join(pdfDir, `payslip_${payslip.id}.pdf`);
  const relativePdfUrl = `/payslips-pdf/payslip_${payslip.id}.pdf`; // URL relative pour l'accès web
  console.log(`[DEBUG] PDF file path: ${pdfPath}, Relative URL: ${relativePdfUrl}`);

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

  console.log(`[DEBUG] PDF generation completed for payslip ${payslip.id}`);
  return relativePdfUrl; // Retourner l'URL relative au lieu du chemin absolu
}

// ➕ Générer les bulletins pour un PayRun + PDF
export async function generatePayslips(payRunId: number) {
  console.log(`[DEBUG] Starting payslip generation for PayRun ID: ${payRunId}`);

  // Récupérer le PayRun
  const payRun = await prisma.payRun.findUnique({
    where: {
      id: payRunId, // <-- Utiliser la variable, pas Int
    },
    // No 'include' needed here unless you want to include related models defined in your schema
  });

  if (!payRun) {
    console.error(`[ERROR] PayRun with ID ${payRunId} not found`);
    throw new Error('PayRun non trouvé');
  }

  console.log(`[DEBUG] PayRun found: ${payRun.month}/${payRun.year}, Status: ${payRun.status}`);

  const employees = await prisma.employee.findMany({ where: { isActive: true } });
  console.log(`[DEBUG] Found ${employees.length} active employees`);

  const payslips = [];

  for (const emp of employees) {
    console.log(`[DEBUG] Processing employee: ${emp.name} (ID: ${emp.id})`);

    // Utiliser les données de salaire de l'employé depuis la base de données
    const baseSalary = emp.baseSalary || 0;
    const bonus = emp.bonus || 0;
    const deductions = emp.deductions || 0;
    const netSalary = calculateNetSalary(baseSalary, bonus, deductions);

    console.log(`[DEBUG] Salary calculation for ${emp.name}: Base=${baseSalary}, Bonus=${bonus}, Deductions=${deductions}, Net=${netSalary}`);

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

    console.log(`[DEBUG] Payslip created with ID: ${payslip.id}`);

    // Générer le PDF et mettre à jour le chemin
    try {
      const pdfPath = generatePDF(payslip, emp.name);
      console.log(`[DEBUG] PDF generated for payslip ${payslip.id} at: ${pdfPath}`);

      await prisma.payslip.update({
        where: { id: payslip.id },
        data: { generatedPdfUrl: pdfPath },
      });

      console.log(`[DEBUG] Payslip ${payslip.id} updated with PDF path`);
    } catch (error) {
      console.error(`[ERROR] Failed to generate PDF for payslip ${payslip.id}:`, error);
    }

    payslips.push({ ...payslip, generatedPdfUrl: payslip.generatedPdfUrl });
  }

  console.log(`[DEBUG] Payslip generation completed. Generated ${payslips.length} payslips`);
  return payslips;
}
export async function getPayslipById(id: number) {
  return prisma.payslip.findUnique({ where: { id } });
}

export async function getPayslipsByEmployee(employeeId: number) {
  return prisma.payslip.findMany({
    where: { employeeId },
    include: {
      payRun: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updatePayslipPayment(id: number, amountPaid: number) {
  return prisma.payslip.update({
    where: { id },
    data: { amountPaid },
  });
}

