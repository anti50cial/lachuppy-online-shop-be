import { Injectable } from '@nestjs/common';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtPayload } from 'src/app.models';

@Injectable()
export class DishesService {
  constructor(private prisma: PrismaService) {}
  async create(
    files: Express.Multer.File[],
    createDishDto: CreateDishDto,
    user: JwtPayload,
  ) {
    const imgs: { location: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      imgs.push({ location: file.filename });
    }
    const dish = await this.prisma.dish.create({
      data: {
        imgs: {
          createMany: { data: imgs },
        },
        name: createDishDto.name,
        price: createDishDto.price,
        description: createDishDto.description,
        creatorId: user.sub,
      },
      select: { name: true },
    });
    return { message: `New dish '${dish.name}' created` };
  }

  async findAll() {
    const dishes = await this.prisma.dish.findMany({
      where: { dropped: false },
      omit: { dropped: true },
      include: {
        imgs: { select: { location: true } },
      },
    });
    return { data: { dishes } };
  }

  async count() {
    const totalDishCount = await this.prisma.dish.count({
      where: { dropped: false },
    });
    const availableDishCount = await this.prisma.dish.count({
      where: { available: true, dropped: false },
    });
    return { data: { totalDishCount, availableDishCount } };
  }

  findOne(id: number) {
    return `This action returns a #${id} dish`;
  }

  update(id: number, updateDishDto: UpdateDishDto) {
    return `This action updates a #${id} dish`;
  }

  remove(id: number) {
    return `This action removes a #${id} dish`;
  }
}
