export class UserShipDto {
  id: number;
  ship: {
    id: number;
    name: string;
    level: number;
    price: number;
    cargoCapacity: number;
    fuelCapacity: number;
    fuelCurrent: number;
    speed: number;
    acquiredAt: Date;
  };
  isActive: boolean;
  acquiredAt: Date;
  currentPlanet: {
    id: number;
    name: string;
  } | null;
}

