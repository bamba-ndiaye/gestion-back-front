import express from 'express';
import cors from 'cors';
import path from 'path';
import { seedDefaultUsers } from './seed';
import userRoutes from './modules/user/user.routes'
import companyRoutes from './modules/company/company.routes';
import employeeRoutes from './modules/employee/employee.routes';
import payRunRouter from './modules/payrun/payrun.routes';
import payslipRouter from './modules/payslip/payslip.routes';
import paymentRouter from './modules/payment/payment.routes';
import authRoutes from './modules/auth/auth.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Servir les fichiers PDF statiques
app.use('/payslips-pdf', express.static(path.join(__dirname, 'payslips-pdf')));

app.use('/users', userRoutes);
app.use('/companies', companyRoutes);
app.use('/employees', employeeRoutes);
app.use('/payruns', payRunRouter);
app.use('/payslips', payslipRouter);
app.use('/payments', paymentRouter);
app.use('/auth', authRoutes);
app.use('/attendance', attendanceRoutes);

app.get('/', (_req, res) => {
  res.send('Payroll API is running 🚀');
});

// Seed default users on startup
seedDefaultUsers().catch(console.error);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
