import { Router, Request, Response } from 'express';


// Define the extended request interface
interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
  };
}

const meRoute = Router();

meRoute.get('/me', (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  
  if (!authReq.user) {
     res.status(401).json({ error: 'Unauthorized' });
     return;
  }
  
  res.json({
    sub: authReq.user.sub,
    email: authReq.user.email,
  });
  return;
});

export { meRoute };