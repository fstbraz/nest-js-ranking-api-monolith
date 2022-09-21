import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { Category } from './interfaces/category';

@Controller('api/v1/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return await this.categoriesService.createCategory(createCategoryDto);
  }

  @Get()
  async listAllCategories(): Promise<Array<Category>> {
    return await this.categoriesService.listAllCategories();
  }

  @Get('/:category')
  async listCategoryById(
    @Param('category') category: string,
  ): Promise<Category> {
    return await this.categoriesService.listCategoryById(category);
  }

  @Put('/:category')
  @UsePipes(ValidationPipe)
  async updateCategory(
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Param('category') category: string,
  ): Promise<void> {
    await this.categoriesService.updateCategory(updateCategoryDto, category);
  }

  @Post('/:category/players/:idPlayer')
  async assignCategoryToPlayer(@Param() params: string[]): Promise<void> {
    return await this.categoriesService.assignCategoryToPlayer(params);
  }
}
