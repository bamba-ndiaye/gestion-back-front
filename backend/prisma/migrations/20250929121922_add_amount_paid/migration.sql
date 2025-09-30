/*
  Warnings:

  - You are about to alter the column `baseSalary` on the `Payslip` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Double`.
  - You are about to alter the column `bonus` on the `Payslip` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Double`.
  - You are about to alter the column `deductions` on the `Payslip` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Double`.
  - You are about to alter the column `netSalary` on the `Payslip` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Double`.

*/
-- AlterTable
ALTER TABLE `Payslip` ADD COLUMN `amountPaid` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `receiptPdfUrl` VARCHAR(191) NULL,
    MODIFY `baseSalary` DOUBLE NOT NULL,
    MODIFY `bonus` DOUBLE NOT NULL,
    MODIFY `deductions` DOUBLE NOT NULL,
    MODIFY `netSalary` DOUBLE NOT NULL;
