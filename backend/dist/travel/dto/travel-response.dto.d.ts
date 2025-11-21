import { LoggedInUserDto } from '../../auth/dto/logged-in-user.dto';
export declare class TravelLogDto {
    id: number;
    distance: number;
    fuelUsed: number;
    travelTurn: number;
    completedAt: Date;
    originPlanetId: number | null;
    originPlanetName: string | null;
    destinationPlanetId: number;
    destinationPlanetName: string;
}
export declare class TravelEventDto {
    id: number;
    name: string;
    description: string | null;
    eventType: string;
    eventCategory: string;
    reputationChange: number;
}
export declare class TravelEventResultDto {
    event: TravelEventDto | null;
    fuelModifier: number;
    cargoLost: number;
    creditsLost: number;
    reputationChange: number;
    description: string;
    requiresChoice?: boolean;
    choices?: Array<{
        id: number;
        label: string;
        description: string | null;
    }>;
    travelLogId?: number;
}
export declare class TravelResponseDto {
    success: boolean;
    message: string;
    travelLog: TravelLogDto;
    user: LoggedInUserDto;
    event?: TravelEventResultDto | null;
}
