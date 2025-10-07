"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmployee = createEmployee;
exports.getEmployeeById = getEmployeeById;
exports.getEmployees = getEmployees;
exports.updateEmployee = updateEmployee;
exports.deleteEmployee = deleteEmployee;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Create
async function createEmployee(name, email, telephone, service, companyId) {
    try {
        return prisma.employee.create({
            data: { name, email, telephone, service, companyId },
        });
        //   return await prisma.employee.create({ data });
    }
    catch (err) {
        if (err.code === "P2002" || err.message?.includes("Unique constraint")) {
            // violation contrainte unique
            throw new Error("Un employé avec cet email existe déjà");
        }
        throw err;
    }
}
// Read by id
async function getEmployeeById(id) {
    return prisma.employee.findUnique({ where: { id } });
}
//export async function getEmployees() {
//   return prisma.employee.findMany();
// }
async function getEmployees(filter) {
    return prisma.employee.findMany({
        where: {
            isActive: filter?.isActive,
            companyId: filter?.companyId,
        },
    });
}
// Update
async function updateEmployee(id, data) {
    return prisma.employee.update({ where: { id }, data });
}
// Delete
async function deleteEmployee(id) {
    return prisma.employee.delete({ where: { id } });
}
