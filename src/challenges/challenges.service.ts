import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoriesService } from './../categories/categories.service';
import { PlayersService } from './../players/players.service';
import { AssignChallengeToMatchDto } from './dtos/assign-challenge-to-match.dto';
import { CreateChallengeDto } from './dtos/create-challenge.dto';
import { UpdateChallengeDto } from './dtos/update-challenge.dto';
import { ChallengeStatus } from './interfaces/challenge-status.enum';
import { Challenge } from './interfaces/challenge.interface';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectModel('Challenge') private readonly challengeModel: Model<Challenge>,
    @InjectModel('Match') private readonly matchModel: Model<Challenge>,
    private readonly playersService: PlayersService,
    private readonly categoriesService: CategoriesService,
  ) {}

  private readonly logger = new Logger(ChallengesService.name);

  async createChallenge(
    createChallengeDto: CreateChallengeDto,
  ): Promise<Challenge> {
    const players = await this.playersService.listAllPlayers();

    // check if the players already exist
    createChallengeDto.players.map((playerDto) => {
      const playerFilter = players.filter(
        (player) => player._id == playerDto._id,
      );

      if (playerFilter.length == 0) {
        throw new BadRequestException(
          `The id ${playerDto._id} is not from a player`,
        );
      }
    });

    // check if the soliciator is part of the match
    const playerIsPartOfTheMatch = createChallengeDto.players.filter(
      (player) => player._id === createChallengeDto.solicitator,
    );

    if (playerIsPartOfTheMatch.length === 0) {
      throw new BadRequestException(
        `The solicitator should be part of the match`,
      );
    }

    // search the category with the id of the solicitator id
    const playerCategory = await this.categoriesService.listCategoryFromPlayer(
      createChallengeDto.solicitator,
    );

    if (!playerCategory) {
      throw new BadRequestException(
        `The solicitator needs to have a category assigned`,
      );
    }

    const challengeCreated = new this.challengeModel(createChallengeDto);
    challengeCreated.category = playerCategory.category;
    challengeCreated.dateHourRequest = new Date();

    // when a challenge is created the satus is pending
    challengeCreated.status = ChallengeStatus.PENDING;

    return await challengeCreated.save();
  }

  async listAllChallengesFromPlayer(_id: any): Promise<Array<Challenge>> {
    const players = await this.playersService.listAllPlayers();

    const playerFilter = players.filter((player) => player._id == _id);

    if (playerFilter.length == 0) {
      throw new BadRequestException(`The id ${_id} is not from a player!`);
    }

    return await this.challengeModel
      .find()
      .where('players')
      .in(_id)
      .populate('solicitator')
      .populate('players')
      .populate('match')
      .exec();
  }

  async listAllChallenges(): Promise<Array<Challenge>> {
    return await this.challengeModel
      .find()
      .populate('solicitator')
      .populate('players')
      .populate('match')
      .exec();
  }

  async updateChallenge(
    _id: string,
    updateChallengeDto: UpdateChallengeDto,
  ): Promise<void> {
    const foundedChallenge = await this.challengeModel.findById(_id).exec();

    if (!foundedChallenge) {
      throw new NotFoundException(`Challenge ${_id} not registered!`);
    }

    // updates the response date when the status is already filled
    if (updateChallengeDto.status) {
      foundedChallenge.dateHourResponse = new Date();
    }
    foundedChallenge.status = updateChallengeDto.status;
    foundedChallenge.dateHourChallenge = updateChallengeDto.dateHourChallenge;

    await this.challengeModel
      .findOneAndUpdate({ _id }, { $set: foundedChallenge })
      .exec();
  }

  async assignChallengeToMatch(
    _id: string,
    assignChallengeToMatchDto: AssignChallengeToMatchDto,
  ): Promise<void> {
    const foundedChallenge = await this.challengeModel.findById(_id).exec();

    if (!foundedChallenge) {
      throw new BadRequestException(`Challenge ${_id} not registered!`);
    }

    // Check if the winner is part of the challenge
    const playerFilter = foundedChallenge.players.filter(
      (player) => player._id == assignChallengeToMatchDto.def,
    );

    if (playerFilter.length == 0) {
      throw new BadRequestException(
        `The winner player is not part of the challenge!`,
      );
    }

    // persisiting match
    const createdMatch = new this.matchModel(assignChallengeToMatchDto);
    createdMatch.category = foundedChallenge.category;
    createdMatch.players = foundedChallenge.players;

    const result = await createdMatch.save();

    // changing status of the challenge
    foundedChallenge.status = ChallengeStatus.DONE;

    // get the id of the match and assign to the challenge
    foundedChallenge.match = result._id;

    try {
      await this.challengeModel
        .findOneAndUpdate({ _id }, { $set: foundedChallenge })
        .exec();
    } catch (error) {
      // if the update of the challenge fails we exclude the match
      await this.matchModel.deleteOne({ _id: result._id }).exec();
      throw new InternalServerErrorException();
    }
  }

  async deleteChallenge(_id: string): Promise<void> {
    const foundedChallenge = await this.challengeModel.findById(_id).exec();

    if (!foundedChallenge) {
      throw new BadRequestException(`Challenge ${_id} not registered!`);
    }

    foundedChallenge.status = ChallengeStatus.CANCELED;

    await this.challengeModel
      .findOneAndUpdate({ _id }, { $set: foundedChallenge })
      .exec();
  }
}
