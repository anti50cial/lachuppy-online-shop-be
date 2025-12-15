import { SetMetadata } from '@nestjs/common';
import { PermissionType } from 'src/auth/permissions';

export const HasPermission = (permission: PermissionType) =>
  SetMetadata('has-permission', permission);
