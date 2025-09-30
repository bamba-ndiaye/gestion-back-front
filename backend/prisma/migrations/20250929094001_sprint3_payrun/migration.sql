-- CreateTable
CREATE TABLE `PayRun` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `status` ENUM('DRAFT', 'VALIDATED', 'PAID') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payslip` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `payRunId` INTEGER NOT NULL,
    `baseSalary` DECIMAL(10, 2) NOT NULL,
    `bonus` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `deductions` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `netSalary` DECIMAL(10, 2) NOT NULL,
    `generatedPdfUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Payslip` ADD CONSTRAINT `Payslip_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payslip` ADD CONSTRAINT `Payslip_payRunId_fkey` FOREIGN KEY (`payRunId`) REFERENCES `PayRun`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
