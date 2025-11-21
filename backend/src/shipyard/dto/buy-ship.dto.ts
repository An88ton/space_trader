import { IsInt, IsPositive } from 'class-validator';

export class BuyShipDto {
  @IsInt()
  @IsPositive()
  shipId: number;

  @IsInt()
  @IsPositive()
  planetId: number;
}

