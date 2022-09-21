import { Document } from 'mongoose';
import { Player } from './../../players/interfaces/player.interface';

export interface Category extends Document {
  readonly category: string;
  description: string;
  events: Array<CatEvent>;
  players: Array<Player>;
}

export interface CatEvent {
  name: string;
  operation: string;
  value: number;
}
