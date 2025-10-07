"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompany = createCompany;
exports.getCompanies = getCompanies;
exports.getCompanyById = getCompanyById;
exports.updateCompany = updateCompany;
exports.deleteCompany = deleteCompany;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function createCompany(name, address) {
    return prisma.company.create({
        data: { name, address },
    });
}
async function getCompanies() {
    return prisma.company.findMany();
}
async function getCompanyById(id) {
    return prisma.company.findUnique({ where: { id } });
}
async function updateCompany(id, name, address, isActive) {
    return prisma.company.update({
        where: { id },
        data: { name, address, isActive },
    });
}
async function deleteCompany(id) {
    return prisma.company.delete({ where: { id } });
}
