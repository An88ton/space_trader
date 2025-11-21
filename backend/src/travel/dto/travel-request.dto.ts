import { IsInt, Min } from 'class-validator';

export class TravelRequestDto {
  @IsInt()
  @Min(1)
  destinationPlanetId: number;
}

