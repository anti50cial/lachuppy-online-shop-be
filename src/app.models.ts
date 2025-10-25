import { Request } from 'express';

// export interface ResponseBody<T = undefined> {
//   success: boolean;
//   message?: string;
//   data?: T;
// }

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}
export interface AuthRequest extends Request {
  user: JwtPayload;
}
