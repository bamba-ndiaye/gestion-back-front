import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// const defaultCompanies = [
//   {
//     name: 'ndiaye&frere.',
//     address: '123rue , medina kelle City',
//   },
// ];

const defaultUsers = [
  {
    name: 'Super Administrator',
    email: 'admin@gmail.com',
    password: 'admin123',
    role: 'SUPER_ADMIN' as const,
    companyId: null, // Super Admin n'appartient à aucune compagnie spécifique
  },
  // {
  //   name: 'John Smith',
  //   email: 'company1@demo.com',
  //   password: 'demo123',
  //   role: 'ADMIN' as const,
  //   companyId: 1, // Administrator de la compagnie 1
  // },
  // {
  //   name: 'Sarah Johnson',
  //   email: 'cashier1@demo.com',
  //   password: 'demo123',
  //   role: 'CASHIER' as const,
  //   companyId: 1, // Caissier de la compagnie 1
  // },
];

// const defaultEmployees = [
//   {
//     name: 'Alice Dupont',
//     email: 'alice@demo.com',
//     companyId: 1,
//   },
//   {
//     name: 'Bob Martin',
//     email: 'bob@demo.com',
//     companyId: 1,
//   },
// ];

export async function seedDefaultUsers() {
  console.log('🌱 Seeding default data...');

  // // Créer d'abord les compagnies
  // for (const companyData of defaultCompanies) {
  //   try {
  //     const existingCompany = await prisma.company.findFirst({
  //       where: { name: companyData.name },
  //     });

  //     if (!existingCompany) {
  //       const company = await prisma.company.create({
  //         data: companyData,
  //       });
  //       console.log(`✅ Created company: ${company.name}`);
  //     } else {
  //       console.log(`⏭️  Company already exists: ${companyData.name}`);
  //     }
  //   } catch (error) {
  //     console.error(`❌ Error creating company ${companyData.name}:`, error);
  //   }
  // }

  // Ensuite créer les utilisateurs
  for (const userData of defaultUsers) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (!existingUser) {
        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Créer l'utilisateur
        const user = await prisma.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role,
            companyId: userData.companyId,
          },
        });

        console.log(`✅ Created user: ${user.email} (${user.role})`);
      } else {
        console.log(`⏭️  User already exists: ${userData.email}`);
      }
    } catch (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error);
    }
  }

  // // Créer les admins pour les entreprises par défaut
  // for (const companyData of defaultCompanies) {
  //   try {
  //     const company = await prisma.company.findFirst({
  //       where: { name: companyData.name },
  //     });

  //     if (company) {
  //       const adminEmail = `admin@${companyData.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`;
  //       const existingAdmin = await prisma.user.findUnique({
  //         where: { email: adminEmail },
  //       });

  //       if (!existingAdmin) {
  //         const hashedPassword = await bcrypt.hash('admin123', 10);
  //         const adminUser = await prisma.user.create({
  //           data: {
  //             name: 'Administrator',
  //             email: adminEmail,
  //             password: hashedPassword,
  //             role: 'ADMIN',
  //             companyId: company.id,
  //           },
  //         });
  //         console.log(`✅ Created admin user: ${adminEmail} for company ${company.name}`);
  //       } else {
  //         console.log(`⏭️  Admin already exists: ${adminEmail}`);
  //       }
  //     }
  //   } catch (error) {
  //     console.error(`❌ Error creating admin for ${companyData.name}:`, error);
  //   }
  // }

  // // Créer les employés
  // for (const employeeData of defaultEmployees) {
  //   try {
  //     const existingEmployee = await prisma.employee.findFirst({
  //       where: { email: employeeData.email },
  //     });

  //     if (!existingEmployee) {
  //       const employee = await prisma.employee.create({
  //         data: employeeData,
  //       });
  //       console.log(`✅ Created employee: ${employee.name} (${employee.email})`);
  //     } else {
  //       console.log(`⏭️  Employee already exists: ${employeeData.email}`);
  //     }
  //   } catch (error) {
  //     console.error(`❌ Error creating employee ${employeeData.email}:`, error);
  //   }
  // }

  console.log('🎉 Seeding completed!');
}