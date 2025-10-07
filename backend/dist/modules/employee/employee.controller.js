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
exports.createEmployee = createEmployee;
exports.listEmployees = listEmployees;
exports.getEmployee = getEmployee;
exports.updateEmployeeController = updateEmployeeController;
exports.deleteEmployeeController = deleteEmployeeController;
const employeeService = __importStar(require("./employee.service"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function createEmployee(req, res) {
    const { name, email, telephone, service, companyId } = req.body;
    const user = req.user;
    try {
        // Validation des données d'entrée
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
        }
        if (!telephone || typeof telephone !== 'string' || telephone.trim().length === 0) {
            return res.status(400).json({ error: 'Telephone is required and must be a non-empty string' });
        }
        if (!service || typeof service !== 'string' || service.trim().length === 0) {
            return res.status(400).json({ error: 'Service is required and must be a non-empty string' });
        }
        if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Valid email is required' });
        }
        // Règles métier strictes pour la création d'employés
        let assignedCompanyId;
        if (user.role === 'SUPER_ADMIN') {
            // Super Admin peut créer des employés pour n'importe quelle compagnie
            // companyId doit être fourni et valide
            if (!companyId) {
                return res.status(400).json({ error: 'companyId is required for Super Admin' });
            }
            assignedCompanyId = companyId;
        }
        else if (user.role === 'ADMIN') {
            // Administrator ne peut créer des employés que pour sa propre compagnie
            if (!user.companyId) {
                return res.status(403).json({ error: 'Administrator must be assigned to a company' });
            }
            // Ignore companyId from request body, assign user's companyId automatically
            assignedCompanyId = user.companyId;
        }
        else {
            // Autres rôles n'ont pas le droit de créer des employés
            return res.status(403).json({ error: 'Insufficient permissions to create employees' });
        }
        // Vérifier que la compagnie existe
        const company = await prisma.company.findUnique({ where: { id: assignedCompanyId } });
        if (!company) {
            return res.status(400).json({ error: 'Invalid company ID' });
        }
        const employee = await employeeService.createEmployee(name, email, telephone, service, assignedCompanyId);
        res.status(201).json(employee);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}
// export async function listEmployees(req: Request, res: Response) {
//   const employees = await service.getEmployees();
//   res.json(employees);
// }
async function listEmployees(req, res) {
    const { isActive, companyId } = req.query;
    const user = req.user;
    try {
        const filter = {};
        if (isActive !== undefined)
            filter.isActive = isActive === 'true';
        // Filtrage basé sur le rôle
        if (user.role === 'SUPER_ADMIN') {
            // Super Admin voit tout
            if (companyId !== undefined)
                filter.companyId = parseInt(companyId, 10);
        }
        else if (user.role === 'ADMIN') {
            // Admin ne voit que les employés de sa compagnie
            if (!user.companyId) {
                return res.status(403).json({ error: 'Administrator must be assigned to a company' });
            }
            // Forcer le filtrage par la compagnie de l'admin
            filter.companyId = user.companyId;
        }
        else {
            // Autres rôles (CASHIER) n'ont pas accès aux employés
            return res.status(403).json({ error: 'Insufficient permissions to view employees' });
        }
        const employees = await employeeService.getEmployees(filter);
        res.json(employees);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to list employees' });
    }
}
async function getEmployee(req, res) {
    const id = parseInt(req.params.id, 10);
    const employee = await employeeService.getEmployeeById(id);
    if (!employee)
        return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
}
async function updateEmployeeController(req, res) {
    const id = parseInt(req.params.id, 10);
    try {
        const employee = await employeeService.updateEmployee(id, req.body);
        res.json(employee);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}
async function deleteEmployeeController(req, res) {
    const id = parseInt(req.params.id, 10);
    try {
        await employeeService.deleteEmployee(id);
        res.json({ message: 'Employee deleted' });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}
