import {
  Controller,
  Get,
  Param,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { AuthRequest } from 'src/app.models';
import { PERMISSIONS } from 'src/auth/permissions';
import { HasPermission } from 'src/decorators/has-permission/has-permission.decorator';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { PermissionsGuard } from 'src/guards/permissions/permissions.guard';
import { SuspensionAccessGuard } from 'src/guards/suspension-access/suspension-access.guard';
import { AdminsService } from './admins.service';

@UseGuards(JwtGuard, SuspensionAccessGuard, PermissionsGuard)
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  @HasPermission(PERMISSIONS.IS_HIGH_LEVEL)
  findAll(@Request() req: AuthRequest) {
    return this.adminsService.findAll(req.user);
  }
  @Get('me')
  findMe(@Req() req: AuthRequest) {
    return this.adminsService.findMe(req.user);
  }

  @Get(':id')
  @HasPermission(PERMISSIONS.IS_HIGH_LEVEL)
  findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.adminsService.findOne(req.user, id);
  }

  @Get('suspend/:id')
  @HasPermission(PERMISSIONS.IS_HIGH_LEVEL)
  suspend(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.adminsService.suspend(req.user, id);
  }

  @Get('restore/:id')
  @HasPermission(PERMISSIONS.IS_HIGH_LEVEL)
  restore(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.adminsService.restore(req.user, id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
  //   return this.adminsService.update(+id, updateAdminDto);
  // }

  // @Delete(':id')
  // @HasPermission(PERMISSIONS.IS_HIGH_LEVEL)
  // remove(@Param('id') id: string) {
  //   return this.adminsService.remove(+id);
  // }
}
