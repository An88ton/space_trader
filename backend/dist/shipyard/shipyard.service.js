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
exports.ShipyardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const user_entity_1 = require("../entities/user.entity");
const ship_entity_1 = require("../entities/ship.entity");
const planet_entity_1 = require("../entities/planet.entity");
const user_ship_entity_1 = require("../entities/user-ship.entity");
const player_inventory_entity_1 = require("../entities/player-inventory.entity");
let ShipyardService = class ShipyardService {
    userRepository;
    shipRepository;
    planetRepository;
    userShipRepository;
    inventoryRepository;
    jwtService;
    dataSource;
    constructor(userRepository, shipRepository, planetRepository, userShipRepository, inventoryRepository, jwtService, dataSource) {
        this.userRepository = userRepository;
        this.shipRepository = shipRepository;
        this.planetRepository = planetRepository;
        this.userShipRepository = userShipRepository;
        this.inventoryRepository = inventoryRepository;
        this.jwtService = jwtService;
        this.dataSource = dataSource;
    }
    async verifySessionToken(token) {
        try {
            const payload = await this.jwtService.verifyAsync(token);
            return payload;
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired session token');
        }
    }
    async getAvailableShips() {
        const ships = await this.shipRepository.find({
            order: { level: 'ASC', price: 'ASC' },
        });
        return ships.map((ship) => ({
            id: ship.id,
            name: ship.name,
            level: ship.level,
            price: ship.price,
            cargoCapacity: ship.cargoCapacity,
            fuelCapacity: ship.fuelCapacity,
            speed: ship.speed,
        }));
    }
    async getUserShips(token) {
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
        const userShips = user.userShips || [];
        return userShips.map((userShip) => ({
            id: userShip.id,
            ship: {
                id: userShip.ship.id,
                name: userShip.ship.name,
                level: userShip.ship.level,
                price: userShip.ship.price,
                cargoCapacity: userShip.ship.cargoCapacity,
                fuelCapacity: userShip.ship.fuelCapacity,
                fuelCurrent: userShip.ship.fuelCurrent,
                speed: userShip.ship.speed,
                acquiredAt: userShip.ship.acquiredAt,
            },
            isActive: userShip.isActive,
            acquiredAt: userShip.acquiredAt,
            currentPlanet: userShip.currentPlanet
                ? {
                    id: userShip.currentPlanet.id,
                    name: userShip.currentPlanet.name,
                }
                : null,
        }));
    }
    async buyShip(token, buyShipDto) {
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
        const shipToBuy = await this.shipRepository.findOne({
            where: { id: buyShipDto.shipId },
        });
        if (!shipToBuy) {
            throw new common_1.NotFoundException('Ship not found');
        }
        if (user.credits < shipToBuy.price) {
            throw new common_1.BadRequestException(`Insufficient credits. Need ${shipToBuy.price}, have ${user.credits}`);
        }
        const activeAssignment = this.resolveActiveAssignment(user);
        let currentPlanet = null;
        if (activeAssignment?.currentPlanet) {
            currentPlanet = activeAssignment.currentPlanet;
        }
        else {
            currentPlanet = await this.planetRepository.findOne({
                where: { id: buyShipDto.planetId },
            });
            if (!currentPlanet) {
                throw new common_1.NotFoundException('Planet not found');
            }
        }
        if (activeAssignment && currentPlanet.id !== buyShipDto.planetId) {
            throw new common_1.BadRequestException('You can only buy ships at the planet where you are located');
        }
        const oldActiveShip = activeAssignment?.ship;
        if (oldActiveShip) {
            const inventories = await this.inventoryRepository.find({
                where: { ship: { id: oldActiveShip.id } },
                relations: ['good'],
            });
            const hasCargo = inventories.some((inv) => inv.quantity > 0);
            if (hasCargo) {
                throw new common_1.BadRequestException('Cannot buy a new ship while your current ship has cargo. Please unload all cargo first.');
            }
        }
        return await this.dataSource.transaction(async (manager) => {
            const userRepo = manager.getRepository(user_entity_1.User);
            const shipRepo = manager.getRepository(ship_entity_1.Ship);
            const userShipRepo = manager.getRepository(user_ship_entity_1.UserShip);
            const inventoryRepo = manager.getRepository(player_inventory_entity_1.PlayerInventory);
            if (activeAssignment) {
                await inventoryRepo.delete({
                    ship: { id: activeAssignment.ship.id },
                });
                await userShipRepo.remove(activeAssignment);
                await shipRepo.remove(activeAssignment.ship);
            }
            await userRepo.update({ id: user.id }, { credits: user.credits - shipToBuy.price });
            const newShip = shipRepo.create({
                name: shipToBuy.name,
                level: shipToBuy.level,
                price: shipToBuy.price,
                cargoCapacity: shipToBuy.cargoCapacity,
                fuelCapacity: shipToBuy.fuelCapacity,
                fuelCurrent: shipToBuy.fuelCapacity,
                speed: shipToBuy.speed,
            });
            const savedShip = await shipRepo.save(newShip);
            const userShip = userShipRepo.create({
                user,
                ship: savedShip,
                isActive: true,
                currentPlanet: currentPlanet,
            });
            await userShipRepo.save(userShip);
            const updatedUser = await userRepo.findOne({
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
                throw new common_1.NotFoundException('User not found after transaction');
            }
            return await this.buildLoggedInUserDto(updatedUser);
        });
    }
    async sellShip(token, sellShipDto) {
        const payload = await this.verifySessionToken(token);
        const user = await this.userRepository.findOne({
            where: { id: payload.sub },
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
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        this.ensureSessionIsCurrent(user, payload);
        const userShipToSell = await this.userShipRepository.findOne({
            where: {
                id: sellShipDto.userShipId,
                user: { id: user.id },
            },
            relations: {
                ship: {
                    inventories: {
                        good: true,
                    },
                },
                currentPlanet: true,
            },
        });
        if (!userShipToSell) {
            throw new common_1.NotFoundException('Ship not found or you do not own this ship');
        }
        if (userShipToSell.isActive) {
            throw new common_1.BadRequestException('Cannot sell your active ship. Please activate another ship first.');
        }
        const inventories = userShipToSell.ship.inventories || [];
        const hasCargo = inventories.some((inv) => inv.quantity > 0);
        if (hasCargo) {
            throw new common_1.BadRequestException('Cannot sell ship with cargo. Please unload all cargo first.');
        }
        const sellPrice = Math.floor(userShipToSell.ship.price * 0.5);
        return await this.dataSource.transaction(async (manager) => {
            const userRepo = manager.getRepository(user_entity_1.User);
            const userShipRepo = manager.getRepository(user_ship_entity_1.UserShip);
            const shipRepo = manager.getRepository(ship_entity_1.Ship);
            await userRepo.update({ id: user.id }, { credits: user.credits + sellPrice });
            await userShipRepo.remove(userShipToSell);
            await shipRepo.remove(userShipToSell.ship);
            const updatedUser = await userRepo.findOne({
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
                throw new common_1.NotFoundException('User not found after transaction');
            }
            return await this.buildLoggedInUserDto(updatedUser);
        });
    }
    async buildLoggedInUserDto(user) {
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
        let cargoUsed = 0;
        const cargoItems = [];
        if (activeShip) {
            let inventories = [];
            if (activeShip.inventories && Array.isArray(activeShip.inventories)) {
                inventories = activeShip.inventories;
            }
            else {
                inventories = await this.inventoryRepository.find({
                    where: { ship: { id: activeShip.id } },
                    relations: ['good'],
                });
            }
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
        const stats = {
            credits: user.credits,
            reputation: user.reputation,
            rank: user.rank,
            cargoCapacity: activeShip?.cargoCapacity ?? null,
            cargoUsed,
            cargoItems,
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
    resolveActiveAssignment(user) {
        const relations = user.userShips;
        const assignments = Array.isArray(relations)
            ? relations
            : [];
        const activeAssignment = assignments.find((userShip) => userShip.isActive && userShip.ship);
        return activeAssignment ?? null;
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
};
exports.ShipyardService = ShipyardService;
exports.ShipyardService = ShipyardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(ship_entity_1.Ship)),
    __param(2, (0, typeorm_1.InjectRepository)(planet_entity_1.Planet)),
    __param(3, (0, typeorm_1.InjectRepository)(user_ship_entity_1.UserShip)),
    __param(4, (0, typeorm_1.InjectRepository)(player_inventory_entity_1.PlayerInventory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        typeorm_2.DataSource])
], ShipyardService);
//# sourceMappingURL=shipyard.service.js.map