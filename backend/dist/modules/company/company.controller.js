"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompany = createCompany;
exports.listCompanies = listCompanies;
exports.getCompany = getCompany;
exports.updateCompany = updateCompany;
exports.deleteCompany = deleteCompany;
exports.getCompanyAdmin = getCompanyAdmin;
const client_1 = require("@prisma/client");
const companyService = __importStar(require("./company.service"));
const prisma = new client_1.PrismaClient();
async function createCompany(req, res) {
    const { name, address } = req.body;
    try {
        const company = await companyService.createCompany(name, address);
        res.status(201).json(company);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}
async function listCompanies(req, res) {
    const user = req.user;
    try {
        let companies;
        if (user.role === 'SUPER_ADMIN') {
            // Super Admin voit toutes les compagnies
            companies = await companyService.getCompanies();
        }
        else if (user.role === 'ADMIN') {
            // Admin ne voit que sa propre compagnie
            if (!user.companyId) {
                return res.status(403).json({ error: 'Administrator must be assigned to a company' });
            }
            const company = await companyService.getCompanyById(user.companyId);
            companies = company ? [company] : [];
        }
        else {
            // Autres rôles n'ont pas accès aux compagnies
            return res.status(403).json({ error: 'Insufficient permissions to view companies' });
        }
        res.json(companies);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to list companies' });
    }
}
async function getCompany(req, res) {
    const id = parseInt(req.params.id, 10);
    try {
        const company = await companyService.getCompanyById(id);
        if (!company)
            return res.status(404).json({ message: 'Company not found' });
        res.json(company);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get company' });
    }
}
async function updateCompany(req, res) {
    const id = parseInt(req.params.id, 10);
    const { name, address, isActive } = req.body;
    try {
        const company = await companyService.updateCompany(id, name, address, isActive);
        res.json(company);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}
async function deleteCompany(req, res) {
    const id = parseInt(req.params.id, 10);
    try {
        await companyService.deleteCompany(id);
        res.json({ message: 'Company deleted' });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}
async function getCompanyAdmin(req, res) {
    const companyId = parseInt(req.params.id, 10);
    try {
        // Trouver l'administrateur de l'entreprise
        const admin = await prisma.user.findFirst({
            where: {
                companyId: companyId,
                role: 'ADMIN'
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });
        if (!admin) {
            return res.status(404).json({ error: 'No administrator found for this company' });
        }
        res.json(admin);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get company admin' });
    }
}
