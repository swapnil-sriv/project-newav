import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import { config } from '../utils/config';


// JWKS client
const jwks = jwksRsa({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
  jwksUri: `https://cognito-idp.${config.region}.amazonaws.com/${config.userPoolId}/.well-known/jwks.json`,
});

// Define the custom JWT payload interface
interface CustomJwtPayload extends JwtPayload {
  sub: string;
  email: string;
}

// Define the extended request interface
interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
  };
}

export const verifyJwt = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const decodedHeader = jwt.decode(token, { complete: true });
  
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
      const decoded = jwt.verify(token, signingKey, {
        algorithms: ['RS256'],
        issuer: `https://cognito-idp.${config.region}.amazonaws.com/${config.userPoolId}`,
      }) as CustomJwtPayload;

      const { sub, email } = decoded;
      
      if (!sub || !email) {
        res.status(401).json({ error: 'Token is missing required claims' });
        return;
      }

      // Type assertion to add user property
      (req as AuthenticatedRequest).user = { sub, email };
      next();
      
    } catch (verifyErr: any) {
      res.status(401).json({ 
        error: 'Token verification failed', 
        details: verifyErr.message 
      });
    }
  });
};