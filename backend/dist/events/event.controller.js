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
exports.EventController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_service_1 = require("./event.service");
const jwt_1 = require("@nestjs/jwt");
const user_entity_1 = require("../entities/user.entity");
const ship_entity_1 = require("../entities/ship.entity");
const user_ship_entity_1 = require("../entities/user-ship.entity");
const player_inventory_entity_1 = require("../entities/player-inventory.entity");
let EventController = class EventController {
    eventService;
    jwtService;
    userRepository;
    shipRepository;
    userShipRepository;
    inventoryRepository;
    constructor(eventService, jwtService, userRepository, shipRepository, userShipRepository, inventoryRepository) {
        this.eventService = eventService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.shipRepository = shipRepository;
        this.userShipRepository = userShipRepository;
        this.inventoryRepository = inventoryRepository;
    }
    async verifySessionToken(token) {
        try {
            return await this.jwtService.verifyAsync(token);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired session token');
        }
    }
    extractToken(authorization) {
        if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
            throw new common_1.UnauthorizedException('Missing session token');
        }
        const token = authorization.slice(7).trim();
        if (!token) {
            throw new common_1.UnauthorizedException('Missing session token');
        }
        return token;
    }
    async getTravelEvents(authorization) {
        const token = this.extractToken(authorization);
        await this.verifySessionToken(token);
        const events = await this.eventService.getTravelEvents();
        return events.map((event) => ({
            id: event.id,
            name: event.name,
            description: event.description || null,
            eventType: event.eventType,
            eventCategory: event.eventCategory,
            reputationChange: event.reputationChange,
            occurredAt: new Date(),
        }));
    }
    async getActiveEvents(authorization, planetId, turn) {
        const token = this.extractToken(authorization);
        await this.verifySessionToken(token);
        const currentTurn = turn ? parseInt(turn, 10) : 0;
        const planetIdNum = planetId ? parseInt(planetId, 10) : null;
        const activeEvents = await this.eventService.getActiveMarketEvents(planetIdNum, currentTurn);
        return activeEvents.map((activeEvent) => ({
            id: activeEvent.event.id,
            name: activeEvent.event.name,
            description: activeEvent.event.description || null,
            eventType: activeEvent.event.eventType,
            eventCategory: activeEvent.event.eventCategory,
            reputationChange: activeEvent.event.reputationChange,
            occurredAt: activeEvent.createdAt,
        }));
    }
    async submitEventChoice(authorization, choiceRequest) {
        const token = this.extractToken(authorization);
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
            throw new common_1.NotFoundException('User not found');
        }
        const userActiveAssignment = user.userShips?.find((us) => us.isActive && us.ship);
        if (!userActiveAssignment || !userActiveAssignment.ship) {
            throw new common_1.BadRequestException('No active ship found');
        }
        const ship = userActiveAssignment.ship;
        const result = await this.userRepository.manager.transaction(async (manager) => {
            return await this.eventService.applyEventChoice(choiceRequest.eventId, choiceRequest.choiceId, user, ship, choiceRequest.travelLogId || null, manager);
        });
        const updatedUser = await this.userRepository.findOne({
            where: { id: user.id },
            relations: {
                userShips: {
                    ship: {
                        inventories: {
                            good: true,
                        },
                    },
                    currentPlanet: true,
                },
            },
        });
        if (!updatedUser) {
            throw new common_1.NotFoundException('User not found after choice application');
        }
        const updatedActiveAssignment = updatedUser.userShips?.find((us) => us.isActive && us.ship);
        const activeShip = updatedActiveAssignment?.ship ?? null;
        let cargoUsed = 0;
        const cargoItems = [];
        if (activeShip) {
            const inventories = activeShip.inventories && Array.isArray(activeShip.inventories)
                ? activeShip.inventories
                : await this.inventoryRepository.find({
                    where: { ship: { id: activeShip.id } },
                    relations: ['good'],
                });
            cargoItems.push(...inventories
                .filter((inv) => inv.quantity > 0)
                .map((inv) => {
                cargoUsed += inv.quantity;
                return {
                    goodId: inv.good.id,
                    goodName: inv.good.name,
                    quantity: inv.quantity,
                };
            }));
        }
        const userDto = {
            id: updatedUser.id,
            email: updatedUser.email,
            username: updatedUser.username,
            rank: updatedUser.rank,
            reputation: updatedUser.reputation,
            credits: updatedUser.credits,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
            ship: activeShip
                ? {
                    id: activeShip.id,
                    name: activeShip.name,
                    level: activeShip.level,
                    price: activeShip.price,
                    cargoCapacity: activeShip.cargoCapacity,
                    fuelCapacity: activeShip.fuelCapacity,
                    fuelCurrent: activeShip.fuelCurrent,
                    speed: activeShip.speed,
                    acquiredAt: activeShip.acquiredAt,
                }
                : null,
            stats: {
                credits: updatedUser.credits,
                reputation: updatedUser.reputation,
                cargoCapacity: activeShip?.cargoCapacity ?? null,
                cargoUsed,
                cargoItems,
                fuel: activeShip
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
                    },
            },
            position: updatedActiveAssignment?.currentPlanet
                ? {
                    planetId: updatedActiveAssignment.currentPlanet.id,
                    planetName: updatedActiveAssignment.currentPlanet.name,
                    hex: typeof updatedActiveAssignment.currentPlanet.hexQ === 'number' &&
                        typeof updatedActiveAssignment.currentPlanet.hexR === 'number'
                        ? {
                            q: updatedActiveAssignment.currentPlanet.hexQ,
                            r: updatedActiveAssignment.currentPlanet.hexR,
                        }
                        : null,
                }
                : null,
        };
        return {
            success: true,
            message: result.description,
            eventResult: {
                fuelModifier: result.fuelModifier,
                cargoLost: result.cargoLost,
                creditsLost: result.creditsLost,
                reputationChange: result.reputationChange,
                description: result.description,
            },
            user: userDto,
        };
    }
};
exports.EventController = EventController;
__decorate([
    (0, common_1.Get)('travel'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "getTravelEvents", null);
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Query)('planetId')),
    __param(2, (0, common_1.Query)('turn')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "getActiveEvents", null);
__decorate([
    (0, common_1.Post)('choice'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "submitEventChoice", null);
exports.EventController = EventController = __decorate([
    (0, common_1.Controller)('events'),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(ship_entity_1.Ship)),
    __param(4, (0, typeorm_1.InjectRepository)(user_ship_entity_1.UserShip)),
    __param(5, (0, typeorm_1.InjectRepository)(player_inventory_entity_1.PlayerInventory)),
    __metadata("design:paramtypes", [event_service_1.EventService,
        jwt_1.JwtService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], EventController);
//# sourceMappingURL=event.controller.js.map