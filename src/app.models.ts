import { Request } from 'express';
import { PermissionType } from './auth/permissions';

// export interface ResponseBody<T = undefined> {
//   success: boolean;
//   message?: string;
//   data?: T;
// }

export interface JwtPayload {
  sub: string;
  email: string;
  permissions: PermissionType[];
  isSystem?: boolean;
  suspended?: boolean;
}
export interface AuthRequest extends Request {
  user: JwtPayload;
}
