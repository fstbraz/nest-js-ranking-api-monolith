import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlayersService } from './../players/players.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { Category } from './interfaces/category';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('Category') private readonly categoryModel: Model<Category>,
    private readonly playersService: PlayersService,
  ) {}

  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const { category } = createCategoryDto;

    const foundedCategory = await this.categoryModel
      .findOne({ category })
      .exec();

    if (foundedCategory) {
      throw new BadRequestException(`Category ${category} already exists`);
    }

    const createdCategory = new this.categoryModel(createCategoryDto);

    return await createdCategory.save();
  }

  async listAllCategories(): Promise<Array<Category>> {
    return await this.categoryModel.find().populate('players').exec();
  }

  async listCategoryById(category: string): Promise<Category> {
    const foundedCategory = await this.categoryModel
      .findOne({ category })
      .exec();

    if (!foundedCategory) {
      throw new NotFoundException(`Category ${category} doesn't exist`);
    }

    return foundedCategory;
  }

  async listCategoryFromPlayer(idPlayer: any): Promise<Category> {
    const players = await this.playersService.listAllPlayers();

    const playerFilter = players.filter((player) => player._id == idPlayer);

    if (playerFilter.length == 0) {
      throw new BadRequestException(`The id ${idPlayer} is not a player!`);
    }

    return await this.categoryModel
      .findOne()
      .where('jogadores')
      .in(idPlayer)
      .exec();
  }

  async updateCategory(
    updateCategoryDto: UpdateCategoryDto,
    category: string,
  ): Promise<void> {
    const foundedCategory = await this.categoryModel
      .findOne({ category })
      .exec();

    if (!foundedCategory) {
      throw new NotFoundException(`Category ${category} doesn't exist`);
    }

    await this.categoryModel
      .findOneAndUpdate({ category }, { $set: updateCategoryDto })
      .exec();
  }

  async assignCategoryToPlayer(params: string[]): Promise<void> {
    const category = params['category'];
    const idPlayer = params['idPlayer'];

    const foundedCategory = await this.categoryModel
      .findOne({ category })
      .exec();

    const alreadyAssignedPlayerToCategory = await this.categoryModel
      .find({ category })
      .where('players')
      .in(idPlayer)
      .exec();

    await this.playersService.listPlayerById(idPlayer);

    if (!foundedCategory) {
      throw new BadRequestException(`Category ${category} doesn't exist`);
    }

    if (alreadyAssignedPlayerToCategory.length > 0) {
      throw new BadRequestException(
        `Player ${idPlayer} already assigned to category ${category}`,
      );
    }

    foundedCategory.players.push(idPlayer);

    await this.categoryModel
      .findOneAndUpdate({ category }, { $set: foundedCategory })
      .exec();
  }
}
