import { IsOptional, IsInt, IsString, Min, Max } from 'class-validator';

export class UniverseGenerationDto {
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(50)
  hexRadius?: number;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(500)
  planetCount?: number;

  @IsOptional()
  @IsString()
  seed?: string;
}

