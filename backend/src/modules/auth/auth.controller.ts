import { Request, Response } from 'express';
import { registerUser, loginUser } from './auth.service';
import { AuthRequest } from '../../middlewares/auth.middleware';

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;
  try {
    const user = await registerUser(name, email, password);
    res.status(201).json({ message: 'Utilisateur créé', user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const result = await loginUser(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function getUserInterface(req: AuthRequest, res: Response) {
  const user = req.user!;

  // Structure de base de l'interface
  const baseInterface = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId
    },
    navigation: [] as any[],
    dashboard: {} as any,
    permissions: {} as any
  };

  // Configuration selon le rôle
  switch (user.role) {
    case 'SUPER_ADMIN':
      baseInterface.navigation = [
        { name: 'Dashboard', path: '/super-admin', icon: 'dashboard' },
        { name: 'Companies', path: '/super-admin/companies', icon: 'building' },
        { name: 'All Employees', path: '/super-admin/employees', icon: 'users' },
        { name: 'Payroll', path: '/super-admin/payroll', icon: 'calculator' }
      ];
      baseInterface.dashboard = {
        title: 'Super Administrator Dashboard',
        widgets: [
          { type: 'stats', title: 'Total Companies', value: 'companies_count', icon: 'building' },
          { type: 'stats', title: 'Total Employees', value: 'employees_count', icon: 'users' },
          { type: 'stats', title: 'Monthly Payroll', value: 'payroll_total', icon: 'dollar' },
          { type: 'recent_activity', title: 'Recent Activity' }
        ],
        actions: [
          { name: 'Add Company', path: '/super-admin/companies/new', icon: 'plus' },
          { name: 'Generate Reports', path: '/super-admin/reports', icon: 'file' }
        ]
      };
      baseInterface.permissions = {
        canCreateCompany: true,
        canEditCompany: true,
        canDeleteCompany: true,
        canCreateEmployee: true,
        canEditEmployee: true,
        canDeleteEmployee: true,
        canViewAllEmployees: true,
        canManagePayroll: true,
        canGenerateReports: true
      };
      break;

    case 'ADMIN':
      baseInterface.navigation = [
        { name: 'Dashboard', path: '/admin', icon: 'dashboard' },
        { name: 'My Employees', path: '/admin/employees', icon: 'users' },
        { name: 'Payroll', path: '/admin/payroll', icon: 'calculator' }
      ];
      baseInterface.dashboard = {
        title: 'Administrator Dashboard',
        widgets: [
          { type: 'stats', title: 'My Employees', value: 'my_employees_count', icon: 'users' },
          { type: 'stats', title: 'Company Payroll', value: 'company_payroll', icon: 'dollar' },
          { type: 'recent_activity', title: 'Company Activity' }
        ],
        actions: [
          { name: 'Add Employee', path: '/admin/employees/new', icon: 'plus' },
          { name: 'Process Payroll', path: '/admin/payroll/process', icon: 'calculator' }
        ]
      };
      baseInterface.permissions = {
        canCreateCompany: false,
        canEditCompany: false,
        canDeleteCompany: false,
        canCreateEmployee: true, // Seulement pour sa compagnie
        canEditEmployee: true,   // Seulement pour sa compagnie
        canDeleteEmployee: true, // Seulement pour sa compagnie
        canViewAllEmployees: false, // Seulement les siens
        canManagePayroll: true,  // Pour sa compagnie
        canGenerateReports: false
      };
      break;

    case 'CASHIER':
      baseInterface.navigation = [
        { name: 'Dashboard', path: '/', icon: 'dashboard' },
        { name: 'Payments', path: '/payments', icon: 'credit-card' }
      ];
      baseInterface.dashboard = {
        title: 'Cashier Dashboard',
        widgets: [
          { type: 'stats', title: 'Today\'s Payments', value: 'today_payments', icon: 'credit-card' },
          { type: 'stats', title: 'Pending Payments', value: 'pending_payments', icon: 'clock' },
          { type: 'recent_payments', title: 'Recent Payments' }
        ],
        actions: [
          { name: 'Process Payment', path: '/payments/new', icon: 'plus' },
          { name: 'Payment History', path: '/payments/history', icon: 'history' }
        ]
      };
      baseInterface.permissions = {
        canCreateCompany: false,
        canEditCompany: false,
        canDeleteCompany: false,
        canCreateEmployee: false,
        canEditEmployee: false,
        canDeleteEmployee: false,
        canViewAllEmployees: false,
        canManagePayroll: false,
        canProcessPayments: true,
        canViewPaymentHistory: true
      };
      break;

    default:
      return res.status(400).json({ error: 'Invalid user role' });
  }

  res.json(baseInterface);
}
