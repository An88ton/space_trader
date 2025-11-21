export class ShipSnapshotDto {
  id: number;
  name: string;
  level: number;
  price: number;
  cargoCapacity: number;
  fuelCapacity: number;
  fuelCurrent: number;
  speed: number;
  acquiredAt: Date;
}

export class FuelStatsDto {
  current: number | null;
  capacity: number | null;
  percentage: number | null;
}

export class PlayerStatsDto {
  credits: number;
  reputation: number;
  cargoCapacity: number | null;
  fuel: FuelStatsDto;
}

export class HexCoordinateDto {
  q: number;
  r: number;
}

export class ShipPositionDto {
  planetId: number;
  planetName: string;
  hex: HexCoordinateDto | null;
}

export class LoggedInUserDto {
  id: number;
  email: string;
  username: string;
  rank: string;
  reputation: number;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
  ship: ShipSnapshotDto | null;
  stats: PlayerStatsDto;
  position: ShipPositionDto | null;
}
