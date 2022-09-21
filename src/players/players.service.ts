import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePlayerDto } from './dtos/create-player.dto';
import { UpdatePlayerDto } from './dtos/update-player.dto';
import { Player } from './interfaces/player.interface';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel('Player') private readonly playerModel: Model<Player>,
  ) {}

  async createPlayer(createPlayerDto: CreatePlayerDto): Promise<Player> {
    const { email } = createPlayerDto;

    const playerExists = await this.playerModel.findOne({ email }).exec();

    if (playerExists) {
      throw new BadRequestException(
        `The player with ${email} is already registered`,
      );
    }

    const createdPlayer = new this.playerModel(createPlayerDto);

    return await createdPlayer.save();
  }

  async updatePlayer(
    updatePlayerDto: UpdatePlayerDto,
    _id: string,
  ): Promise<any> {
    const playerExists = await this.playerModel.findOne({ _id }).exec();

    if (!playerExists) {
      throw new NotFoundException(`The player with ${_id} was not found`);
    }

    await this.playerModel
      .findOneAndUpdate({ _id }, { $set: updatePlayerDto })
      .exec();
  }

  async listAllPlayers(): Promise<Player[]> {
    return await this.playerModel.find().exec();
  }

  async listPlayerById(_id: string): Promise<Player> {
    const playerExists = await this.playerModel.findOne({ _id }).exec();

    if (!playerExists) {
      throw new NotFoundException(`The player with ${_id} was not found`);
    }

    return playerExists;
  }

  async deletePlayer(_id: string): Promise<any> {
    const playerExists = await this.playerModel.findOne({ _id }).exec();

    if (!playerExists) {
      throw new NotFoundException(`The player with ${_id} was not found`);
    }

    return await this.playerModel.deleteOne({ _id }).exec();
  }
}
