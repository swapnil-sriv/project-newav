"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./middleware/auth");
const me_1 = require("./routes/me");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(auth_1.verifyJwt);
app.use(me_1.meRoute);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log("auth-service running on http://localhost:${PORT}");
});
