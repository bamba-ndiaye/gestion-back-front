import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createCompany(name: string, address?: string) {
  return prisma.company.create({
    data: { name, address },
  });
}

export async function getCompanies() {
  return prisma.company.findMany();
}

export async function getCompanyById(id: number) {
  return prisma.company.findUnique({ where: { id } });
}

export async function updateCompany(id: number, name?: string, address?: string, isActive?: boolean) {
  return prisma.company.update({
    where: { id },
    data: { name, address, isActive },
  });
}

export async function deleteCompany(id: number) {
  return prisma.company.delete({ where: { id } });
}
