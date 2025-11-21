import { Ship } from './ship.entity';
import { Planet } from './planet.entity';
import { Event } from './event.entity';
export declare class TravelLog {
    id: number;
    ship: Ship;
    originPlanet?: Planet | null;
    destinationPlanet?: Planet | null;
    distance: number;
    fuelUsed: number;
    travelTurn: number;
    event?: Event | null;
    completedAt: Date;
}
