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
export declare class TravelResponseDto {
    success: boolean;
    message: string;
    travelLog: TravelLogDto;
    user: LoggedInUserDto;
}
