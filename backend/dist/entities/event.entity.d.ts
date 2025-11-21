import { EventMarketEffect } from './event-market-effect.entity';
import { EventLog } from './event-log.entity';
import { TravelLog } from './travel-log.entity';
export declare class Event {
    id: number;
    name: string;
    description?: string | null;
    probability: number;
    reputationChange: number;
    marketEffects?: EventMarketEffect[];
    eventLogs?: EventLog[];
    travelLogs?: TravelLog[];
}
