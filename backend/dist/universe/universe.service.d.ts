import { Repository } from 'typeorm';
import { Hex } from '../entities/hex.entity';
import { Planet } from '../entities/planet.entity';
import { PlanetMarket } from '../entities/planet-market.entity';
import { Good } from '../entities/good.entity';
export interface UniverseGenerationConfig {
    hexRadius?: number;
    planetCount?: number;
    seed?: string;
}
export declare class UniverseService {
    private hexRepository;
    private planetRepository;
    private planetMarketRepository;
    private goodRepository;
    constructor(hexRepository: Repository<Hex>, planetRepository: Repository<Planet>, planetMarketRepository: Repository<PlanetMarket>, goodRepository: Repository<Good>);
    generateUniverse(config?: UniverseGenerationConfig): Promise<{
        hexes: Hex[];
        planets: Planet[];
    }>;
    getAllHexes(): Promise<Hex[]>;
    getAllPlanets(): Promise<Planet[]>;
    getHexAt(q: number, r: number): Promise<Hex | null>;
    getPlanetAt(q: number, r: number): Promise<Planet | null>;
    getUniverseBounds(): Promise<{
        minQ: number;
        maxQ: number;
        minR: number;
        maxR: number;
    } | null>;
    isUniverseGenerated(): Promise<boolean>;
    clearUniverse(): Promise<void>;
    getPlanetMarketPrices(q: number, r: number): Promise<{
        planet: {
            id: number;
            name: string;
            hexQ: number;
            hexR: number;
        };
        market: Array<{
            good: {
                id: number;
                name: string;
                type: string;
                basePrice: number;
            };
            selling?: {
                price: number;
                isSelling: boolean;
            };
            buying?: {
                price: number;
                isSelling: boolean;
            };
        }>;
    }>;
    private generatePlanetName;
}
