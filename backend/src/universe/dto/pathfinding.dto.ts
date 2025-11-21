import { IsInt, Min } from 'class-validator';

export class PathfindingDto {
  @IsInt()
  fromQ: number;

  @IsInt()
  fromR: number;

  @IsInt()
  toQ: number;

  @IsInt()
  toR: number;
}

