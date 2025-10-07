"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = generate;
exports.downloadPDF = downloadPDF;
exports.getEmployeePayslips = getEmployeePayslips;
const service = __importStar(require("./payslip.service"));
const fs_1 = __importDefault(require("fs"));
// Générer tous les bulletins pour un PayRun
async function generate(req, res) {
    try {
        const payRunId = Number(req.params.payRunId);
        const payslips = await service.generatePayslips(payRunId);
        res.status(201).json(payslips);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}
// Télécharger le PDF d’un bulletin
async function downloadPDF(req, res) {
    const payslipId = Number(req.params.payslipId);
    try {
        const payslip = await service.getPayslipById(payslipId);
        if (!payslip || !payslip.generatedPdfUrl) {
            return res.status(404).json({ error: 'PDF non trouvé' });
        }
        const filePath = payslip.generatedPdfUrl;
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({ error: 'Fichier PDF manquant' });
        }
        res.download(filePath, `payslip_${payslip.id}.pdf`);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
// Obtenir les bulletins d'un employé
async function getEmployeePayslips(req, res) {
    const employeeId = Number(req.params.employeeId);
    try {
        const payslips = await service.getPayslipsByEmployee(employeeId);
        res.json(payslips);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
