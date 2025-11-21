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
exports.MarketService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const user_entity_1 = require("../entities/user.entity");
const ship_entity_1 = require("../entities/ship.entity");
const planet_entity_1 = require("../entities/planet.entity");
const good_entity_1 = require("../entities/good.entity");
const user_ship_entity_1 = require("../entities/user-ship.entity");
const player_inventory_entity_1 = require("../entities/player-inventory.entity");
const planet_market_entity_1 = require("../entities/planet-market.entity");
const reputation_log_entity_1 = require("../entities/reputation-log.entity");
const rank_utils_1 = require("../utils/rank-utils");
const market_logic_1 = require("../utils/market-logic");
const event_service_1 = require("../events/event.service");
let MarketService = class MarketService {
    userRepository;
    shipRepository;
    planetRepository;
    goodRepository;
    userShipRepository;
    inventoryRepository;
    planetMarketRepository;
    jwtService;
    dataSource;
    eventService;
    constructor(userRepository, shipRepository, planetRepository, goodRepository, userShipRepository, inventoryRepository, planetMarketRepository, jwtService, dataSource, eventService) {
        this.userRepository = userRepository;
        this.shipRepository = shipRepository;
        this.planetRepository = planetRepository;
        this.goodRepository = goodRepository;
        this.userShipRepository = userShipRepository;
        this.inventoryRepository = inventoryRepository;
        this.planetMarketRepository = planetMarketRepository;
        this.jwtService = jwtService;
        this.dataSource = dataSource;
        this.eventService = eventService;
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
    async buyGoods(token, buyGoodsDto) {
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
        const activeAssignment = this.resolveActiveAssignment(user);
        if (!activeAssignment || !activeAssignment.ship) {
            throw new common_1.BadRequestException('No active ship found');
        }
        const ship = activeAssignment.ship;
        const currentPlanet = activeAssignment.currentPlanet;
        if (!currentPlanet) {
            throw new common_1.BadRequestException('Ship is not currently at a planet');
        }
        if (currentPlanet.id !== buyGoodsDto.planetId) {
            throw new common_1.BadRequestException('You can only buy goods on the planet where you are located');
        }
        const planet = await this.planetRepository.findOne({
            where: { id: buyGoodsDto.planetId },
        });
        if (!planet) {
            throw new common_1.NotFoundException('Planet not found');
        }
        const good = await this.goodRepository.findOne({
            where: { id: buyGoodsDto.goodId },
        });
        if (!good) {
            throw new common_1.NotFoundException('Good not found');
        }
        if (!(0, market_logic_1.shouldPlanetSellGood)(planet, good)) {
            throw new common_1.BadRequestException('This good is not available for purchase on this planet');
        }
        let marketEntry = await this.planetMarketRepository.findOne({
            where: {
                planet: { id: buyGoodsDto.planetId },
                good: { id: buyGoodsDto.goodId },
                isSelling: true,
            },
            relations: ['planet', 'good'],
        });
        if (!marketEntry) {
            marketEntry = (0, market_logic_1.createMarketEntry)(planet, good, true);
            marketEntry = await this.planetMarketRepository.save(marketEntry);
        }
        const currentTurn = 0;
        const priceModifier = await this.eventService.getMarketPriceModifier(planet.id, good.type, currentTurn);
        const adjustedPrice = Math.round(marketEntry.price * priceModifier);
        const totalCost = adjustedPrice * buyGoodsDto.quantity;
        if (user.credits < totalCost) {
            throw new common_1.BadRequestException('Insufficient credits');
        }
        const currentCargoUsage = this.calculateCargoUsage(ship.inventories || []);
        const availableCargo = ship.cargoCapacity - currentCargoUsage;
        if (availableCargo < buyGoodsDto.quantity) {
            throw new common_1.BadRequestException(`Insufficient cargo capacity. Available: ${availableCargo}, Required: ${buyGoodsDto.quantity}`);
        }
        return await this.dataSource.transaction(async (manager) => {
            const userRepo = manager.getRepository(user_entity_1.User);
            const inventoryRepo = manager.getRepository(player_inventory_entity_1.PlayerInventory);
            await userRepo.update({ id: user.id }, { credits: user.credits - totalCost });
            let inventory = await inventoryRepo.findOne({
                where: {
                    ship: { id: ship.id },
                    good: { id: good.id },
                },
                relations: ['ship', 'good'],
            });
            if (inventory) {
                inventory.quantity += buyGoodsDto.quantity;
                await inventoryRepo.save(inventory);
            }
            else {
                inventory = inventoryRepo.create({
                    ship,
                    good,
                    quantity: buyGoodsDto.quantity,
                });
                await inventoryRepo.save(inventory);
            }
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
            return await this.buildLoggedInUserDto(updatedUser, manager);
        });
    }
    async sellGoods(token, sellGoodsDto) {
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
        const activeAssignment = this.resolveActiveAssignment(user);
        if (!activeAssignment || !activeAssignment.ship) {
            throw new common_1.BadRequestException('No active ship found');
        }
        const ship = activeAssignment.ship;
        const currentPlanet = activeAssignment.currentPlanet;
        if (!currentPlanet) {
            throw new common_1.BadRequestException('Ship is not currently at a planet');
        }
        if (currentPlanet.id !== sellGoodsDto.planetId) {
            throw new common_1.BadRequestException('You can only sell goods on the planet where you are located');
        }
        const planet = await this.planetRepository.findOne({
            where: { id: sellGoodsDto.planetId },
        });
        if (!planet) {
            throw new common_1.NotFoundException('Planet not found');
        }
        const good = await this.goodRepository.findOne({
            where: { id: sellGoodsDto.goodId },
        });
        if (!good) {
            throw new common_1.NotFoundException('Good not found');
        }
        if (!(0, market_logic_1.shouldPlanetBuyGood)(planet, good)) {
            throw new common_1.BadRequestException('This planet does not buy this type of good');
        }
        let marketEntry = await this.planetMarketRepository.findOne({
            where: {
                planet: { id: sellGoodsDto.planetId },
                good: { id: sellGoodsDto.goodId },
                isSelling: false,
            },
            relations: ['planet', 'good'],
        });
        if (!marketEntry) {
            marketEntry = (0, market_logic_1.createMarketEntry)(planet, good, false);
            marketEntry = await this.planetMarketRepository.save(marketEntry);
        }
        const currentTurn = 0;
        const priceModifier = await this.eventService.getMarketPriceModifier(planet.id, good.type, currentTurn);
        const adjustedPrice = Math.round(marketEntry.price * priceModifier);
        const totalCredits = adjustedPrice * sellGoodsDto.quantity;
        return await this.dataSource.transaction(async (manager) => {
            const userRepo = manager.getRepository(user_entity_1.User);
            const inventoryRepo = manager.getRepository(player_inventory_entity_1.PlayerInventory);
            const reputationLogRepo = manager.getRepository(reputation_log_entity_1.ReputationLog);
            const activeEvents = await this.eventService.getActiveMarketEvents(planet.id, currentTurn);
            const hasSmugglingCrackdown = activeEvents.some((ae) => ae.event.eventCategory === 'smuggling_crackdown' &&
                good.type === 'luxury');
            if (hasSmugglingCrackdown) {
                const newReputation = Math.max(0, user.reputation - 20);
                const newRank = (0, rank_utils_1.calculateRank)(newReputation);
                await userRepo.update({ id: user.id }, { reputation: newReputation, rank: newRank });
                user.reputation = newReputation;
                user.rank = newRank;
                const reputationLog = reputationLogRepo.create({
                    user,
                    delta: -20,
                    reason: 'Smuggling crackdown: Caught selling contraband',
                });
                await reputationLogRepo.save(reputationLog);
            }
            const inventory = await inventoryRepo.findOne({
                where: {
                    ship: { id: ship.id },
                    good: { id: good.id },
                },
                relations: ['ship', 'good'],
            });
            if (!inventory || inventory.quantity < sellGoodsDto.quantity) {
                throw new common_1.BadRequestException(`Insufficient inventory. Available: ${inventory?.quantity ?? 0}, Required: ${sellGoodsDto.quantity}`);
            }
            await userRepo.update({ id: user.id }, { credits: user.credits + totalCredits });
            inventory.quantity -= sellGoodsDto.quantity;
            if (inventory.quantity <= 0) {
                await inventoryRepo.remove(inventory);
            }
            else {
                await inventoryRepo.save(inventory);
            }
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
            return await this.buildLoggedInUserDto(updatedUser, manager);
        });
    }
    async getInventory(token) {
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
        const inventories = ship.inventories || [];
        const cargoUsage = this.calculateCargoUsage(inventories);
        const cargoCapacity = ship.cargoCapacity;
        return {
            inventory: inventories.map((inv) => ({
                good: {
                    id: inv.good.id,
                    name: inv.good.name,
                    type: inv.good.type,
                    basePrice: inv.good.basePrice,
                },
                quantity: inv.quantity,
            })),
            cargoUsage,
            cargoCapacity,
            availableCargo: cargoCapacity - cargoUsage,
        };
    }
    calculateCargoUsage(inventories) {
        return inventories.reduce((total, inv) => total + inv.quantity, 0);
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
    async buildLoggedInUserDto(user, manager) {
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
            inventories = activeShip.inventories || [];
            if (inventories.length > 0 && inventories[0].good === undefined) {
                if (manager) {
                    const inventoryRepo = manager.getRepository(player_inventory_entity_1.PlayerInventory);
                    inventories = await inventoryRepo.find({
                        where: { ship: { id: activeShip.id } },
                        relations: ['good'],
                    });
                }
                else {
                    inventories = await this.inventoryRepository.find({
                        where: { ship: { id: activeShip.id } },
                        relations: ['good'],
                    });
                }
            }
            else if (inventories.length === 0 && manager) {
                const inventoryRepo = manager.getRepository(player_inventory_entity_1.PlayerInventory);
                inventories = await inventoryRepo.find({
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
};
exports.MarketService = MarketService;
exports.MarketService = MarketService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(ship_entity_1.Ship)),
    __param(2, (0, typeorm_1.InjectRepository)(planet_entity_1.Planet)),
    __param(3, (0, typeorm_1.InjectRepository)(good_entity_1.Good)),
    __param(4, (0, typeorm_1.InjectRepository)(user_ship_entity_1.UserShip)),
    __param(5, (0, typeorm_1.InjectRepository)(player_inventory_entity_1.PlayerInventory)),
    __param(6, (0, typeorm_1.InjectRepository)(planet_market_entity_1.PlanetMarket)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        typeorm_2.DataSource,
        event_service_1.EventService])
], MarketService);
//# sourceMappingURL=market.service.js.map