// Mock data for demo purposes

export const mockCompanies = [
  {
    id: 1,
    name: 'TechCorp Solutions',
    address: '123 Business Street, Tech City, TC 12345',
    currency: 'USD',
    payPeriod: 'monthly',
    logo: null,
    createdAt: '2024-01-15',
    adminId: 2
  },
  {
    id: 2,
    name: 'Green Energy Ltd',
    address: '456 Eco Avenue, Green Valley, GV 67890',
    currency: 'EUR',
    payPeriod: 'weekly',
    logo: null,
    createdAt: '2024-02-01',
    adminId: 5
  }
];

export const mockEmployees = [
  {
    id: 1,
    companyId: 1,
    firstName: 'Mike',
    lastName: 'Wilson',
    email: 'mike.wilson@techcorp.com',
    position: 'Software Developer',
    department: 'Engineering',
    salary: 75000,
    hireDate: '2023-06-15',
    status: 'active'
  },
  {
    id: 2,
    companyId: 1,
    firstName: 'Emily',
    lastName: 'Chen',
    email: 'emily.chen@techcorp.com',
    position: 'UX Designer',
    department: 'Design',
    salary: 68000,
    hireDate: '2023-08-01',
    status: 'active'
  },
  {
    id: 3,
    companyId: 1,
    firstName: 'Robert',
    lastName: 'Davis',
    email: 'robert.davis@techcorp.com',
    position: 'Project Manager',
    department: 'Management',
    salary: 82000,
    hireDate: '2023-03-10',
    status: 'active'
  },
  {
    id: 4,
    companyId: 2,
    firstName: 'Lisa',
    lastName: 'Anderson',
    email: 'lisa.anderson@greenenergy.com',
    position: 'Environmental Engineer',
    department: 'Engineering',
    salary: 70000,
    hireDate: '2024-01-20',
    status: 'active'
  }
];

export const mockPayrollCycles = [
  {
    id: 1,
    companyId: 1,
    name: 'January 2024 Payroll',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    payDate: '2024-02-01',
    status: 'completed',
    totalAmount: 225000,
    employeeCount: 3
  },
  {
    id: 2,
    companyId: 1,
    name: 'February 2024 Payroll',
    startDate: '2024-02-01',
    endDate: '2024-02-29',
    payDate: '2024-03-01',
    status: 'processing',
    totalAmount: 225000,
    employeeCount: 3
  },
  {
    id: 3,
    companyId: 2,
    name: 'Week 8 2024 Payroll',
    startDate: '2024-02-19',
    endDate: '2024-02-25',
    payDate: '2024-02-26',
    status: 'pending',
    totalAmount: 1346,
    employeeCount: 1
  }
];

export const mockPayslips = [
  {
    id: 1,
    employeeId: 1,
    payrollCycleId: 1,
    grossPay: 6250,
    netPay: 4687.50,
    deductions: {
      tax: 1250,
      socialSecurity: 312.50,
      healthInsurance: 0
    },
    bonuses: 0,
    overtime: 0,
    status: 'approved',
    paidAt: '2024-02-01'
  },
  {
    id: 2,
    employeeId: 2,
    payrollCycleId: 1,
    grossPay: 5666.67,
    netPay: 4250,
    deductions: {
      tax: 1133.33,
      socialSecurity: 283.33,
      healthInsurance: 0
    },
    bonuses: 0,
    overtime: 0,
    status: 'approved',
    paidAt: '2024-02-01'
  },
  {
    id: 3,
    employeeId: 3,
    payrollCycleId: 1,
    grossPay: 6833.33,
    netPay: 5125,
    deductions: {
      tax: 1366.67,
      socialSecurity: 341.67,
      healthInsurance: 0
    },
    bonuses: 0,
    overtime: 0,
    status: 'approved',
    paidAt: '2024-02-01'
  }
];

export const mockPayments = [
  {
    id: 1,
    payslipId: 1,
    amount: 4687.50,
    paymentMethod: 'bank_transfer',
    paymentDate: '2024-02-01',
    status: 'completed',
    reference: 'TXN001234',
    cashierId: 3
  },
  {
    id: 2,
    payslipId: 2,
    amount: 4250,
    paymentMethod: 'bank_transfer',
    paymentDate: '2024-02-01',
    status: 'completed',
    reference: 'TXN001235',
    cashierId: 3
  },
  {
    id: 3,
    payslipId: 3,
    amount: 5125,
    paymentMethod: 'check',
    paymentDate: '2024-02-01',
    status: 'completed',
    reference: 'CHK001001',
    cashierId: 3
  }
];

export const paymentMethods = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'digital_wallet', label: 'Digital Wallet' }
];

export const payrollStatuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

export const employeeStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'terminated', label: 'Terminated' }
];

export const payPeriodTypes = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'daily', label: 'Daily' }
];

export const currencies = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'CAD', label: 'Canadian Dollar (CAD)' }
];