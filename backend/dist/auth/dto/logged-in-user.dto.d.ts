export declare class ShipSnapshotDto {
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
export declare class FuelStatsDto {
    current: number | null;
    capacity: number | null;
    percentage: number | null;
}
export declare class CargoItemDto {
    goodId: number;
    goodName: string;
    quantity: number;
}
export declare class PlayerStatsDto {
    credits: number;
    reputation: number;
    cargoCapacity: number | null;
    cargoUsed: number;
    cargoItems: CargoItemDto[];
    fuel: FuelStatsDto;
}
export declare class HexCoordinateDto {
    q: number;
    r: number;
}
export declare class ShipPositionDto {
    planetId: number;
    planetName: string;
    hex: HexCoordinateDto | null;
}
export declare class LoggedInUserDto {
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
