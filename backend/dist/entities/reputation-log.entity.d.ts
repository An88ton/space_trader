import { User } from './user.entity';
export declare class ReputationLog {
    id: number;
    user?: User | null;
    delta: number;
    reason?: string | null;
    createdAt: Date;
}
