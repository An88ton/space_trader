import { Repository, DataSource, EntityManager } from 'typeorm';
import { Event } from '../entities/event.entity';
import { EventLog } from '../entities/event-log.entity';
import { ActiveEvent } from '../entities/active-event.entity';
import { User } from '../entities/user.entity';
import { Ship } from '../entities/ship.entity';
import { Planet } from '../entities/planet.entity';
import { ReputationLog } from '../entities/reputation-log.entity';
import { TravelLog } from '../entities/travel-log.entity';
import { EventChoice } from '../entities/event-choice.entity';
import { Good } from '../entities/good.entity';
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
export declare class EventService {
    private readonly eventRepository;
    private readonly eventLogRepository;
    private readonly activeEventRepository;
    private readonly userRepository;
    private readonly reputationLogRepository;
    private readonly goodRepository;
    private readonly eventChoiceRepository;
    private readonly dataSource;
    constructor(eventRepository: Repository<Event>, eventLogRepository: Repository<EventLog>, activeEventRepository: Repository<ActiveEvent>, userRepository: Repository<User>, reputationLogRepository: Repository<ReputationLog>, goodRepository: Repository<Good>, eventChoiceRepository: Repository<EventChoice>, dataSource: DataSource);
    private deterministicRandom;
    getTravelEvents(): Promise<Event[]>;
    generateTravelEvent(user: User, ship: Ship, originPlanet: Planet, destinationPlanet: Planet, travelTurn: number, manager?: EntityManager): Promise<TravelEventResult>;
    private applyTravelEvent;
    applyEventChoice(eventId: number, choiceId: number, user: User, ship: Ship, travelLogId: number | null, manager?: EntityManager): Promise<TravelEventResult>;
    activateMarketEvent(event: Event, planet: Planet | null, currentTurn: number, durationTurns: number, manager?: EntityManager): Promise<ActiveEvent>;
    getActiveMarketEvents(planetId: number | null, currentTurn: number): Promise<ActiveEvent[]>;
    generateMarketEvent(planet: Planet | null, currentTurn: number, manager?: EntityManager): Promise<MarketEventResult | null>;
    getMarketPriceModifier(planetId: number, goodType: string, currentTurn: number): Promise<number>;
    generatePlayerStatusEvent(user: User, currentTurn: number, manager?: EntityManager): Promise<Event | null>;
    private applyPlayerStatusEvent;
    logEvent(event: Event | null, user: User, travelLog: TravelLog | null, eventResult: TravelEventResult | null, manager?: EntityManager): Promise<EventLog>;
    private applyReputationChange;
    expireActiveEvents(currentTurn: number, manager?: EntityManager): Promise<void>;
}
