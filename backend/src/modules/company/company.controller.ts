// src/modules/company/company.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middlewares/auth.middleware';
import * as companyService from './company.service';

const prisma = new PrismaClient();

export async function createCompany(req: Request, res: Response) {
  const { name, address } = req.body;
  try {
    const company = await companyService.createCompany(name, address);
    res.status(201).json(company);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function listCompanies(req: AuthRequest, res: Response) {
  const user = req.user!;

  let companies;
  if (user.role === 'SUPER_ADMIN') {
    // Super Admin voit toutes les compagnies
    companies = await companyService.getCompanies();
  } else if (user.role === 'ADMIN') {
    // Admin ne voit que sa propre compagnie
    if (!user.companyId) {
      return res.status(403).json({ error: 'Administrator must be assigned to a company' });
    }
    const company = await companyService.getCompanyById(user.companyId);
    companies = company ? [company] : [];
  } else {
    // Autres rôles n'ont pas accès aux compagnies
    return res.status(403).json({ error: 'Insufficient permissions to view companies' });
  }

  res.json(companies);
}

export async function getCompany(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const company = await companyService.getCompanyById(id);
  if (!company) return res.status(404).json({ message: 'Company not found' });
  res.json(company);
}

export async function updateCompany(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const { name, address, isActive } = req.body;
  try {
    const company = await companyService.updateCompany(id, name, address, isActive);
    res.json(company);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteCompany(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  try {
    await companyService.deleteCompany(id);
    res.json({ message: 'Company deleted' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function getCompanyAdmin(req: AuthRequest, res: Response) {
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to get company admin' });
  }
}
