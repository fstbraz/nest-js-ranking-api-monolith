import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ParametersValidationPipe } from './../common/pipes/parameters-validation.pipe';
import { CreatePlayerDto } from './dtos/create-player.dto';
import { UpdatePlayerDto } from './dtos/update-player.dto';
import { Player } from './interfaces/player.interface';
import { PlayersService } from './players.service';

@Controller('api/v1/players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createPlayer(
    @Body() createPlayerDto: CreatePlayerDto,
  ): Promise<Player> {
    return await this.playersService.createPlayer(createPlayerDto);
  }

  @Put('/:_id')
  @UsePipes(ValidationPipe)
  async updatePlayer(
    @Body() updatePlayerDto: UpdatePlayerDto,
    @Param('_id', ParametersValidationPipe) _id: string,
  ): Promise<void> {
    await this.playersService.updatePlayer(updatePlayerDto, _id);
  }

  @Get()
  async listAllPlayers(): Promise<Player[]> {
    return this.playersService.listAllPlayers();
  }

  @Get('/:_id')
  async listPlayerById(
    @Param('_id', ParametersValidationPipe) _id: string,
  ): Promise<Player> {
    return await this.playersService.listPlayerById(_id);
  }

  @Delete('/:_id')
  async deletePlayer(
    @Param('_id', ParametersValidationPipe) _id: string,
  ): Promise<void> {
    this.playersService.deletePlayer(_id);
  }
}
