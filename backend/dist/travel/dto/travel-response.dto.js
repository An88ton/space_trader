"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TravelResponseDto = exports.TravelEventResultDto = exports.TravelEventDto = exports.TravelLogDto = void 0;
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
class TravelEventDto {
    id;
    name;
    description;
    eventType;
    eventCategory;
    reputationChange;
}
exports.TravelEventDto = TravelEventDto;
class TravelEventResultDto {
    event;
    fuelModifier;
    cargoLost;
    creditsLost;
    reputationChange;
    description;
    requiresChoice;
    choices;
    travelLogId;
}
exports.TravelEventResultDto = TravelEventResultDto;
class TravelResponseDto {
    success;
    message;
    travelLog;
    user;
    event;
}
exports.TravelResponseDto = TravelResponseDto;
//# sourceMappingURL=travel-response.dto.js.map