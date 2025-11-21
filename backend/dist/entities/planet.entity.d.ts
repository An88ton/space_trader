import { PlanetMarket } from './planet-market.entity';
import { EventMarketEffect } from './event-market-effect.entity';
import { TravelLog } from './travel-log.entity';
import { Hex } from './hex.entity';
import { UserShip } from './user-ship.entity';
export declare class Planet {
    id: number;
    name: string;
    coordinateX: number | null;
    coordinateY: number | null;
    hexQ: number | null;
    hexR: number | null;
    hex?: Hex | null;
    dockingFee: number;
    planetType: string;
    marketModifiers: Record<string, number> | null;
    resources: string[] | null;
    faction: string | null;
    securityLevel: string;
    eventWeights: Record<string, number> | null;
    marketEntries?: PlanetMarket[];
    marketEffects?: EventMarketEffect[];
    originTravelLogs?: TravelLog[];
    destinationTravelLogs?: TravelLog[];
    dockedShips?: UserShip[];
}
