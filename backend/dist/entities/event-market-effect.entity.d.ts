import { Event } from './event.entity';
import { Planet } from './planet.entity';
import { Good } from './good.entity';
export declare class EventMarketEffect {
    id: number;
    event: Event;
    planet?: Planet | null;
    good?: Good | null;
    priceModifier: number;
    durationTurns: number;
}
