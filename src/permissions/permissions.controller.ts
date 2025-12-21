import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthRequest } from 'src/app.models';
import { PermissionsService } from './permissions.service';
import { PERMISSIONS } from 'src/auth/permissions';
import { HasPermission } from 'src/decorators/has-permission/has-permission.decorator';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { PermissionsGuard } from 'src/guards/permissions/permissions.guard';
import { SuspensionAccessGuard } from 'src/guards/suspension-access/suspension-access.guard';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@UseGuards(JwtGuard, SuspensionAccessGuard, PermissionsGuard)
@HasPermission(PERMISSIONS.IS_HIGH_LEVEL)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @HasPermission(PERMISSIONS.IS_HIGH_LEVEL)
  @Get()
  findAll() {
    return this.permissionsService.getPossiblePermissions();
  }

  @HasPermission(PERMISSIONS.IS_HIGH_LEVEL)
  @Patch(':id')
  updateAdminPermissions(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.updateAdminPermissions(
      req.user,
      id,
      updatePermissionDto,
    );
  }
}
