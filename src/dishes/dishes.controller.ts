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
} from '@nestjs/common';
import { DishesService } from './dishes.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { AuthRequest } from 'src/app.models';

@Controller('dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @UseGuards(JwtGuard)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      // limits: {fieldSize},
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

  @UseGuards(JwtGuard)
  @Get('count')
  count() {
    return this.dishesService.count();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dishesService.findOne(+id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDishDto: UpdateDishDto) {
    return this.dishesService.update(+id, updateDishDto);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dishesService.remove(+id);
  }
}
