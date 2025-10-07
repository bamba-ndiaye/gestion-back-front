"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const seed_1 = require("./seed");
const user_routes_1 = __importDefault(require("./modules/user/user.routes"));
const company_routes_1 = __importDefault(require("./modules/company/company.routes"));
const employee_routes_1 = __importDefault(require("./modules/employee/employee.routes"));
const payrun_routes_1 = __importDefault(require("./modules/payrun/payrun.routes"));
const payslip_routes_1 = __importDefault(require("./modules/payslip/payslip.routes"));
const payment_routes_1 = __importDefault(require("./modules/payment/payment.routes"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
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
            }
            catch (e) {
                req.body = {};
            }
            next();
        });
    }
    else {
        req.body = {};
        next();
    }
});
app.use('/users', user_routes_1.default);
app.use('/companies', company_routes_1.default);
app.use('/employees', employee_routes_1.default);
app.use('/payruns', payrun_routes_1.default);
app.use('/payslips', payslip_routes_1.default);
app.use('/payments', payment_routes_1.default);
app.use('/auth', auth_routes_1.default);
app.get('/', (_req, res) => {
    res.send('Payroll API is running 🚀');
});
// Seed default users on startup
(0, seed_1.seedDefaultUsers)().catch(console.error);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
