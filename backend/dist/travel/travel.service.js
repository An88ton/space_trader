"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TravelService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const ship_entity_1 = require("../entities/ship.entity");
const planet_entity_1 = require("../entities/planet.entity");
const user_ship_entity_1 = require("../entities/user-ship.entity");
const travel_log_entity_1 = require("../entities/travel-log.entity");
const hex_coordinates_1 = require("../utils/hex-coordinates");
const jwt_1 = require("@nestjs/jwt");
let TravelService = class TravelService {
    userRepository;
    shipRepository;
    planetRepository;
    userShipRepository;
    travelLogRepository;
    jwtService;
    constructor(userRepository, shipRepository, planetRepository, userShipRepository, travelLogRepository, jwtService) {
        this.userRepository = userRepository;
        this.shipRepository = shipRepository;
        this.planetRepository = planetRepository;
        this.userShipRepository = userShipRepository;
        this.travelLogRepository = travelLogRepository;
        this.jwtService = jwtService;
    }
    async travel(token, travelRequest) {
        const payload = await this.verifySessionToken(token);
        const user = await this.userRepository.findOne({
            where: { id: payload.sub },
            relations: {
                userShips: {
                    ship: true,
                    currentPlanet: true,
                },
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        this.ensureSessionIsCurrent(user, payload);
        const activeAssignment = this.resolveActiveAssignment(user);
        if (!activeAssignment || !activeAssignment.ship) {
            throw new common_1.BadRequestException('No active ship found');
        }
        const ship = activeAssignment.ship;
        const currentPlanet = activeAssignment.currentPlanet;
        if (!currentPlanet) {
            throw new common_1.BadRequestException('Ship is not currently at a planet');
        }
        const destinationPlanet = await this.planetRepository.findOne({
            where: { id: travelRequest.destinationPlanetId },
        });
        if (!destinationPlanet) {
            throw new common_1.NotFoundException('Destination planet not found');
        }
        if (destinationPlanet.id === currentPlanet.id) {
            throw new common_1.BadRequestException('Already at destination planet');
        }
        if (currentPlanet.hexQ === null ||
            currentPlanet.hexR === null ||
            destinationPlanet.hexQ === null ||
            destinationPlanet.hexR === null) {
            throw new common_1.BadRequestException('Planets must have valid hex coordinates to travel');
        }
        const from = {
            q: currentPlanet.hexQ,
            r: currentPlanet.hexR,
        };
        const to = {
            q: destinationPlanet.hexQ,
            r: destinationPlanet.hexR,
        };
        const distance = (0, hex_coordinates_1.hexDistance)(from, to);
        const fuelRequired = distance;
        if (ship.fuelCurrent < fuelRequired) {
            throw new common_1.BadRequestException(`Insufficient fuel. Need ${fuelRequired}, have ${ship.fuelCurrent}`);
        }
        const dockingFee = destinationPlanet.dockingFee;
        if (user.credits < dockingFee) {
            throw new common_1.BadRequestException(`Insufficient credits for docking fee. Need ${dockingFee}, have ${user.credits}`);
        }
        return await this.userRepository.manager.transaction(async (manager) => {
            user.credits -= dockingFee;
            await manager.getRepository(user_entity_1.User).save(user);
            ship.fuelCurrent -= fuelRequired;
            await manager.getRepository(ship_entity_1.Ship).save(ship);
            activeAssignment.currentPlanet = destinationPlanet;
            await manager.getRepository(user_ship_entity_1.UserShip).save(activeAssignment);
            const travelLog = manager.getRepository(travel_log_entity_1.TravelLog).create({
                ship,
                originPlanet: currentPlanet,
                destinationPlanet,
                distance,
                fuelUsed: fuelRequired,
                travelTurn: 0,
            });
            const savedTravelLog = await manager
                .getRepository(travel_log_entity_1.TravelLog)
                .save(travelLog);
            const updatedUser = await manager.getRepository(user_entity_1.User).findOne({
                where: { id: user.id },
                relations: {
                    userShips: {
                        ship: true,
                        currentPlanet: true,
                    },
                },
            });
            if (!updatedUser) {
                throw new Error('Failed to reload user after travel');
            }
            const travelLogDto = {
                id: savedTravelLog.id,
                distance: savedTravelLog.distance,
                fuelUsed: savedTravelLog.fuelUsed,
                travelTurn: savedTravelLog.travelTurn,
                completedAt: savedTravelLog.completedAt,
                originPlanetId: currentPlanet.id,
                originPlanetName: currentPlanet.name,
                destinationPlanetId: destinationPlanet.id,
                destinationPlanetName: destinationPlanet.name,
            };
            const userDto = this.buildLoggedInUserDto(updatedUser);
            return {
                success: true,
                message: `Successfully traveled from ${currentPlanet.name} to ${destinationPlanet.name}. Docking fee: ${dockingFee} credits.`,
                travelLog: travelLogDto,
                user: userDto,
            };
        });
    }
    async verifySessionToken(token) {
        try {
            return await this.jwtService.verifyAsync(token);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired session token');
        }
    }
    ensureSessionIsCurrent(user, payload) {
        const tokenVersion = this.resolveTokenVersion(payload.ver);
        if (this.resolveTokenVersion(user.sessionVersion) !== tokenVersion) {
            throw new common_1.UnauthorizedException('Session is no longer valid');
        }
    }
    resolveTokenVersion(version) {
        return typeof version === 'number' &&
            Number.isFinite(version) &&
            version >= 0
            ? Math.floor(version)
            : 0;
    }
    resolveActiveAssignment(user) {
        const relations = user.userShips;
        const assignments = Array.isArray(relations)
            ? relations
            : [];
        const activeAssignment = assignments.find((userShip) => userShip.isActive && userShip.ship);
        return activeAssignment ?? null;
    }
    buildLoggedInUserDto(user) {
        const activeAssignment = this.resolveActiveAssignment(user);
        const activeShip = activeAssignment?.ship ?? null;
        let ship = null;
        if (activeShip) {
            const pricedShip = activeShip;
            const snapshot = {
                id: pricedShip.id,
                name: pricedShip.name,
                level: pricedShip.level,
                price: pricedShip.price,
                cargoCapacity: pricedShip.cargoCapacity,
                fuelCapacity: pricedShip.fuelCapacity,
                fuelCurrent: pricedShip.fuelCurrent,
                speed: pricedShip.speed,
                acquiredAt: pricedShip.acquiredAt,
            };
            ship = snapshot;
        }
        const fuelStats = activeShip
            ? {
                current: activeShip.fuelCurrent,
                capacity: activeShip.fuelCapacity,
                percentage: activeShip.fuelCapacity > 0
                    ? Math.round((activeShip.fuelCurrent / activeShip.fuelCapacity) * 100)
                    : 0,
            }
            : {
                current: null,
                capacity: null,
                percentage: null,
            };
        const stats = {
            credits: user.credits,
            reputation: user.reputation,
            cargoCapacity: activeShip?.cargoCapacity ?? null,
            fuel: fuelStats,
        };
        const planetCandidate = activeAssignment?.currentPlanet ?? null;
        const position = planetCandidate
            ? {
                planetId: planetCandidate.id,
                planetName: planetCandidate.name,
                hex: typeof planetCandidate.hexQ === 'number' &&
                    typeof planetCandidate.hexR === 'number'
                    ? {
                        q: planetCandidate.hexQ,
                        r: planetCandidate.hexR,
                    }
                    : null,
            }
            : null;
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            rank: user.rank,
            reputation: user.reputation,
            credits: user.credits,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            ship,
            stats,
            position,
        };
    }
};
exports.TravelService = TravelService;
exports.TravelService = TravelService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(ship_entity_1.Ship)),
    __param(2, (0, typeorm_1.InjectRepository)(planet_entity_1.Planet)),
    __param(3, (0, typeorm_1.InjectRepository)(user_ship_entity_1.UserShip)),
    __param(4, (0, typeorm_1.InjectRepository)(travel_log_entity_1.TravelLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], TravelService);
//# sourceMappingURL=travel.service.js.map