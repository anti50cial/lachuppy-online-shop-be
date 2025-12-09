import {
  Controller,
  Delete,
  Get,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { AuthRequest } from 'src/app.models';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { SuspensionAccessGuard } from 'src/guards/suspension-access/suspension-access.guard';
import { AdminsService } from './admins.service';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { Roles } from 'src/decorators/roles/roles.decorator';

@UseGuards(JwtGuard, SuspensionAccessGuard, RolesGuard)
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Roles('Superuser', 'TopAdmin')
  @Get('generate-signup-code')
  generate(@Request() req: AuthRequest) {
    return this.adminsService.generate(req.user);
  }

  @Roles('Superuser', 'TopAdmin')
  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.adminsService.findAll(req.user);
  }

  @Roles('Superuser', 'TopAdmin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminsService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
  //   return this.adminsService.update(+id, updateAdminDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminsService.remove(+id);
  }
}
