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
exports.EventService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_entity_1 = require("../entities/event.entity");
const event_log_entity_1 = require("../entities/event-log.entity");
const active_event_entity_1 = require("../entities/active-event.entity");
const user_entity_1 = require("../entities/user.entity");
const ship_entity_1 = require("../entities/ship.entity");
const player_inventory_entity_1 = require("../entities/player-inventory.entity");
const reputation_log_entity_1 = require("../entities/reputation-log.entity");
const travel_log_entity_1 = require("../entities/travel-log.entity");
const event_choice_entity_1 = require("../entities/event-choice.entity");
const good_entity_1 = require("../entities/good.entity");
let EventService = class EventService {
    eventRepository;
    eventLogRepository;
    activeEventRepository;
    userRepository;
    reputationLogRepository;
    goodRepository;
    eventChoiceRepository;
    dataSource;
    constructor(eventRepository, eventLogRepository, activeEventRepository, userRepository, reputationLogRepository, goodRepository, eventChoiceRepository, dataSource) {
        this.eventRepository = eventRepository;
        this.eventLogRepository = eventLogRepository;
        this.activeEventRepository = activeEventRepository;
        this.userRepository = userRepository;
        this.reputationLogRepository = reputationLogRepository;
        this.goodRepository = goodRepository;
        this.eventChoiceRepository = eventChoiceRepository;
        this.dataSource = dataSource;
    }
    deterministicRandom(seed1, seed2, seed3) {
        const hash = ((seed1 * 73856093) ^ (seed2 * 19349663)) % 2147483647;
        const finalHash = seed3 !== undefined ? (hash ^ (seed3 * 83492791)) % 2147483647 : hash;
        return Math.abs(finalHash % 10000) / 10000;
    }
    async getTravelEvents() {
        return this.eventRepository.find({
            where: { eventType: 'travel' },
        });
    }
    async generateTravelEvent(user, ship, originPlanet, destinationPlanet, travelTurn, manager) {
        const eventRepo = manager
            ? manager.getRepository(event_entity_1.Event)
            : this.eventRepository;
        const events = await eventRepo.find({
            where: { eventType: 'travel' },
            relations: ['choices'],
            order: { id: 'ASC' },
        });
        if (events.length === 0) {
            return {
                event: null,
                fuelModifier: 1.0,
                cargoLost: 0,
                creditsLost: 0,
                reputationChange: 0,
                description: 'Uneventful journey through space.',
            };
        }
        const seed1 = user.id;
        const seed2 = travelTurn;
        const seed3 = originPlanet.id;
        const seed4 = destinationPlanet.id;
        const random = this.deterministicRandom(seed1 + seed2, seed3 + seed4, ship.id);
        const EVENT_OCCURRENCE_PROBABILITY = 0.9;
        if (random >= EVENT_OCCURRENCE_PROBABILITY) {
            return {
                event: null,
                fuelModifier: 1.0,
                cargoLost: 0,
                creditsLost: 0,
                reputationChange: 0,
                description: 'Uneventful journey through space.',
            };
        }
        const eventSelectionRandom = random / EVENT_OCCURRENCE_PROBABILITY;
        const totalProbability = events.reduce((sum, event) => sum + event.probability, 0);
        let cumulative = 0;
        let selectedEvent = null;
        const threshold = eventSelectionRandom * totalProbability;
        for (const event of events) {
            cumulative += event.probability;
            if (threshold < cumulative) {
                selectedEvent = event;
                break;
            }
        }
        if (!selectedEvent) {
            selectedEvent = events[0];
        }
        if (!selectedEvent) {
            return {
                event: null,
                fuelModifier: 1.0,
                cargoLost: 0,
                creditsLost: 0,
                reputationChange: 0,
                description: 'Uneventful journey through space.',
            };
        }
        if (selectedEvent.requiresChoice && selectedEvent.choices && selectedEvent.choices.length > 0) {
            return {
                event: selectedEvent,
                fuelModifier: 1.0,
                cargoLost: 0,
                creditsLost: 0,
                reputationChange: 0,
                description: selectedEvent.description || selectedEvent.name,
                requiresChoice: true,
            };
        }
        return this.applyTravelEvent(selectedEvent, user, ship, manager, travelTurn);
    }
    async applyTravelEvent(event, user, ship, manager, travelTurn) {
        let fuelModifier = 1.0;
        let cargoLost = 0;
        let creditsLost = 0;
        let reputationChange = event.reputationChange || 0;
        const inventoryRepo = manager
            ? manager.getRepository(player_inventory_entity_1.PlayerInventory)
            : this.dataSource.getRepository(player_inventory_entity_1.PlayerInventory);
        const userRepo = manager
            ? manager.getRepository(user_entity_1.User)
            : this.userRepository;
        const shipRepo = manager
            ? manager.getRepository(ship_entity_1.Ship)
            : this.dataSource.getRepository(ship_entity_1.Ship);
        switch (event.eventCategory) {
            case 'pirate_ambush': {
                const seed = travelTurn !== undefined ? travelTurn : user.id + ship.id;
                const outcome = this.deterministicRandom(user.id, ship.id, seed);
                if (outcome < 0.4) {
                    const inventories = await inventoryRepo.find({
                        where: { ship: { id: ship.id } },
                        relations: ['good'],
                    });
                    const totalCargo = inventories.reduce((sum, inv) => sum + inv.quantity, 0);
                    cargoLost = Math.floor(totalCargo * (event.cargoLossPercentage || 0.3));
                    let remainingToRemove = cargoLost;
                    for (const inv of inventories) {
                        if (remainingToRemove <= 0)
                            break;
                        const removeAmount = Math.min(inv.quantity, remainingToRemove);
                        inv.quantity -= removeAmount;
                        remainingToRemove -= removeAmount;
                        if (inv.quantity <= 0) {
                            await inventoryRepo.remove(inv);
                        }
                        else {
                            await inventoryRepo.save(inv);
                        }
                    }
                }
                else if (outcome < 0.7) {
                    fuelModifier = event.fuelPenaltyMultiplier || 1.5;
                    const fuelToDeduct = Math.floor(ship.fuelCurrent * 0.2);
                    ship.fuelCurrent = Math.max(0, ship.fuelCurrent - fuelToDeduct);
                    await shipRepo.save(ship);
                }
                else {
                    creditsLost = event.creditCost || Math.floor(user.credits * 0.1);
                    creditsLost = Math.min(creditsLost, user.credits);
                    user.credits -= creditsLost;
                    await userRepo.save(user);
                }
                break;
            }
            case 'engine_failure': {
                fuelModifier = event.fuelPenaltyMultiplier || 1.5;
                break;
            }
            case 'fuel_leak': {
                const leakPercentage = event.cargoLossPercentage || 0.15;
                const fuelLost = Math.floor(ship.fuelCurrent * leakPercentage);
                ship.fuelCurrent = Math.max(0, ship.fuelCurrent - fuelLost);
                await shipRepo.save(ship);
                break;
            }
            case 'safe_passage': {
                reputationChange = event.reputationChange || 5;
                break;
            }
            case 'meteor_shower': {
                const inventories = await inventoryRepo.find({
                    where: { ship: { id: ship.id } },
                    relations: ['good'],
                });
                if (inventories.length > 0) {
                    const randomInv = inventories[Math.floor(this.deterministicRandom(user.id, ship.id) * inventories.length)];
                    if (randomInv) {
                        const destroyAmount = Math.min(randomInv.quantity, Math.floor(randomInv.quantity * 0.2));
                        cargoLost = destroyAmount;
                        randomInv.quantity -= destroyAmount;
                        if (randomInv.quantity <= 0) {
                            await inventoryRepo.remove(randomInv);
                        }
                        else {
                            await inventoryRepo.save(randomInv);
                        }
                    }
                }
                break;
            }
            case 'space_patrol': {
                reputationChange = event.reputationChange || 10;
                break;
            }
        }
        if (reputationChange !== 0 && manager) {
            await this.applyReputationChange(user, reputationChange, `Event: ${event.name}`, manager);
        }
        return {
            event,
            fuelModifier,
            cargoLost,
            creditsLost,
            reputationChange,
            description: event.description || event.name,
            requiresChoice: false,
        };
    }
    async applyEventChoice(eventId, choiceId, user, ship, travelLogId, manager) {
        const eventRepo = manager
            ? manager.getRepository(event_entity_1.Event)
            : this.eventRepository;
        const choiceRepo = manager
            ? manager.getRepository(event_choice_entity_1.EventChoice)
            : this.eventChoiceRepository;
        const userRepo = manager
            ? manager.getRepository(user_entity_1.User)
            : this.userRepository;
        const shipRepo = manager
            ? manager.getRepository(ship_entity_1.Ship)
            : this.dataSource.getRepository(ship_entity_1.Ship);
        const inventoryRepo = manager
            ? manager.getRepository(player_inventory_entity_1.PlayerInventory)
            : this.dataSource.getRepository(player_inventory_entity_1.PlayerInventory);
        const event = await eventRepo.findOne({
            where: { id: eventId },
            relations: ['choices'],
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        const choice = await choiceRepo.findOne({
            where: { id: choiceId, event: { id: eventId } },
        });
        if (!choice) {
            throw new common_1.NotFoundException('Invalid choice for this event');
        }
        const outcome = choice.outcome;
        let fuelModifier = 1.0;
        let cargoLost = 0;
        let creditsLost = 0;
        let reputationChange = outcome.reputationChange || 0;
        if (outcome.cargoLoss !== undefined) {
            cargoLost = outcome.cargoLoss;
            const inventories = await inventoryRepo.find({
                where: { ship: { id: ship.id } },
                relations: ['good'],
            });
            let remainingToRemove = cargoLost;
            for (const inv of inventories) {
                if (remainingToRemove <= 0)
                    break;
                const removeAmount = Math.min(inv.quantity, remainingToRemove);
                inv.quantity -= removeAmount;
                remainingToRemove -= removeAmount;
                if (inv.quantity <= 0) {
                    await inventoryRepo.remove(inv);
                }
                else {
                    await inventoryRepo.save(inv);
                }
            }
        }
        else if (outcome.cargoLossPercentage !== undefined) {
            const inventories = await inventoryRepo.find({
                where: { ship: { id: ship.id } },
                relations: ['good'],
            });
            const totalCargo = inventories.reduce((sum, inv) => sum + inv.quantity, 0);
            cargoLost = Math.floor(totalCargo * outcome.cargoLossPercentage);
            let remainingToRemove = cargoLost;
            for (const inv of inventories) {
                if (remainingToRemove <= 0)
                    break;
                const removeAmount = Math.min(inv.quantity, remainingToRemove);
                inv.quantity -= removeAmount;
                remainingToRemove -= removeAmount;
                if (inv.quantity <= 0) {
                    await inventoryRepo.remove(inv);
                }
                else {
                    await inventoryRepo.save(inv);
                }
            }
        }
        if (outcome.fuelModifier !== undefined) {
            fuelModifier = outcome.fuelModifier;
        }
        if (outcome.fuelLoss !== undefined) {
            ship.fuelCurrent = Math.max(0, ship.fuelCurrent - outcome.fuelLoss);
            await shipRepo.save(ship);
        }
        else if (fuelModifier !== 1.0) {
            const currentFuel = ship.fuelCurrent;
            const fuelLoss = Math.floor(currentFuel * (fuelModifier - 1.0));
            ship.fuelCurrent = Math.max(0, ship.fuelCurrent - fuelLoss);
            await shipRepo.save(ship);
        }
        if (outcome.creditsCost !== undefined) {
            creditsLost = Math.min(outcome.creditsCost, user.credits);
            user.credits -= creditsLost;
            await userRepo.save(user);
        }
        if (outcome.creditsReward !== undefined) {
            user.credits += outcome.creditsReward;
            await userRepo.save(user);
            creditsLost = -outcome.creditsReward;
        }
        if (reputationChange !== 0 && manager) {
            await this.applyReputationChange(user, reputationChange, `Event Choice: ${event.name} - ${choice.label}`, manager);
        }
        if (!manager) {
            await this.logEvent(event, user, travelLogId
                ? await this.dataSource.getRepository(travel_log_entity_1.TravelLog).findOne({
                    where: { id: travelLogId },
                })
                : null, {
                event,
                fuelModifier,
                cargoLost,
                creditsLost,
                reputationChange,
                description: outcome.description,
                requiresChoice: false,
            });
        }
        else if (travelLogId) {
            const travelLogRepo = manager.getRepository(travel_log_entity_1.TravelLog);
            const travelLog = await travelLogRepo.findOne({
                where: { id: travelLogId },
                relations: ['event'],
            });
            if (travelLog) {
                await this.logEvent(event, user, travelLog, {
                    event,
                    fuelModifier,
                    cargoLost,
                    creditsLost,
                    reputationChange,
                    description: outcome.description,
                    requiresChoice: false,
                }, manager);
            }
        }
        return {
            event,
            fuelModifier,
            cargoLost,
            creditsLost,
            reputationChange,
            description: outcome.description,
            requiresChoice: false,
        };
    }
    async activateMarketEvent(event, planet, currentTurn, durationTurns, manager) {
        const activeEventRepo = manager
            ? manager.getRepository(active_event_entity_1.ActiveEvent)
            : this.activeEventRepository;
        const activeEvent = activeEventRepo.create({
            event,
            planet,
            startedAtTurn: currentTurn,
            expiresAtTurn: currentTurn + durationTurns,
            isActive: true,
        });
        return activeEventRepo.save(activeEvent);
    }
    async getActiveMarketEvents(planetId, currentTurn) {
        const queryBuilder = this.activeEventRepository
            .createQueryBuilder('activeEvent')
            .innerJoinAndSelect('activeEvent.event', 'event')
            .leftJoinAndSelect('event.marketEffects', 'marketEffect')
            .leftJoinAndSelect('marketEffect.planet', 'effectPlanet')
            .leftJoinAndSelect('marketEffect.good', 'good')
            .leftJoinAndSelect('activeEvent.planet', 'planet')
            .where('activeEvent.isActive = :isActive', { isActive: true })
            .andWhere('activeEvent.expiresAtTurn >= :turn', { turn: currentTurn });
        if (planetId !== null) {
            queryBuilder.andWhere('(activeEvent.planet IS NULL OR activeEvent.planet.id = :planetId)', { planetId });
        }
        return queryBuilder.getMany();
    }
    async generateMarketEvent(planet, currentTurn, manager) {
        const eventRepo = manager
            ? manager.getRepository(event_entity_1.Event)
            : this.eventRepository;
        const events = await eventRepo.find({
            where: { eventType: 'market' },
        });
        if (events.length === 0) {
            return null;
        }
        const seed1 = planet?.id || 0;
        const seed2 = currentTurn;
        const random = this.deterministicRandom(seed1, seed2);
        const EVENT_OCCURRENCE_PROBABILITY = 0.9;
        if (random >= EVENT_OCCURRENCE_PROBABILITY) {
            return null;
        }
        const eventSelectionRandom = random / EVENT_OCCURRENCE_PROBABILITY;
        const totalProbability = events.reduce((sum, event) => sum + event.probability, 0);
        let cumulative = 0;
        let selectedEvent = null;
        const threshold = eventSelectionRandom * totalProbability;
        for (const event of events) {
            cumulative += event.probability;
            if (threshold < cumulative) {
                selectedEvent = event;
                break;
            }
        }
        if (!selectedEvent) {
            return null;
        }
        const duration = selectedEvent.marketEffects?.[0]?.durationTurns || 5;
        await this.activateMarketEvent(selectedEvent, planet, currentTurn, duration, manager);
        return {
            event: selectedEvent,
            description: selectedEvent.description || selectedEvent.name,
        };
    }
    async getMarketPriceModifier(planetId, goodType, currentTurn) {
        const activeEvents = await this.activeEventRepository
            .createQueryBuilder('activeEvent')
            .innerJoinAndSelect('activeEvent.event', 'event')
            .innerJoinAndSelect('event.marketEffects', 'marketEffect')
            .leftJoinAndSelect('marketEffect.planet', 'effectPlanet')
            .leftJoinAndSelect('marketEffect.good', 'good')
            .leftJoinAndSelect('activeEvent.planet', 'planet')
            .where('activeEvent.isActive = :isActive', { isActive: true })
            .andWhere('activeEvent.expiresAtTurn >= :turn', { turn: currentTurn })
            .andWhere('(activeEvent.planet IS NULL OR activeEvent.planet.id = :planetId)', { planetId })
            .getMany();
        let modifier = 1.0;
        for (const activeEvent of activeEvents) {
            for (const effect of activeEvent.event.marketEffects || []) {
                const planetMatches = !effect.planet || effect.planet.id === planetId;
                const goodMatches = !effect.good || effect.good.type === goodType;
                if (planetMatches && goodMatches) {
                    modifier *= effect.priceModifier;
                }
            }
        }
        return modifier;
    }
    async generatePlayerStatusEvent(user, currentTurn, manager) {
        const eventRepo = manager
            ? manager.getRepository(event_entity_1.Event)
            : this.eventRepository;
        const events = await eventRepo.find({
            where: { eventType: 'player_status' },
        });
        if (events.length === 0) {
            return null;
        }
        const EVENT_OCCURRENCE_PROBABILITY = 0.9;
        const random = this.deterministicRandom(user.id, currentTurn);
        if (random >= EVENT_OCCURRENCE_PROBABILITY) {
            return null;
        }
        const eventSelectionRandom = random / EVENT_OCCURRENCE_PROBABILITY;
        const totalProbability = events.reduce((sum, event) => sum + event.probability, 0);
        let cumulative = 0;
        let selectedEvent = null;
        const threshold = eventSelectionRandom * totalProbability;
        for (const event of events) {
            cumulative += event.probability;
            if (threshold < cumulative) {
                selectedEvent = event;
                break;
            }
        }
        if (!selectedEvent || !manager) {
            return selectedEvent;
        }
        await this.applyPlayerStatusEvent(selectedEvent, user, manager);
        return selectedEvent;
    }
    async applyPlayerStatusEvent(event, user, manager) {
        const userRepo = manager.getRepository(user_entity_1.User);
        if (event.creditReward) {
            user.credits += event.creditReward;
            await userRepo.save(user);
        }
        if (event.creditCost) {
            const cost = Math.min(event.creditCost, user.credits);
            user.credits -= cost;
            await userRepo.save(user);
        }
        if (event.reputationChange) {
            await this.applyReputationChange(user, event.reputationChange, `Event: ${event.name}`, manager);
        }
    }
    async logEvent(event, user, travelLog, eventResult, manager) {
        const eventLogRepo = manager
            ? manager.getRepository(event_log_entity_1.EventLog)
            : this.eventLogRepository;
        const eventLog = eventLogRepo.create({
            user,
            event: event || undefined,
            reputationDelta: eventResult?.reputationChange || event?.reputationChange || null,
            creditDelta: eventResult?.creditsLost
                ? -eventResult.creditsLost
                : event?.creditReward || event?.creditCost
                    ? (event.creditReward || 0) - (event.creditCost || 0)
                    : null,
            fuelDelta: null,
            cargoLost: eventResult?.cargoLost || null,
            eventData: eventResult
                ? {
                    fuelModifier: eventResult.fuelModifier,
                    cargoLost: eventResult.cargoLost,
                    creditsLost: eventResult.creditsLost,
                }
                : null,
            notes: eventResult?.description || event?.description || null,
        });
        return eventLogRepo.save(eventLog);
    }
    async applyReputationChange(user, delta, reason, manager) {
        const userRepo = manager.getRepository(user_entity_1.User);
        const reputationLogRepo = manager.getRepository(reputation_log_entity_1.ReputationLog);
        user.reputation += delta;
        await userRepo.save(user);
        const reputationLog = reputationLogRepo.create({
            user,
            delta,
            reason,
        });
        await reputationLogRepo.save(reputationLog);
    }
    async expireActiveEvents(currentTurn, manager) {
        const activeEventRepo = manager
            ? manager.getRepository(active_event_entity_1.ActiveEvent)
            : this.activeEventRepository;
        await activeEventRepo
            .createQueryBuilder()
            .update(active_event_entity_1.ActiveEvent)
            .set({ isActive: false })
            .where('isActive = :isActive', { isActive: true })
            .andWhere('expiresAtTurn < :turn', { turn: currentTurn })
            .execute();
    }
};
exports.EventService = EventService;
exports.EventService = EventService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __param(1, (0, typeorm_1.InjectRepository)(event_log_entity_1.EventLog)),
    __param(2, (0, typeorm_1.InjectRepository)(active_event_entity_1.ActiveEvent)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(4, (0, typeorm_1.InjectRepository)(reputation_log_entity_1.ReputationLog)),
    __param(5, (0, typeorm_1.InjectRepository)(good_entity_1.Good)),
    __param(6, (0, typeorm_1.InjectRepository)(event_choice_entity_1.EventChoice)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], EventService);
//# sourceMappingURL=event.service.js.map