import { Request } from 'express';

export interface UserPayload {
  sub: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}