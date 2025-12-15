import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtPayload } from 'src/app.models';
import { Decimal } from '@prisma/client/runtime/client';

@Injectable()
export class DishesService {
  constructor(private prisma: PrismaService) {}
  async create(
    files: Express.Multer.File[],
    createDishDto: CreateDishDto,
    user: JwtPayload,
  ) {
    // console.log(files);
    if (files.length == 0) {
      throw new BadRequestException('Each dish must have at least one image');
    }
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

  async findAll(admin?: boolean) {
    let dishes: ({ imgs: { location: string }[] } & {
      id: string;
      name: string;
      description: string;
      price: Decimal;
    })[];

    if (admin) {
      dishes = await this.prisma.dish.findMany({
        where: { dropped: false },
        omit: {
          dropped: true,
          creatorId: true,
          createdAt: true,
          updatedAt: true,
          available: true,
        },
        orderBy: { name: 'asc' },
        include: {
          imgs: {
            select: { location: true },
            where: { dropped: false },
            take: 1,
          },
        },
      });
    } else {
      dishes = await this.prisma.dish.findMany({
        where: { dropped: false, available: true },
        omit: {
          dropped: true,
          creatorId: true,
          createdAt: true,
          updatedAt: true,
          available: true,
        },
        orderBy: { name: 'asc' },
        include: {
          imgs: {
            select: { location: true },
            where: { dropped: false },
            take: 1,
          },
        },
      });
    }
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

  async findOne(id: string, admin?: boolean) {
    let dish:
      | ({
          imgs: {
            id: string;
            dropped: boolean;
            location: string;
            dishId: string;
          }[];
          creator: { name: string } | null;
        } & {
          id: string;
          name: string;
          description: string;
          price: Decimal;
          createdAt: Date;
          updatedAt: Date;
          available: boolean;
          dropped: boolean;
        })
      | null;
    if (admin) {
      dish = await this.prisma.dish.findUnique({
        where: { id, dropped: false },
        omit: { creatorId: true },
        include: {
          imgs: {
            omit: { dishId: true, dropped: true },
            where: { dropped: false },
          },
          creator: { select: { name: true } },
        },
      });
    } else {
      dish = await this.prisma.dish.findUnique({
        where: { id, dropped: false, available: true },
        omit: { creatorId: true },
        include: {
          imgs: {
            omit: { dishId: true, dropped: true },
            where: { dropped: false },
          },
          creator: { select: { name: true } },
        },
      });
    }
    if (dish) {
      return { data: { dish } };
    }
    throw new NotFoundException(
      'Dish has either been deleted or does not exist.',
    );
  }

  async deleteImg(id: string) {
    const img = await this.prisma.dishImage.findUnique({
      where: { id, dropped: false, dish: { dropped: false } },
    });
    if (!img) {
      throw new NotFoundException('Image not found');
    }
    const imgCount = await this.prisma.dishImage.count({
      where: { dishId: img.dishId, dropped: false },
    });

    if (imgCount <= 1) {
      throw new BadRequestException('Each dish must have at least one image.');
    }
    await this.prisma.dishImage.update({
      where: { id },
      data: { dropped: true },
    });
    return { message: 'Dish image deleted successfully.' };
  }

  async update(
    id: string,
    files: Express.Multer.File[],
    updateDishDto: UpdateDishDto,
  ) {
    const dish = await this.prisma.dish.findUnique({
      where: { id, dropped: false },
      include: { _count: { select: { imgs: { where: { dropped: false } } } } },
    });
    if (!dish) {
      throw new NotFoundException(
        'Dish has either been deleted or does not exist.',
      );
    }
    if (dish._count.imgs + files.length > 10) {
      throw new BadRequestException(
        'Each dish cannot have more than 10 images.',
      );
    }
    const imgs: { location: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      imgs.push({ location: file.filename });
    }
    await this.prisma.dish.update({
      where: { id },
      data: { imgs: { createMany: { data: imgs } }, ...updateDishDto },
    });
    return { message: 'Dish updated successfully.' };
  }

  async remove(id: string) {
    const dish = await this.prisma.dish.findUnique({
      where: { id, dropped: false },
    });
    if (!dish) {
      throw new NotFoundException(
        'Dish has either been deleted or does not exist.',
      );
    }
    await this.prisma.dish.update({ where: { id }, data: { dropped: true } });
    return { message: 'Dish deleted successfully.' };
  }
}
