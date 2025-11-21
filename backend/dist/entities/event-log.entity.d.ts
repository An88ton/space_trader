import { User } from './user.entity';
import { Event } from './event.entity';
export declare class EventLog {
    id: number;
    user: User;
    event?: Event | null;
    occurredAt: Date;
    reputationDelta?: number | null;
    notes?: string | null;
}
