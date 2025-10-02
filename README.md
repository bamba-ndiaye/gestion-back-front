# Gestion RH - Système de Gestion des Ressources Humaines

Un système complet de gestion des ressources humaines avec gestion des employés, bulletins de salaire, paiements et validation des cycles de paie.

## 🏗️ Architecture

Ce projet est organisé en architecture full-stack avec séparation claire entre backend et frontend :

- **Backend** : API REST Node.js/TypeScript avec Prisma ORM et MySQL
- **Frontend** : Application React/TypeScript avec Vite, Shadcn/UI et Tailwind CSS

## 📁 Structure du Projet

```
gestion-back-front/
├── backend/                 # API Backend
│   ├── src/
│   │   ├── modules/         # Modules métier
│   │   ├── middlewares/     # Middlewares Express
│   │   ├── config/          # Configuration
│   │   └── utils/           # Utilitaires
│   ├── prisma/              # Schéma base de données
│   └── package.json
├── frontend/                # Application Frontend
│   ├── src/
│   │   ├── components/      # Composants React
│   │   ├── pages/           # Pages de l'application
│   │   ├── context/         # Context React
│   │   └── lib/             # Utilitaires frontend
│   └── package.json
└── README.md               # Documentation principale
```

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- MySQL 8.0+
- npm ou yarn

### Installation

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd gestion-back-front
   ```

2. **Configuration de la base de données**
   ```bash
   # Créer une base de données MySQL
   mysql -u root -p
   CREATE DATABASE gestion_rh;
   ```

3. **Configuration des variables d'environnement**
   ```bash
   # Dans backend/
   cp .env.example .env
   # Éditer .env avec vos configurations MySQL
   ```

4. **Installation des dépendances**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

5. **Migration de la base de données**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   ```

6. **Démarrage des services**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

7. **Accès à l'application**
   - Frontend : http://localhost:8082
   - Backend API : http://localhost:3000

## 👥 Rôles Utilisateur

- **Super Admin** : Accès complet à toutes les entreprises
- **Admin** : Gestion des employés de leur entreprise
- **Caissier** : Gestion des paiements
- **Employé** : Consultation de leurs propres données

## 🔧 Fonctionnalités Principales

### Gestion des Employés
- ✅ Création, modification, suppression d'employés
- ✅ Consultation des détails employés
- ✅ Gestion des statuts actifs/inactifs

### Gestion des Entreprises
- ✅ Création et gestion d'entreprises
- ✅ Consultation des détails entreprise
- ✅ Attribution d'employés aux entreprises

### Gestion des Paies
- ✅ Création de cycles de paie (PayRun)
- ✅ Génération automatique des bulletins de salaire
- ✅ Validation des cycles de paie
- ✅ Gestion des paiements partiels/complets

### Authentification et Autorisation
- ✅ Système d'authentification JWT
- ✅ Contrôle d'accès basé sur les rôles
- ✅ Sessions sécurisées

## 📚 Documentation Détaillée

- [📖 Documentation Backend](./backend/README.md)
- [🎨 Documentation Frontend](./frontend/README.md)

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** - Runtime JavaScript
- **TypeScript** - Typage statique
- **Express.js** - Framework web
- **Prisma** - ORM et migrations
- **MySQL** - Base de données
- **JWT** - Authentification
- **bcrypt** - Hashage des mots de passe
- **PDFKit** - Génération de PDF

### Frontend
- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Vite** - Outil de build rapide
- **React Router** - Routage
- **TanStack Query** - Gestion d'état serveur
- **Shadcn/UI** - Composants UI
- **Tailwind CSS** - Framework CSS
- **Lucide React** - Icônes

## 🔒 Sécurité

- Authentification JWT avec expiration
- Hashage des mots de passe avec bcrypt
- Validation des entrées utilisateur
- Contrôle d'accès basé sur les rôles
- Sanitisation des données

## 📊 Base de Données

Le schéma de base de données inclut :

- **Users** : Utilisateurs du système avec rôles
- **Companies** : Entreprises clientes
- **Employees** : Employés des entreprises
- **PayRuns** : Cycles de paie mensuels
- **Payslips** : Bulletins de salaire individuels

## 🚀 Déploiement

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Servir le dossier dist avec un serveur web
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

Pour toute question ou problème, veuillez créer une issue dans ce repository.

---

Développé avec ❤️ pour la gestion efficace des ressources humaines.
