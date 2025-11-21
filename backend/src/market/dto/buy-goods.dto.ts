import { IsInt, IsPositive, Min } from 'class-validator';

export class BuyGoodsDto {
  @IsInt()
  @IsPositive()
  goodId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsInt()
  @IsPositive()
  planetId: number;
}

