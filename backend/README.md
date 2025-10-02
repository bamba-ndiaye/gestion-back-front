# Backend - API Gestion RH

API REST complète pour le système de gestion des ressources humaines, développée avec Node.js, TypeScript et Prisma ORM.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- MySQL 8.0+
- npm

### Installation

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Configuration de l'environnement**
   ```bash
   cp .env.example .env
   # Éditer .env avec vos variables
   ```

3. **Configuration de la base de données**
   ```bash
   # Créer la base de données MySQL
   mysql -u root -p
   CREATE DATABASE gestion_rh;
   ```

4. **Migrations Prisma**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Démarrage en développement**
   ```bash
   npm run dev
   ```

L'API sera disponible sur `http://localhost:3000`

## 🏗️ Architecture

### Structure des Dossiers

```
backend/
├── src/
│   ├── index.ts              # Point d'entrée de l'application
│   ├── seed.ts               # Données de test
│   ├── config/               # Configuration (non utilisé)
│   ├── middlewares/          # Middlewares Express
│   │   ├── auth.middleware.ts # Authentification JWT
│   │   └── ...               # Autres middlewares
│   ├── modules/              # Modules métier
│   │   ├── auth/             # Authentification
│   │   ├── company/          # Gestion entreprises
│   │   ├── employee/         # Gestion employés
│   │   ├── payment/          # Gestion paiements
│   │   ├── payslip/          # Gestion bulletins
│   │   ├── payrun/           # Gestion cycles paie
│   │   └── user/             # Gestion utilisateurs
│   └── utils/                # Utilitaires
├── prisma/
│   ├── schema.prisma         # Schéma base de données
│   └── migrations/           # Migrations Prisma
└── package.json
```

### Architecture des Modules

Chaque module suit le pattern suivant :
- `module.controller.ts` : Gestionnaires de routes Express
- `module.service.ts` : Logique métier
- `module.routes.ts` : Définition des routes

## 🔐 Authentification & Autorisation

### Système JWT
- **Token JWT** avec expiration (configurable)
- **Refresh tokens** pour sessions prolongées
- **Middleware d'authentification** pour protection des routes

### Rôles Utilisateur
- **SUPER_ADMIN** : Accès complet à toutes les entreprises
- **ADMIN** : Gestion des employés de leur entreprise
- **CASHIER** : Gestion des paiements (non implémenté)
- **Employé** : Accès en lecture seule à leurs données

### Middleware d'Autorisation
- `authenticateToken` : Vérifie la validité du token JWT
- `requireAdmin` : Nécessite un rôle ADMIN ou SUPER_ADMIN
- `requireSuperAdmin` : Nécessite un rôle SUPER_ADMIN

## 📊 Base de Données

### Schéma Prisma

```prisma
// Utilisateurs du système
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String   // Hashé avec bcrypt
  role      Role     @default(CASHIER)
  companyId Int?     // Nullable pour Super Admin
  company   Company? @relation(fields: [companyId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Entreprises clientes
model Company {
  id        Int      @id @default(autoincrement())
  name      String
  address   String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  employees Employee[]
  users     User[]
}

// Employés des entreprises
model Employee {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  telephone String?
  service   String?
  isActive  Boolean  @default(true)
  companyId Int
  company   Company  @relation(fields: [companyId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  payslips  Payslip[]
}

// Cycles de paie mensuels
model PayRun {
  id        Int           @id @default(autoincrement())
  month     Int           // 1-12
  year      Int
  startDate DateTime
  endDate   DateTime
  status    PayRunStatus  @default(DRAFT)

  payslips  Payslip[]
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
}

// Bulletins de salaire individuels
model Payslip {
  id            Int      @id @default(autoincrement())
  employeeId    Int
  payRunId      Int
  baseSalary    Float
  bonus         Float
  deductions    Float
  netSalary     Float
  amountPaid    Float?   @default(0)
  generatedPdfUrl String?
  receiptPdfUrl   String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  employee      Employee @relation(fields: [employeeId], references: [id])
  payRun        PayRun   @relation(fields: [payRunId], references: [id])
}

enum Role {
  SUPER_ADMIN
  ADMIN
  CASHIER
}

enum PayRunStatus {
  DRAFT       // Brouillon
  VALIDATED   // Validé, prêt pour paiement
  PAID        // Payé
}
```

### Migrations
```bash
# Créer une nouvelle migration
npx prisma migrate dev --name nom_de_la_migration

# Appliquer les migrations
npx prisma migrate deploy

# Générer le client Prisma
npx prisma generate
```

## 🌐 API Endpoints

### Authentification
```
POST /auth/login     - Connexion utilisateur
POST /auth/register  - Inscription (non implémenté)
```

### Utilisateurs
```
GET  /users          - Lister les utilisateurs (Super Admin uniquement)
```

### Entreprises
```
GET    /companies           - Lister toutes les entreprises
GET    /companies/:id       - Détails d'une entreprise
POST   /companies           - Créer une entreprise (Super Admin)
PUT    /companies/:id       - Mettre à jour une entreprise
DELETE /companies/:id       - Supprimer une entreprise
```

### Employés
```
GET    /employees              - Lister les employés (avec filtres)
GET    /employees/:id          - Détails d'un employé
POST   /employees              - Créer un employé
PUT    /employees/:id          - Mettre à jour un employé
DELETE /employees/:id          - Supprimer un employé
```

