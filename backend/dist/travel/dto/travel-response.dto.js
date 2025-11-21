"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TravelResponseDto = exports.TravelLogDto = void 0;
class TravelLogDto {
    id;
    distance;
    fuelUsed;
    travelTurn;
    completedAt;
    originPlanetId;
    originPlanetName;
    destinationPlanetId;
    destinationPlanetName;
}
exports.TravelLogDto = TravelLogDto;
class TravelResponseDto {
    success;
    message;
    travelLog;
    user;
}
exports.TravelResponseDto = TravelResponseDto;
//# sourceMappingURL=travel-response.dto.js.map