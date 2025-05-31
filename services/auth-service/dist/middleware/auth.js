"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const config_1 = require("../utils/config");
// JWKS client
const jwks = (0, jwks_rsa_1.default)({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://cognito-idp.${config_1.config.region}.amazonaws.com/${config_1.config.userPoolId}/.well-known/jwks.json`,
});
const verifyJwt = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid token' });
        return;
    }
    const token = authHeader.split(' ')[1];
    const decodedHeader = jsonwebtoken_1.default.decode(token, { complete: true });
    if (!decodedHeader || typeof decodedHeader === 'string') {
        res.status(401).json({ error: 'Invalid token structure' });
        return;
    }
    const kid = decodedHeader.header.kid;
    jwks.getSigningKey(kid, (err, key) => {
        if (err || !key) {
            res.status(401).json({
                error: 'Unable to retrieve signing key',
                details: err?.message
            });
            return;
        }
        const signingKey = key.getPublicKey();
        try {
            const decoded = jsonwebtoken_1.default.verify(token, signingKey, {
                algorithms: ['RS256'],
                issuer: `https://cognito-idp.${config_1.config.region}.amazonaws.com/${config_1.config.userPoolId}`,
            });
            const { sub, email } = decoded;
            if (!sub || !email) {
                res.status(401).json({ error: 'Token is missing required claims' });
                return;
            }
            // This should now work with the custom type definition
            req.user = { sub, email };
            next();
        }
        catch (verifyErr) {
            res.status(401).json({
                error: 'Token verification failed',
                details: verifyErr.message
            });
        }
    });
};
exports.verifyJwt = verifyJwt;
