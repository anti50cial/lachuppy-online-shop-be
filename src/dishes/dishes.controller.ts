import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { DishesService } from './dishes.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { AuthRequest } from 'src/app.models';
import { SuspensionAccessGuard } from 'src/guards/suspension-access/suspension-access.guard';
import { PermissionsGuard } from 'src/guards/permissions/permissions.guard';
import { PERMISSIONS } from 'src/auth/permissions';
import { HasPermission } from 'src/decorators/has-permission/has-permission.decorator';

@Controller('dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @UseGuards(JwtGuard, SuspensionAccessGuard, PermissionsGuard)
  @HasPermission(PERMISSIONS.CREATE_DISHES)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      fileFilter: (req, file, cb) => {
        if (
          [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'image/gif',
            'image/webp',
          ].includes(file.mimetype.toLowerCase())
        ) {
          return cb(null, true);
        } else {
          return cb(
            new BadRequestException('Filetype is not acceptable'),
            false,
          );
        }
      },
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return callback(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @Post('add')
  create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createDishDto: CreateDishDto,
    @Req() req: AuthRequest,
  ) {
    return this.dishesService.create(files, createDishDto, req.user);
  }

  @Get()
  findAll() {
    return this.dishesService.findAll();
  }

  @UseGuards(JwtGuard, SuspensionAccessGuard)
  @Get('all')
  adminFindAll() {
    return this.dishesService.findAll(true);
  }

  @UseGuards(JwtGuard, SuspensionAccessGuard)
  @Get('count')
  count() {
    return this.dishesService.count();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dishesService.findOne(id);
  }

  @UseGuards(JwtGuard, SuspensionAccessGuard)
  @Get(':id/admin')
  adminFindOne(@Param('id') id: string) {
    return this.dishesService.findOne(id, true);
  }

  @UseGuards(JwtGuard, SuspensionAccessGuard, PermissionsGuard)
  @HasPermission(PERMISSIONS.UPDATE_DISHES)
  @Post('delete-img')
  deleteImg(@Body() data: { id: string }) {
    return this.dishesService.deleteImg(data.id);
  }

  @UseGuards(JwtGuard, SuspensionAccessGuard, PermissionsGuard)
  @HasPermission(PERMISSIONS.UPDATE_DISHES)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      fileFilter: (req, file, cb) => {
        if (
          [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'image/gif',
            'image/webp',
          ].includes(file.mimetype.toLowerCase())
        ) {
          return cb(null, true);
        } else {
          return cb(
            new BadRequestException('Filetype is not acceptable'),
            false,
          );
        }
      },
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return callback(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @Patch(':id')
  update(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() updateDishDto: UpdateDishDto,
  ) {
    return this.dishesService.update(id, files, updateDishDto);
  }

  @UseGuards(JwtGuard, SuspensionAccessGuard, PermissionsGuard)
  @HasPermission(PERMISSIONS.DROP_DISHES)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dishesService.remove(id);
  }
}
