import express from 'express';
import cors from 'cors';
import { seedDefaultUsers } from './seed';
import userRoutes from './modules/user/user.routes'
import companyRoutes from './modules/company/company.routes';
import employeeRoutes from './modules/employee/employee.routes';
import payRunRouter from './modules/payrun/payrun.routes';
import payslipRouter from './modules/payslip/payslip.routes';
import paymentRouter from './modules/payment/payment.routes';
import authRoutes from './modules/auth/auth.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Middleware pour parser le JSON sans body-parser
app.use((req, res, next) => {
  if (req.headers['content-type'] === 'application/json') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        req.body = JSON.parse(body);
      } catch (e) {
        req.body = {};
      }
      next();
    });
  } else {
    req.body = {};
    next();
  }
});
app.use('/users', userRoutes);
app.use('/companies', companyRoutes);
app.use('/employees', employeeRoutes);
app.use('/payruns', payRunRouter);
app.use('/payslips', payslipRouter);
app.use('/payments', paymentRouter);
app.use('/auth', authRoutes);

app.get('/', (_req, res) => {
  res.send('Payroll API is running 🚀');
});

// Seed default users on startup
seedDefaultUsers().catch(console.error);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
