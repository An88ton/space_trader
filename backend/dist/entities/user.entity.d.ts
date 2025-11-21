import { EventLog } from './event-log.entity';
import { ReputationLog } from './reputation-log.entity';
import { UserShip } from './user-ship.entity';
export declare class User {
    id: number;
    email: string;
    passwordHash: string;
    username: string;
    reputation: number;
    rank: string;
    credits: number;
    sessionVersion: number;
    createdAt: Date;
    updatedAt: Date;
    userShips?: UserShip[];
    eventLogs?: EventLog[];
    reputationLogs?: ReputationLog[];
}
