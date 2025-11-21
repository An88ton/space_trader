import { User } from './user.entity';
import { Event } from './event.entity';
export declare class EventLog {
    id: number;
    user: User;
    event?: Event | null;
    occurredAt: Date;
    reputationDelta?: number | null;
    creditDelta?: number | null;
    fuelDelta?: number | null;
    cargoLost?: number | null;
    eventData?: Record<string, any> | null;
    notes?: string | null;
}
