import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Create
export async function createEmployee(
  name: string,
  email: string,
  telephone: string,
  service: string,
  companyId: number,
  baseSalary: number = 0,
  bonus: number = 0,
  deductions: number = 0
) {
  try {
    return prisma.employee.create({
      data: { name, email, telephone, service, companyId, baseSalary, bonus, deductions },
    });
  } catch (err: any) {
    if (err.code === "P2002" || err.message?.includes("Unique constraint")) {
      // violation contrainte unique
      throw new Error("Un employé avec cet email existe déjà");
    }
    throw err;
  }
}
// Read by id
export async function getEmployeeById(id: number) {
  return prisma.employee.findUnique({ where: { id } });
}

//export async function getEmployees() {
//   return prisma.employee.findMany();
// }
export async function getEmployees(filter?: {
  isActive?: boolean;
  companyId?: number;
}) {
  return prisma.employee.findMany({
    where: {
      isActive: filter?.isActive,
      companyId: filter?.companyId,
    },
  });
}

export async function getEmployeesByCompany(companyId: number) {
  return getEmployees({ companyId });
}

// Update
export async function updateEmployee(
  id: number,
  data: {
    name?: string;
    email?: string;
    telephone?: string;
    service?: string;
    baseSalary?: number;
    bonus?: number;
    deductions?: number;
    isActive?: boolean
  }
) {
  return prisma.employee.update({ where: { id }, data });
}

// Delete
export async function deleteEmployee(id: number) {
  return prisma.employee.delete({ where: { id } });
}
