import { Planet } from './planet.entity';
export declare class Hex {
    id: number;
    q: number;
    r: number;
    hasPlanet: boolean;
    planets?: Planet[];
}
