import { IsInt, IsPositive } from 'class-validator';

export class SellShipDto {
  @IsInt()
  @IsPositive()
  userShipId: number;
}

