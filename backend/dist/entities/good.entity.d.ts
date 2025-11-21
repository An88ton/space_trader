import { PlanetMarket } from './planet-market.entity';
import { PlayerInventory } from './player-inventory.entity';
import { EventMarketEffect } from './event-market-effect.entity';
export declare class Good {
    id: number;
    name: string;
    basePrice: number;
    type: string;
    marketEntries?: PlanetMarket[];
    inventories?: PlayerInventory[];
    eventEffects?: EventMarketEffect[];
}
