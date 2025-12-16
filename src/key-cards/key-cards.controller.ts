import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { AuthRequest } from 'src/app.models';
import { PERMISSIONS } from 'src/auth/permissions';
import { HasPermission } from 'src/decorators/has-permission/has-permission.decorator';
import { CreateKeycardDto } from './dto/create-keycard.dto';
import { KeyCardsService } from './key-cards.service';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { PermissionsGuard } from 'src/guards/permissions/permissions.guard';
import { SuspensionAccessGuard } from 'src/guards/suspension-access/suspension-access.guard';

@Controller('keycards')
@UseGuards(JwtGuard, SuspensionAccessGuard, PermissionsGuard)
export class KeyCardsController {
  constructor(private readonly keyCardsService: KeyCardsService) {}

  @Post('generate')
  @HasPermission(PERMISSIONS.MANAGE_KEYCARDS)
  generate(@Request() req: AuthRequest, @Body() data: CreateKeycardDto) {
    return this.keyCardsService.generate(req.user, data);
  }

  @Get()
  @HasPermission(PERMISSIONS.MANAGE_KEYCARDS)
  getKeycards() {
    return this.keyCardsService.getKeycards();
  }

  @Get('possible-permissions')
  @HasPermission(PERMISSIONS.MANAGE_KEYCARDS)
  getPossiblePermissions(@Request() req: AuthRequest) {
    return this.keyCardsService.getPossiblePermissions(req.user);
  }

  @Get('revoke/:id')
  revokeKeyCard(@Param('id') id: string) {
    return this.keyCardsService.revokeKeyCard(id);
  }
}
