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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPayRun = createPayRun;
exports.listPayRuns = listPayRuns;
exports.getPayRun = getPayRun;
exports.validate = validate;
exports.pay = pay;
const service = __importStar(require("./payrun.service"));
// ➕ Créer un cycle
async function createPayRun(req, res) {
    try {
        const { month, year, startDate, endDate } = req.body;
        const payRun = await service.createPayRun(month, year, new Date(startDate), new Date(endDate));
        res.status(201).json(payRun);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}
// 📋 Lister tous les cycles
async function listPayRuns(_req, res) {
    try {
        const payRuns = await service.getPayRuns();
        res.json(payRuns);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to list pay runs' });
    }
}
// 🔍 Détails
async function getPayRun(req, res) {
    try {
        const payRun = await service.getPayRunById(Number(req.params.id));
        if (!payRun)
            return res.status(404).json({ error: 'PayRun not found' });
        res.json(payRun);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get pay run' });
    }
}
// ✅ Valider
async function validate(req, res) {
    try {
        const payRun = await service.validatePayRun(Number(req.params.id));
        res.json(payRun);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to validate pay run' });
    }
}
// 💸 Payer
async function pay(req, res) {
    try {
        const payRun = await service.markPayRunAsPaid(Number(req.params.id));
        res.json(payRun);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to mark pay run as paid' });
    }
}
