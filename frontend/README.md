 # Frontend - Application Web Gestion RH

Interface utilisateur moderne et responsive pour le système de gestion des ressources humaines, développée avec React, TypeScript et Vite.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- npm ou yarn
- Backend API en cours d'exécution (voir [../backend/README.md](../backend/README.md))

### Installation

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Configuration de l'environnement**
   ```bash
   # Créer un fichier .env si nécessaire
   # L'API base URL est configurée dans src/lib/api.ts
   ```

3. **Démarrage en développement**
   ```bash
   npm run dev
   ```

L'application sera disponible sur `http://localhost:8082`

## 🏗️ Architecture

### Structure des Dossiers

```
frontend/
├── src/
│   ├── App.tsx              # Application principale
│   ├── main.tsx             # Point d'entrée
│   ├── index.css            # Styles globaux
│   ├── vite-env.d.ts        # Types Vite
│   ├── components/          # Composants React
│   │   ├── ui/              # Composants UI réutilisables (Shadcn)
│   │   ├── forms/           # Formulaires (Employé, Entreprise, etc.)
│   │   ├── dashboards/      # Dashboards par rôle
│   │   ├── Layout.tsx       # Layout principal
│   │   └── Login.tsx        # Page de connexion
│   ├── pages/               # Pages de l'application
│   │   ├── Dashboard.tsx    # Page principale du dashboard
│   │   ├── Index.tsx        # Page d'accueil
│   │   └── NotFound.tsx     # Page 404
│   ├── context/             # Context React
│   │   └── AuthContext.tsx  # Gestion de l'authentification
│   ├── hooks/               # Hooks personnalisés
│   ├── lib/                 # Utilitaires
│   │   ├── api.ts           # Client API
│   │   └── utils.ts         # Fonctions utilitaires
│   └── data/                # Données mock (pour développement)
├── public/                  # Assets statiques
├── components.json          # Configuration Shadcn/UI
├── tailwind.config.ts       # Configuration Tailwind
├── vite.config.ts           # Configuration Vite
└── package.json
```

### Architecture des Composants

#### Dashboards par Rôle
- **SuperAdminDashboard** : Gestion globale (toutes entreprises)
- **AdministratorDashboard** : Gestion d'une entreprise
- **CashierDashboard** : Gestion des paiements
- **EmployeeDashboard** : Consultation personnelle

#### Composants UI (Shadcn)
- **Card, Button, Input** : Composants de base
- **Dialog, Sheet** : Modals et panneaux
- **Table, Badge** : Affichage de données
- **Tabs, Accordion** : Navigation et organisation

## 🎨 Design System

### Thème
- **Framework CSS** : Tailwind CSS
- **Composants** : Shadcn/UI (basé sur Radix UI)
- **Icônes** : Lucide React
- **Palette** : Variables CSS personnalisées

### Responsive Design
- **Mobile-first** : Conception adaptée mobile
- **Breakpoints** : sm, md, lg, xl
- **Grid system** : Flexbox et CSS Grid

### Animations
- **Transitions** : Smooth transitions CSS
- **Loading states** : Indicateurs de chargement
- **Fade effects** : Animations d'entrée/sortie

## 🔐 Authentification

### Context d'Authentification
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CASHIER';
  companyId?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
```

### Gestion des Sessions
- **Token JWT** stocké dans localStorage
- **Auto-login** au rechargement de page
- **Logout automatique** sur token expiré

## 🌐 Routage

### Structure des Routes
```typescript
// Routes publiques
/                 -> Page d'accueil
/login           -> Connexion

