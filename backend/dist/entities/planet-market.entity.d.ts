import { Planet } from './planet.entity';
import { Good } from './good.entity';
export declare class PlanetMarket {
    id: number;
    planet: Planet;
    good: Good;
    price: number;
    demandModifier: number;
    updatedAt: Date;
}
