"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggedInUserDto = exports.ShipPositionDto = exports.HexCoordinateDto = exports.PlayerStatsDto = exports.CargoItemDto = exports.FuelStatsDto = exports.ShipSnapshotDto = void 0;
class ShipSnapshotDto {
    id;
    name;
    level;
    price;
    cargoCapacity;
    fuelCapacity;
    fuelCurrent;
    speed;
    acquiredAt;
}
exports.ShipSnapshotDto = ShipSnapshotDto;
class FuelStatsDto {
    current;
    capacity;
    percentage;
}
exports.FuelStatsDto = FuelStatsDto;
class CargoItemDto {
    goodId;
    goodName;
    quantity;
}
exports.CargoItemDto = CargoItemDto;
class PlayerStatsDto {
    credits;
    reputation;
    rank;
    cargoCapacity;
    cargoUsed;
    cargoItems;
    fuel;
}
exports.PlayerStatsDto = PlayerStatsDto;
class HexCoordinateDto {
    q;
    r;
}
exports.HexCoordinateDto = HexCoordinateDto;
class ShipPositionDto {
    planetId;
    planetName;
    hex;
}
exports.ShipPositionDto = ShipPositionDto;
class LoggedInUserDto {
    id;
    email;
    username;
    rank;
    reputation;
    credits;
    createdAt;
    updatedAt;
    ship;
    stats;
    position;
}
exports.LoggedInUserDto = LoggedInUserDto;
//# sourceMappingURL=logged-in-user.dto.js.map