// Routes protégées (nécessitent authentification)
/dashboard       -> Dashboard selon le rôle
```

### Protection des Routes
- **AuthGuard** : Redirection vers /login si non authentifié
- **RoleGuard** : Contrôle d'accès selon le rôle

## 📊 Gestion d'État

### TanStack Query (React Query)
- **Cache intelligent** : Mise en cache automatique des requêtes
- **Synchronisation** : Invalidation et refetch automatique
- **Mutations** : Gestion optimiste des modifications

### Context API
- **AuthContext** : État global d'authentification
- **ThemeContext** : Gestion du thème (optionnel)

## 🔧 API Client

### Configuration
```typescript
// src/lib/api.ts
const API_BASE_URL = 'http://localhost:3000';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Implémentation avec gestion JWT
  }

  // Méthodes HTTP
  async get<T>(endpoint: string): Promise<T>
  async post<T>(endpoint: string, data: any): Promise<T>
  async put<T>(endpoint: string, data: any): Promise<T>
  async delete<T>(endpoint: string): Promise<T>
}
```

### Gestion des Erreurs
- **Toast notifications** : Messages d'erreur/succès
- **Loading states** : Indicateurs de chargement
- **Retry logic** : Tentatives automatiques sur échec

## 📱 Pages et Composants

### Page de Connexion
- **Formulaire** : Email + mot de passe
- **Validation** : Côté client et serveur
- **Redirection** : Selon le rôle après connexion

### Dashboards

#### Super Admin Dashboard
- **Vue d'ensemble** : Toutes les entreprises
- **Gestion entreprises** : Création, modification
- **Navigation** : Sélection d'entreprise pour gestion détaillée

#### Admin Dashboard
- **Statistiques** : Employés, paies, cycles actifs
- **Gestion employés** : CRUD complet
- **Cycles de paie** : Création, validation, paiement
- **Détails entreprise** : Consultation des infos société

#### Employee Dashboard
- **Infos personnelles** : Profil employé
- **Bulletins de salaire** : Historique et téléchargement
- **Statistiques** : Rémunération annuelle, paiements

### Formulaires
- **EmployeeForm** : Création/modification employé
- **CompanyForm** : Gestion entreprise (Super Admin)
- **PayrollForm** : Lancement cycle de paie
- **PaymentForm** : Enregistrement paiements

### Modals
- **EmployeeDetailsModal** : Détails complets employé
- **CompanyDetailsModal** : Informations entreprise
- **EmployeePaymentsModal** : Historique paiements employé

## 🎯 Fonctionnalités Implémentées

### ✅ Authentification
- Connexion/déconnexion
- Persistance de session
- Protection des routes

### ✅ Gestion des Employés
- Liste avec filtres et recherche
- Création, modification, suppression
- Consultation des détails
- Gestion des statuts actifs/inactifs

### ✅ Gestion des Entreprises
- Création et gestion (Super Admin)
- Consultation des détails
- Attribution aux utilisateurs

### ✅ Gestion des Paies
- Création de cycles de paie
- Génération automatique des bulletins
- Validation des cycles
- Historique des paiements par employé
- Téléchargement des PDFs

### ✅ Interface Utilisateur
- Design responsive
- Animations fluides
- Mode sombre/clair (optionnel)
- Notifications toast
- États de chargement

## 🛠️ Outils de Développement

### Vite
- **Build rapide** : HMR (Hot Module Replacement)
- **Optimisation** : Tree shaking, code splitting
- **Plugins** : React, TypeScript

### TypeScript
- **Typage strict** : Sécurité des types
- **IntelliSense** : Autocomplétion IDE
- **Refactoring** : Outils de réusinage

### ESLint + Prettier
- **Linting** : Qualité du code
- **Formatage** : Style consistant
- **Règles** : Configuration personnalisée

## 📦 Build et Déploiement

### Build de Production
```bash
npm run build
```

### Prévisualisation
```bash
npm run preview
```

### Déploiement
```bash
# Build optimisé pour production
npm run build

# Les fichiers sont générés dans le dossier dist/
# Servir avec n'importe quel serveur web (nginx, apache, etc.)
```

### Variables d'Environnement
```env
# Pour la production
VITE_API_URL=https://api.votre-domaine.com
```

## 🔄 Workflows Utilisateur

### 1. Connexion Admin
1. **Connexion** : Formulaire login
2. **Dashboard** : Vue d'ensemble avec statistiques
3. **Gestion employés** : CRUD employés
4. **Cycles paie** : Création et validation

### 2. Consultation Employé
1. **Connexion** : Accès employé
2. **Dashboard personnel** : Infos et statistiques
3. **Bulletins** : Consultation et téléchargement
4. **Historique** : Suivi des paiements

### 3. Validation Paie (Admin)
1. **Création cycle** : Nouveau PayRun
2. **Génération bulletins** : PDFs automatiques
3. **Validation** : Changement statut DRAFT → VALIDATED
4. **Paiements** : Enregistrement des versements

## 🎨 Personnalisation

### Thème
```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
        secondary: '#your-color',
        // ...
      }
    }
  }
}
```

### Composants UI
- **Shadcn/UI** : Personnalisable via CSS variables
- **Icônes** : Remplacement possible dans les composants
- **Layout** : Modification du Layout.tsx

## 🐛 Debugging

### Outils de Développement
- **React DevTools** : Inspection composants
- **Network tab** : Requêtes API
- **Console** : Logs et erreurs

### Logs
- **API errors** : Affichés dans les toasts
- **Loading states** : Indicateurs visuels
- **Form validation** : Messages d'erreur

## 📚 Dépendances Principales

### Core
- **react** : Bibliothèque UI
- **react-dom** : Rendu DOM
- **typescript** : Superset JavaScript

### Routing
- **react-router-dom** : Navigation

### État
- **@tanstack/react-query** : Gestion serveur state

### UI
- **@radix-ui/*** : Composants primitifs
- **lucide-react** : Icônes
- **tailwindcss** : Framework CSS

### Utilitaires
- **clsx** : Classes CSS conditionnelles
- **date-fns** : Manipulation dates
- **react-hook-form** : Gestion formulaires

## 🚀 Performance

### Optimisations
- **Code splitting** : Chargement paresseux des routes
- **Tree shaking** : Suppression code inutilisé
- **Compression** : Gzip/brotli en production
- **Caching** : Cache intelligent des requêtes

### Métriques
- **Bundle size** : Monitoring taille build
- **Loading times** : Mesure performances
- **Lighthouse** : Audit automatisé

## 🔮 Évolutions Futures

### Fonctionnalités
- **Notifications** : Alertes en temps réel
- **Rapports** : Tableaux de bord avancés
- **Intégrations** : API externes (banques, etc.)
- **Multi-tenant** : Isolation données par entreprise

### Améliorations UX
- **Mode sombre** : Thème sombre/clair
- **Internationalisation** : Support multi-langue
- **Accessibility** : Conformité WCAG
- **PWA** : Application progressive

---

Cette interface fournit une expérience utilisateur moderne et intuitive pour la gestion RH, avec une architecture maintenable et évolutive.
