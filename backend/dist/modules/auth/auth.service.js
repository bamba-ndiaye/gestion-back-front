"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secretdev'; // à mettre dans .env
async function registerUser(name, email, password) {
    // Vérifier si l'email est déjà pris
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
        throw new Error('Email déjà utilisé');
    // Hacher le mot de passe
    const hashed = await bcryptjs_1.default.hash(password, 10);
    // Créer l'utilisateur
    return prisma.user.create({
        data: { name, email, password: hashed },
    });
}
async function loginUser(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        throw new Error('Utilisateur introuvable');
    const valid = await bcryptjs_1.default.compare(password, user.password);
    if (!valid)
        throw new Error('Mot de passe incorrect');
    // Générer un token JWT
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    // Déterminer l'URL de redirection selon le rôle
    let redirectUrl = '/';
    switch (user.role) {
        case 'SUPER_ADMIN':
            redirectUrl = '/super-admin';
            break;
        case 'ADMIN':
            redirectUrl = '/admin';
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
