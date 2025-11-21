import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Event, EventType, EventCategory } from '../entities/event.entity';
import { EventLog } from '../entities/event-log.entity';
import { ActiveEvent } from '../entities/active-event.entity';
import { User } from '../entities/user.entity';
import { Ship } from '../entities/ship.entity';
import { Planet } from '../entities/planet.entity';
import { PlayerInventory } from '../entities/player-inventory.entity';
import { ReputationLog } from '../entities/reputation-log.entity';
import { TravelLog } from '../entities/travel-log.entity';
import { EventMarketEffect } from '../entities/event-market-effect.entity';
import { EventChoice } from '../entities/event-choice.entity';
import { Good } from '../entities/good.entity';
import { calculateRank } from '../utils/rank-utils';

export interface TravelEventResult {
  event: Event | null;
  fuelModifier: number;
  cargoLost: number;
  creditsLost: number;
  reputationChange: number;
  description: string;
  requiresChoice?: boolean;
}

export interface MarketEventResult {
  event: Event | null;
  description: string;
}

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(EventLog)
    private readonly eventLogRepository: Repository<EventLog>,
    @InjectRepository(ActiveEvent)
    private readonly activeEventRepository: Repository<ActiveEvent>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ReputationLog)
    private readonly reputationLogRepository: Repository<ReputationLog>,
    @InjectRepository(Good)
    private readonly goodRepository: Repository<Good>,
    @InjectRepository(EventChoice)
    private readonly eventChoiceRepository: Repository<EventChoice>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Generates a deterministic random number based on seed values
   */
  private deterministicRandom(
    seed1: number,
    seed2: number,
    seed3?: number,
  ): number {
    // Use a simple hash-based PRNG for deterministic randomness
    const hash = ((seed1 * 73856093) ^ (seed2 * 19349663)) % 2147483647;
    const finalHash = seed3 !== undefined ? (hash ^ (seed3 * 83492791)) % 2147483647 : hash;
    return Math.abs(finalHash % 10000) / 10000;
  }

  /**
   * Gets all travel events
   */
  async getTravelEvents(): Promise<Event[]> {
    return this.eventRepository.find({
      where: { eventType: 'travel' },
    });
  }

  /**
   * Generates a travel event based on deterministic seed
   */
  async generateTravelEvent(
    user: User,
    ship: Ship,
    originPlanet: Planet,
    destinationPlanet: Planet,
    travelTurn: number,
    manager?: EntityManager,
  ): Promise<TravelEventResult> {
    const eventRepo = manager
      ? manager.getRepository(Event)
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

    // Deterministic seed: user id, travel turn, origin planet, destination planet
    const seed1 = user.id;
    const seed2 = travelTurn;
    const seed3 = originPlanet.id;
    const seed4 = destinationPlanet.id;
    const random = this.deterministicRandom(
      seed1 + seed2,
      seed3 + seed4,
      ship.id,
    );

    // 90% chance that an event occurs
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

    // Normalize random value for event selection (0 to EVENT_OCCURRENCE_PROBABILITY range)
    const eventSelectionRandom = random / EVENT_OCCURRENCE_PROBABILITY;

    // Calculate cumulative probabilities
    const totalProbability = events.reduce(
      (sum, event) => sum + event.probability,
      0,
    );

    let cumulative = 0;
    let selectedEvent: Event | null = null;
    const threshold = eventSelectionRandom * totalProbability;

    for (const event of events) {
      cumulative += event.probability;
      if (threshold < cumulative) {
        selectedEvent = event;
        break;
      }
    }

    // If no event selected, use first event (fallback)
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

    // If event requires a choice, return it without applying effects
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

    // Apply event effects based on category
    return this.applyTravelEvent(selectedEvent, user, ship, manager, travelTurn);
  }

  /**
   * Applies a travel event's effects
   */
  private async applyTravelEvent(
    event: Event,
    user: User,
    ship: Ship,
    manager?: EntityManager,
    travelTurn?: number,
  ): Promise<TravelEventResult> {
    let fuelModifier = 1.0;
    let cargoLost = 0;
    let creditsLost = 0;
    let reputationChange = event.reputationChange || 0;

    const inventoryRepo = manager
      ? manager.getRepository(PlayerInventory)
      : this.dataSource.getRepository(PlayerInventory);

    const userRepo = manager
      ? manager.getRepository(User)
      : this.userRepository;

    const shipRepo = manager
      ? manager.getRepository(Ship)
      : this.dataSource.getRepository(Ship);

    switch (event.eventCategory) {
      case 'pirate_ambush': {
        // Random outcome: cargo loss, ship damage (fuel), or bribe
        const seed = travelTurn !== undefined ? travelTurn : user.id + ship.id;
        const outcome = this.deterministicRandom(user.id, ship.id, seed);
        if (outcome < 0.4) {
          // 40% chance: cargo loss
          const inventories = await inventoryRepo.find({
            where: { ship: { id: ship.id } },
            relations: ['good'],
          });
          const totalCargo = inventories.reduce((sum, inv) => sum + inv.quantity, 0);
          cargoLost = Math.floor(totalCargo * (event.cargoLossPercentage || 0.3));
          
          // Remove random cargo
          let remainingToRemove = cargoLost;
          for (const inv of inventories) {
            if (remainingToRemove <= 0) break;
            const removeAmount = Math.min(inv.quantity, remainingToRemove);
            inv.quantity -= removeAmount;
            remainingToRemove -= removeAmount;
            if (inv.quantity <= 0) {
              await inventoryRepo.remove(inv);
            } else {
              await inventoryRepo.save(inv);
            }
          }
        } else if (outcome < 0.7) {
          // 30% chance: fuel damage
          fuelModifier = event.fuelPenaltyMultiplier || 1.5;
          const fuelToDeduct = Math.floor(ship.fuelCurrent * 0.2);
          ship.fuelCurrent = Math.max(0, ship.fuelCurrent - fuelToDeduct);
          await shipRepo.save(ship);
        } else {
          // 30% chance: forced bribe
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
        const leakPercentage = event.cargoLossPercentage || 0.15; // Reusing cargoLossPercentage as fuel loss
        const fuelLost = Math.floor(ship.fuelCurrent * leakPercentage);
        ship.fuelCurrent = Math.max(0, ship.fuelCurrent - fuelLost);
        await shipRepo.save(ship);
        break;
      }

      case 'safe_passage': {
        // No penalties, just positive reputation
        reputationChange = event.reputationChange || 5;
        break;
      }

      case 'meteor_shower': {
        // Random cargo destroyed
        const inventories = await inventoryRepo.find({
          where: { ship: { id: ship.id } },
          relations: ['good'],
        });
        if (inventories.length > 0) {
          const randomInv = inventories[
            Math.floor(
              this.deterministicRandom(user.id, ship.id) * inventories.length,
            )
          ];
          if (randomInv) {
            const destroyAmount = Math.min(
              randomInv.quantity,
              Math.floor(randomInv.quantity * 0.2),
            );
            cargoLost = destroyAmount;
            randomInv.quantity -= destroyAmount;
            if (randomInv.quantity <= 0) {
              await inventoryRepo.remove(randomInv);
            } else {
              await inventoryRepo.save(randomInv);
            }
          }
        }
        break;
      }

      case 'space_patrol': {
        // Reputation boost
        reputationChange = event.reputationChange || 10;
        break;
      }
    }

    // Apply reputation change
    if (reputationChange !== 0 && manager) {
      await this.applyReputationChange(
        user,
        reputationChange,
        `Event: ${event.name}`,
        manager,
      );
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

  /**
   * Applies the consequences of a player's choice for an event
   */
  async applyEventChoice(
    eventId: number,
    choiceId: number,
    user: User,
    ship: Ship,
    travelLogId: number | null,
    manager?: EntityManager,
  ): Promise<TravelEventResult> {
    const eventRepo = manager
      ? manager.getRepository(Event)
      : this.eventRepository;
    const choiceRepo = manager
      ? manager.getRepository(EventChoice)
      : this.eventChoiceRepository;
    const userRepo = manager
      ? manager.getRepository(User)
      : this.userRepository;
    const shipRepo = manager
      ? manager.getRepository(Ship)
      : this.dataSource.getRepository(Ship);
    const inventoryRepo = manager
      ? manager.getRepository(PlayerInventory)
      : this.dataSource.getRepository(PlayerInventory);

    const event = await eventRepo.findOne({
      where: { id: eventId },
      relations: ['choices'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const choice = await choiceRepo.findOne({
      where: { id: choiceId, event: { id: eventId } },
    });

    if (!choice) {
      throw new NotFoundException('Invalid choice for this event');
    }

    const outcome = choice.outcome;
    let fuelModifier = 1.0;
    let cargoLost = 0;
    let creditsLost = 0;
    let reputationChange = outcome.reputationChange || 0;

    // Apply outcome effects
    if (outcome.cargoLoss !== undefined) {
      cargoLost = outcome.cargoLoss;
      const inventories = await inventoryRepo.find({
        where: { ship: { id: ship.id } },
        relations: ['good'],
      });
      let remainingToRemove = cargoLost;
      for (const inv of inventories) {
        if (remainingToRemove <= 0) break;
        const removeAmount = Math.min(inv.quantity, remainingToRemove);
        inv.quantity -= removeAmount;
        remainingToRemove -= removeAmount;
        if (inv.quantity <= 0) {
          await inventoryRepo.remove(inv);
        } else {
          await inventoryRepo.save(inv);
        }
      }
    } else if (outcome.cargoLossPercentage !== undefined) {
      const inventories = await inventoryRepo.find({
        where: { ship: { id: ship.id } },
        relations: ['good'],
      });
      const totalCargo = inventories.reduce((sum, inv) => sum + inv.quantity, 0);
      cargoLost = Math.floor(totalCargo * outcome.cargoLossPercentage);
      let remainingToRemove = cargoLost;
      for (const inv of inventories) {
        if (remainingToRemove <= 0) break;
        const removeAmount = Math.min(inv.quantity, remainingToRemove);
        inv.quantity -= removeAmount;
        remainingToRemove -= removeAmount;
        if (inv.quantity <= 0) {
          await inventoryRepo.remove(inv);
        } else {
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
    } else if (fuelModifier !== 1.0) {
      // Apply fuel modifier if specified
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
      creditsLost = -outcome.creditsReward; // Negative means reward
    }

    if (reputationChange !== 0 && manager) {
      await this.applyReputationChange(
        user,
        reputationChange,
        `Event Choice: ${event.name} - ${choice.label}`,
        manager,
      );
    }

    // Log the event with the choice
    // Note: We use the default manager context for logging
    if (!manager) {
      await this.logEvent(
        event,
        user,
        travelLogId
          ? await this.dataSource.getRepository(TravelLog).findOne({
              where: { id: travelLogId },
            })
          : null,
        {
          event,
          fuelModifier,
          cargoLost,
          creditsLost,
          reputationChange,
          description: outcome.description,
          requiresChoice: false,
        },
      );
    } else if (travelLogId) {
      const travelLogRepo = manager.getRepository(TravelLog);
      const travelLog = await travelLogRepo.findOne({
        where: { id: travelLogId },
        relations: ['event'],
      });
      if (travelLog) {
        await this.logEvent(
          event,
          user,
          travelLog,
          {
            event,
            fuelModifier,
            cargoLost,
            creditsLost,
            reputationChange,
            description: outcome.description,
            requiresChoice: false,
          },
          manager,
        );
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

  /**
   * Creates or activates a market/planetary event
   */
  async activateMarketEvent(
    event: Event,
    planet: Planet | null,
    currentTurn: number,
    durationTurns: number,
    manager?: EntityManager,
  ): Promise<ActiveEvent> {
    const activeEventRepo = manager
      ? manager.getRepository(ActiveEvent)
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

  /**
   * Gets all active market events for a planet
   */
  async getActiveMarketEvents(
    planetId: number | null,
    currentTurn: number,
  ): Promise<ActiveEvent[]> {
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
      queryBuilder.andWhere(
        '(planet IS NULL OR planet.id = :planetId)',
        { planetId },
      );
    }

    return queryBuilder.getMany();
  }

  /**
   * Generates a market event (to be called at turn boundaries)
   */
  async generateMarketEvent(
    planet: Planet | null,
    currentTurn: number,
    manager?: EntityManager,
  ): Promise<MarketEventResult | null> {
    const eventRepo = manager
      ? manager.getRepository(Event)
      : this.eventRepository;

    const events = await eventRepo.find({
      where: { eventType: 'market' },
    });

    if (events.length === 0) {
      return null;
    }

    // Deterministic seed: planet id, turn
    const seed1 = planet?.id || 0;
    const seed2 = currentTurn;
    const random = this.deterministicRandom(seed1, seed2);

    // 90% chance that a market event occurs
    const EVENT_OCCURRENCE_PROBABILITY = 0.9;
    if (random >= EVENT_OCCURRENCE_PROBABILITY) {
      return null;
    }

    // Normalize random value for event selection
    const eventSelectionRandom = random / EVENT_OCCURRENCE_PROBABILITY;

    const totalProbability = events.reduce(
      (sum, event) => sum + event.probability,
      0,
    );

    let cumulative = 0;
    let selectedEvent: Event | null = null;
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

    // Activate the event (default 5 turns duration)
    const duration = selectedEvent.marketEffects?.[0]?.durationTurns || 5;
    await this.activateMarketEvent(selectedEvent, planet, currentTurn, duration, manager);

    return {
      event: selectedEvent,
      description: selectedEvent.description || selectedEvent.name,
    };
  }

  /**
   * Applies market event effects to prices
   */
  async getMarketPriceModifier(
    planetId: number,
    goodType: string,
    currentTurn: number,
  ): Promise<number> {
    const activeEvents = await this.activeEventRepository
      .createQueryBuilder('activeEvent')
      .innerJoinAndSelect('activeEvent.event', 'event')
      .innerJoinAndSelect('event.marketEffects', 'marketEffect')
      .leftJoinAndSelect('marketEffect.planet', 'effectPlanet')
      .leftJoinAndSelect('marketEffect.good', 'good')
      .leftJoinAndSelect('activeEvent.planet', 'planet')
      .where('activeEvent.isActive = :isActive', { isActive: true })
      .andWhere('activeEvent.expiresAtTurn >= :turn', { turn: currentTurn })
      .andWhere(
        '(planet IS NULL OR planet.id = :planetId)',
        { planetId },
      )
      .getMany();

    let modifier = 1.0;
    for (const activeEvent of activeEvents) {
      for (const effect of activeEvent.event.marketEffects || []) {
        // Check if effect applies to this planet (null = global, or matches planet)
        const planetMatches =
          !effect.planet || effect.planet.id === planetId;
        // Check if effect applies to this good type (null = all goods, or matches type)
        const goodMatches = !effect.good || effect.good.type === goodType;

        if (planetMatches && goodMatches) {
          modifier *= effect.priceModifier;
        }
      }
    }

    return modifier;
  }

  /**
   * Generates a player status event
   */
  async generatePlayerStatusEvent(
    user: User,
    currentTurn: number,
    manager?: EntityManager,
  ): Promise<Event | null> {
    const eventRepo = manager
      ? manager.getRepository(Event)
      : this.eventRepository;

    const events = await eventRepo.find({
      where: { eventType: 'player_status' },
    });

    if (events.length === 0) {
      return null;
    }

    // 90% chance that a player status event occurs
    const EVENT_OCCURRENCE_PROBABILITY = 0.9;
    const random = this.deterministicRandom(user.id, currentTurn);
    if (random >= EVENT_OCCURRENCE_PROBABILITY) {
      return null;
    }

    // Normalize random value for event selection
    const eventSelectionRandom = random / EVENT_OCCURRENCE_PROBABILITY;

    const totalProbability = events.reduce(
      (sum, event) => sum + event.probability,
      0,
    );

    let cumulative = 0;
    let selectedEvent: Event | null = null;
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

    // Apply player status event effects
    await this.applyPlayerStatusEvent(selectedEvent, user, manager);

    return selectedEvent;
  }

  /**
   * Applies a player status event's effects
   */
  private async applyPlayerStatusEvent(
    event: Event,
    user: User,
    manager: EntityManager,
  ): Promise<void> {
    const userRepo = manager.getRepository(User);

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
      await this.applyReputationChange(
        user,
        event.reputationChange,
        `Event: ${event.name}`,
        manager,
      );
    }
  }

  /**
   * Logs an event occurrence
   */
  async logEvent(
    event: Event | null,
    user: User,
    travelLog: TravelLog | null,
    eventResult: TravelEventResult | null,
    manager?: EntityManager,
  ): Promise<EventLog> {
    const eventLogRepo = manager
      ? manager.getRepository(EventLog)
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
      fuelDelta: null, // Will be applied to ship directly
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

  /**
   * Applies reputation change and logs it
   */
  private async applyReputationChange(
    user: User,
    delta: number,
    reason: string,
    manager: EntityManager,
  ): Promise<void> {
    const userRepo = manager.getRepository(User);
    const reputationLogRepo = manager.getRepository(ReputationLog);

    user.reputation += delta;
    // Update rank based on new reputation
    user.rank = calculateRank(user.reputation);
    await userRepo.save(user);

    const reputationLog = reputationLogRepo.create({
      user,
      delta,
      reason,
    });

    await reputationLogRepo.save(reputationLog);
  }

  /**
   * Expires old active events (call at turn boundaries)
   */
  async expireActiveEvents(currentTurn: number, manager?: EntityManager): Promise<void> {
    const activeEventRepo = manager
      ? manager.getRepository(ActiveEvent)
      : this.activeEventRepository;

    await activeEventRepo
      .createQueryBuilder()
      .update(ActiveEvent)
      .set({ isActive: false })
      .where('isActive = :isActive', { isActive: true })
      .andWhere('expiresAtTurn < :turn', { turn: currentTurn })
      .execute();
  }
}
