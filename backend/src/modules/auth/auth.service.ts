import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secretdev'; // à mettre dans .env

export async function registerUser(name: string, email: string, password: string) {
  // Vérifier si l'email est déjà pris
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email déjà utilisé');

  // Hacher le mot de passe
  const hashed = await bcrypt.hash(password, 10);

  // Créer l'utilisateur
  return prisma.user.create({
    data: { name, email, password: hashed },
  });
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Utilisateur introuvable');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Mot de passe incorrect');

  // Générer un token JWT
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

  // Déterminer l'URL de redirection selon le rôle
  let redirectUrl = '/';
  switch (user.role) {
    case 'SUPER_ADMIN':
      redirectUrl = '/super-admin';
      break;
    case 'ADMIN':
      redirectUrl = `/admin?companyId=${user.companyId}`;
      break;
    case 'CASHIER':
      redirectUrl = '/';
      break;
  }

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    redirectUrl
  };
}
