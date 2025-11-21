import { EventMarketEffect } from './event-market-effect.entity';
import { EventLog } from './event-log.entity';
import { TravelLog } from './travel-log.entity';
import { ActiveEvent } from './active-event.entity';
import { EventChoice } from './event-choice.entity';
export type EventType = 'travel' | 'market' | 'player_status';
export type EventCategory = 'pirate_ambush' | 'engine_failure' | 'fuel_leak' | 'safe_passage' | 'meteor_shower' | 'space_patrol' | 'epidemic' | 'harvest_boom' | 'mining_rush' | 'planetary_famine' | 'trade_festival' | 'smuggling_crackdown' | 'black_market_offer' | 'investor_interest' | 'merchant_guild_reward' | 'insurance_payout';
export declare class Event {
    id: number;
    name: string;
    description?: string | null;
    eventType: EventType;
    eventCategory: EventCategory;
    probability: number;
    reputationChange: number;
    cargoLossPercentage?: number | null;
    fuelPenaltyMultiplier?: number | null;
    creditCost?: number | null;
    creditReward?: number | null;
    marketEffects?: EventMarketEffect[];
    eventLogs?: EventLog[];
    travelLogs?: TravelLog[];
    activeEvents?: ActiveEvent[];
    choices?: EventChoice[];
    requiresChoice: boolean;
}
