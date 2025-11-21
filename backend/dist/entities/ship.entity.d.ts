import { PlayerInventory } from './player-inventory.entity';
import { TravelLog } from './travel-log.entity';
import { UserShip } from './user-ship.entity';
export declare class Ship {
    id: number;
    name: string;
    level: number;
    price: number;
    cargoCapacity: number;
    fuelCapacity: number;
    fuelCurrent: number;
    speed: number;
    acquiredAt: Date;
    inventories?: PlayerInventory[];
    travelLogs?: TravelLog[];
    userShips?: UserShip[];
}
