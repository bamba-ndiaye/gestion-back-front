import { Request, Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import * as service from './employee.service';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function createEmployee(req: AuthRequest, res: Response) {
  const { name, email, companyId } = req.body;
  const user = req.user!;

  try {
    // Validation des données d'entrée
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Règles métier strictes pour la création d'employés

    let assignedCompanyId: number;

    if (user.role === 'SUPER_ADMIN') {
      // Super Admin peut créer des employés pour n'importe quelle compagnie
      // companyId doit être fourni et valide
      if (!companyId) {
        return res.status(400).json({ error: 'companyId is required for Super Admin' });
      }
      assignedCompanyId = companyId;
    } else if (user.role === 'ADMIN') {
      // Administrator ne peut créer des employés que pour sa propre compagnie
      if (!user.companyId) {
        return res.status(403).json({ error: 'Administrator must be assigned to a company' });
      }
      // Ignore companyId from request body, assign user's companyId automatically
      assignedCompanyId = user.companyId;
    } else {
      // Autres rôles n'ont pas le droit de créer des employés
      return res.status(403).json({ error: 'Insufficient permissions to create employees' });
    }

    // Vérifier que la compagnie existe
    const company = await prisma.company.findUnique({ where: { id: assignedCompanyId } });
    if (!company) {
      return res.status(400).json({ error: 'Invalid company ID' });
    }

    const employee = await service.createEmployee(name, email, assignedCompanyId);
    res.status(201).json(employee);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// export async function listEmployees(req: Request, res: Response) {
//   const employees = await service.getEmployees();
//   res.json(employees);
// }

export async function listEmployees(req: AuthRequest, res: Response) {
  const { isActive, companyId } = req.query;
  const user = req.user!;

  const filter: { isActive?: boolean; companyId?: number } = {};

  if (isActive !== undefined) filter.isActive = isActive === 'true';

  // Filtrage basé sur le rôle
  if (user.role === 'SUPER_ADMIN') {
    // Super Admin voit tout
    if (companyId !== undefined) filter.companyId = parseInt(companyId as string, 10);
  } else if (user.role === 'ADMIN') {
    // Admin ne voit que les employés de sa compagnie
    if (!user.companyId) {
      return res.status(403).json({ error: 'Administrator must be assigned to a company' });
    }
    // Forcer le filtrage par la compagnie de l'admin
    filter.companyId = user.companyId;
  } else {
    // Autres rôles (CASHIER) n'ont pas accès aux employés
    return res.status(403).json({ error: 'Insufficient permissions to view employees' });
  }

  const employees = await service.getEmployees(filter);
  res.json(employees);
}


export async function getEmployee(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const employee = await service.getEmployeeById(id);
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  res.json(employee);
}

export async function updateEmployeeController(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  try {
    const employee = await service.updateEmployee(id, req.body);
    res.json(employee);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteEmployeeController(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  try {
    await service.deleteEmployee(id);
    res.json({ message: 'Employee deleted' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
