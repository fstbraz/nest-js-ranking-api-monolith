import { ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';
import { CatEvent } from '../interfaces/category';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  description: string;

  @IsArray()
  @ArrayMinSize(1)
  events: Array<CatEvent>;

  // @IsString()
  // @IsNotEmpty()
  // description: string;

  // @IsArray()
  // @ArrayMinSize(1)
  // events: Array<CatEvent>;
}
