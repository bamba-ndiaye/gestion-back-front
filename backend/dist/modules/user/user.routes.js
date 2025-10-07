"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_service_1 = require("./user.service");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    const { userName, email, password, role } = req.body;
    try {
        const user = await (0, user_service_1.registerUser)({ name: userName, email, password, role });
        res.status(201).json({ id: user.id, email: user.email, role: user.role });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.default = router;
