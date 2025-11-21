import { Event } from './event.entity';
import { Planet } from './planet.entity';
export declare class ActiveEvent {
    id: number;
    event: Event;
    planet?: Planet | null;
    startedAtTurn: number;
    expiresAtTurn: number;
    isActive: boolean;
    createdAt: Date;
}
