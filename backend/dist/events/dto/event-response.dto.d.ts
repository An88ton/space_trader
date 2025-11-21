export interface EventResponseDto {
    id: number;
    name: string;
    description: string | null;
    eventType: string;
    eventCategory: string;
    reputationChange: number;
    occurredAt: Date;
    requiresChoice?: boolean;
    choices?: Array<{
        id: number;
        label: string;
        description: string | null;
    }>;
}
export interface TravelEventResponseDto {
    event: EventResponseDto | null;
    fuelModifier: number;
    cargoLost: number;
    creditsLost: number;
    reputationChange: number;
    description: string;
    requiresChoice?: boolean;
}
