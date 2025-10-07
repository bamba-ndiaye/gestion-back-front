"use strict";
// // src/modules/user/user.service.ts
// import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcryptjs';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
// const prisma = new PrismaClient();
// // 🔹 Interface pour la création d'un utilisateur
// interface RegisterUserInput {
//   name: string;
//   email: string;
//   password: string;
//   role: 'SUPER_ADMIN' | 'ADMIN' | 'CASHIER';
// }
// // ➕ Créer un nouvel utilisateur
// export async function registerUser(input: RegisterUserInput) {
//   const { name, email, password, role } = input;
//   // Vérifier que l'email n'existe pas déjà
//   const existingUser = await prisma.user.findUnique({ where: { email } });
//   if (existingUser) {
//     throw new Error('Email déjà utilisé');
//   }
//   // Hash du mot de passe
//   const hashedPassword = await bcrypt.hash(password, 10);
//   // Création de l'utilisateur dans la base
//   const user = await prisma.user.create({
//     data: {
//       name,
//       email,
//       password: hashedPassword,
//       role,
//     },
//   });
//   return user;
// }
// // 🔹 Récupérer tous les utilisateurs
// export async function getAllUsers() {
//   return prisma.user.findMany();
// }
// // 🔹 Récupérer un utilisateur par ID
// export async function getUserById(id: number) {
//   return prisma.user.findUnique({ where: { id } });
// }
// // 🔹 Mettre à jour un utilisateur (optionnel)
// export async function updateUser(
//   id: number,
//   data: Partial<{ name: string; email: string; password: string; role: 'SUPER_ADMIN' | 'ADMIN' | 'CASHIER' }>
// ) {
//   if (data.password) {
//     data.password = await bcrypt.hash(data.password, 10);
//   }
//   return prisma.user.update({
//     where: { id },
//     data,
//   });
// }
// // 🔹 Supprimer un utilisateur
// export async function deleteUser(id: number) {
//   return prisma.user.delete({ where: { id } });
// }
// src/modules/user/user.service.ts
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
// 🔑 Création d'un utilisateur avec hash et vérification email
async function registerUser({ name, email, password, role, }) {
    // Vérifier si l'email existe déjà
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new Error('Email déjà utilisé');
    }
    // Hasher le mot de passe
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    // Créer l'utilisateur
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role,
        },
    });
    // Ne jamais renvoyer le mot de passe
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}
// 🔍 Récupérer tous les utilisateurs
async function getAllUsers() {
    return prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
}
// 🔍 Récupérer un utilisateur par ID
async function getUserById(id) {
    return prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
}
// ✏️ Mettre à jour un utilisateur
async function updateUser(id, data) {
    if (data.password) {
        data.password = await bcrypt_1.default.hash(data.password, 10);
    }
    const updated = await prisma.user.update({
        where: { id },
        data,
    });
    return {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
    };
}
// ❌ Supprimer un utilisateur
async function deleteUser(id) {
    return prisma.user.delete({ where: { id } });
}
