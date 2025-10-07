import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function createCompany(name: string, address?: string, logo?: string, color?: string, adminEmail?: string, adminPassword?: string) {
  const company = await prisma.company.create({
    data: { name, address, logo, color },
  });

  if (adminEmail && adminPassword) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        name: 'Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        companyId: company.id,
      },
    });
  }

  return company;
}

export async function getCompanies() {
  return prisma.company.findMany();
}

export async function getCompanyById(id: number) {
  return prisma.company.findUnique({ where: { id } });
}

export async function updateCompany(id: number, name?: string, address?: string, logo?: string, color?: string, isActive?: boolean) {
  return prisma.company.update({
    where: { id },
    data: { name, address, logo, color, isActive },
  });
}

export async function deleteCompany(id: number) {
  // Delete employees first
  await prisma.employee.deleteMany({ where: { companyId: id } });

  // Set users companyId to null
  await prisma.user.updateMany({
    where: { companyId: id },
    data: { companyId: null }
  });

  // Now delete the company
  return prisma.company.delete({ where: { id } });
}
