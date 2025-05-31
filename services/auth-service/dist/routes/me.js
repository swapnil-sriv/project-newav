"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meRoute = void 0;
const express_1 = require("express");
const meRoute = (0, express_1.Router)();
exports.meRoute = meRoute;
meRoute.get('/me', (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    res.json({
        sub: req.user.sub,
        email: req.user.email,
    });
    return;
});
