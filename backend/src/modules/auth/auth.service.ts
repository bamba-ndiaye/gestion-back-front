import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secretdev'; // à mettre dans .env

export async function registerUser(name: string, email: string, password: string) {
  console.log(`[DEBUG] Attempting to register user: ${email}`);

  // Vérifier si l'email est déjà pris
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`[DEBUG] Registration failed: Email ${email} already exists`);
    throw new Error('Email déjà utilisé');
  }

  // Hacher le mot de passe
  const hashed = await bcrypt.hash(password, 10);
  console.log(`[DEBUG] Password hashed for user: ${email}`);

  // Créer l'utilisateur
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });

  console.log(`[DEBUG] User registered successfully: ${email} (ID: ${user.id})`);
  return user;
}

export async function loginUser(email: string, password: string) {
  console.log(`[DEBUG] Login attempt for user: ${email}`);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`[DEBUG] Login failed: User ${email} not found`);
    throw new Error('Utilisateur introuvable');
  }

  console.log(`[DEBUG] User found: ${email} (Role: ${user.role})`);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    console.log(`[DEBUG] Login failed: Invalid password for ${email}`);
    throw new Error('Mot de passe incorrect');
  }

  console.log(`[DEBUG] Password validated for ${email}`);

  // Générer un token JWT
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  console.log(`[DEBUG] JWT token generated for user ID: ${user.id}`);

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

  console.log(`[DEBUG] Login successful for ${email}, redirecting to: ${redirectUrl}`);

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    redirectUrl
  };
}
