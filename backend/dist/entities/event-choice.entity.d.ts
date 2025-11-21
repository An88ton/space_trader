import { Event } from './event.entity';
export type ChoiceOutcome = {
    cargoLoss?: number;
    cargoLossPercentage?: number;
    fuelLoss?: number;
    fuelModifier?: number;
    creditsCost?: number;
    creditsReward?: number;
    reputationChange?: number;
    description: string;
};
export declare class EventChoice {
    id: number;
    event: Event;
    label: string;
    description?: string | null;
    outcome: ChoiceOutcome;
    sortOrder: number;
}