### Cycles de Paie (PayRun)
```
GET    /payruns                 - Lister tous les cycles
GET    /payruns/:id             - Détails d'un cycle
POST   /payruns                 - Créer un cycle de paie
PUT    /payruns/:id/validate    - Valider un cycle (DRAFT → VALIDATED)
PUT    /payruns/:id/pay         - Marquer comme payé (VALIDATED → PAID)
```

### Bulletins de Salaire
```
GET    /payslips/employee/:employeeId  - Bulletins d'un employé
POST   /payslips/generate/:payRunId    - Générer tous les bulletins d'un cycle
GET    /payslips/download/:payslipId   - Télécharger le PDF d'un bulletin
```

### Paiements
```
POST   /payments/:payslipId/pay  - Effectuer un paiement partiel/complet
```

## 🔧 Configuration

### Variables d'Environnement (.env)

```env
# Base de données
DATABASE_URL="mysql://user:password@localhost:3306/gestion_rh"

# JWT
JWT_SECRET="votre-secret-jwt-très-long-et-complexe"
JWT_EXPIRES_IN="24h"

# Serveur
PORT=3000
NODE_ENV="development"
```

### Scripts NPM

```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",     // Développement avec rechargement
    "build": "tsc",                    // Compilation TypeScript
    "start": "node dist/index.js",     // Production
    "test": "jest",                    // Tests (non configuré)
    "seed": "ts-node src/seed.ts"      // Données de test
  }
}
```

## 🧪 Données de Test

Le fichier `src/seed.ts` crée des données d'exemple :

- **Entreprise** : "ndiaye&frere"
- **Utilisateur Admin** : admin@gmail.com / password123
- **Employés** : alice@demo.com, bob@demo.com

```bash
npm run seed
```

## 📁 Gestion des Fichiers

### PDFs des Bulletins
- **Emplacement** : `backend/payslips-pdf/`
- **Génération** : Automatique avec PDFKit lors de la création des bulletins
- **Téléchargement** : Via endpoint `/payslips/download/:id`

### PDFs des Reçus
- **Emplacement** : `backend/receipts-pdf/`
- **Génération** : Automatique avec PDFKit lors des paiements
- **Contenu** : Détails du paiement, montant restant

## 🔒 Sécurité

### Authentification
- **Hashage des mots de passe** : bcrypt avec salt rounds
- **Validation des tokens** : Middleware JWT
- **Expiration des sessions** : Configurable

### Validation des Données
- **Entrées utilisateur** : Validation côté serveur
- **Types TypeScript** : Typage statique
- **Prisma** : Validation au niveau base de données

### Autorisation
- **Contrôle d'accès** : Basé sur les rôles utilisateur
- **Filtrage des données** : Selon l'entreprise de l'utilisateur
- **Permissions granulares** : Par endpoint et par action

## 🚀 Déploiement

### Build de Production
```bash
npm run build
npm start
```

### Variables d'Environnement Production
```env
NODE_ENV=production
DATABASE_URL="mysql://prod-user:prod-password@prod-host:3306/prod-db"
JWT_SECRET="production-secret-very-secure"
```

### Docker (Optionnel)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🐛 Debugging

### Logs
- **Console** : Logs Express en développement
- **Erreurs** : Gestion centralisée des erreurs
- **Prisma** : Logs des requêtes SQL (en développement)

### Outils de Développement
- **Nodemon** : Rechargement automatique
- **TypeScript** : Compilation à la volée
- **Prisma Studio** : Interface graphique pour la DB

```bash
npx prisma studio
```

## 📚 Dépendances Principales

### Runtime
- **express** : Framework web
- **typescript** : Superset JavaScript
- **prisma** : ORM base de données
- **@prisma/client** : Client Prisma

### Sécurité
- **jsonwebtoken** : Gestion JWT
- **bcryptjs** : Hashage mots de passe
- **cors** : Cross-Origin Resource Sharing

### Utilitaires
- **pdfkit** : Génération PDF
- **nodemon** : Rechargement développement
- **ts-node** : Exécution TypeScript

## 🔄 Workflows Métier

### 1. Création d'un Cycle de Paie
1. **Création** : POST /payruns
2. **Génération bulletins** : POST /payslips/generate/:payRunId
3. **Validation** : PUT /payruns/:id/validate
4. **Paiements** : POST /payments/:payslipId/pay
5. **Finalisation** : PUT /payruns/:id/pay

### 2. Gestion des Employés
1. **Création** : POST /employees
2. **Consultation** : GET /employees
3. **Modification** : PUT /employees/:id
4. **Historique paie** : GET /payslips/employee/:id

## 📞 Support & Maintenance

### Points d'Attention
- **Migrations Prisma** : Toujours tester en développement
- **Variables d'env** : Ne jamais commiter les vraies valeurs
- **Logs sensibles** : Ne pas logger les mots de passe
- **Rate limiting** : À implémenter pour la production

### Monitoring
- **Health check** : GET /health (à implémenter)
- **Métriques** : Logs structurés pour monitoring
- **Alertes** : Sur les erreurs critiques

---

Cette API fournit une base solide pour un système de gestion RH complet et évolutif.

