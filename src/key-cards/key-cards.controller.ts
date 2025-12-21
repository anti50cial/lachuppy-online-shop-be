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

  @HasPermission(PERMISSIONS.IS_HIGH_LEVEL)
  @Post('generate')
  generate(@Request() req: AuthRequest, @Body() data: CreateKeycardDto) {
    return this.keyCardsService.generate(req.user, data);
  }

  @HasPermission(PERMISSIONS.IS_HIGH_LEVEL)
  @Get()
  getKeycards() {
    return this.keyCardsService.getKeycards();
  }

  @HasPermission(PERMISSIONS.IS_HIGH_LEVEL)
  @Get('revoke/:id')
  revokeKeyCard(@Param('id') id: string) {
    return this.keyCardsService.revokeKeyCard(id);
  }
}
