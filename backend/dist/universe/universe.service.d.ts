import { Repository } from 'typeorm';
import { Hex } from '../entities/hex.entity';
import { Planet } from '../entities/planet.entity';
export interface UniverseGenerationConfig {
    hexRadius?: number;
    planetCount?: number;
    seed?: string;
}
export declare class UniverseService {
    private hexRepository;
    private planetRepository;
    constructor(hexRepository: Repository<Hex>, planetRepository: Repository<Planet>);
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
    private generatePlanetName;
}
