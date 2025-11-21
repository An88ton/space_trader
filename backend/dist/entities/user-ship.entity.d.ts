import { User } from './user.entity';
import { Ship } from './ship.entity';
import { Planet } from './planet.entity';
export declare class UserShip {
    id: number;
    user: User;
    ship: Ship;
    isActive: boolean;
    acquiredAt: Date;
    currentPlanet?: Planet | null;
}
