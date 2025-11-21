import { UniverseService } from './universe.service';
import { UniverseGenerationDto } from './dto/universe-generation.dto';
import { PathfindingDto } from './dto/pathfinding.dto';
import { HexCoordinate } from '../utils/hex-coordinates';
export declare class UniverseController {
    private readonly universeService;
    constructor(universeService: UniverseService);
    generateUniverse(dto: UniverseGenerationDto): Promise<{
        message: string;
        hexCount: number;
        planetCount: number;
    }>;
    getHexes(): Promise<{
        id: number;
        q: number;
        r: number;
        hasPlanet: boolean;
    }[]>;
    getPlanets(): Promise<{
        id: number;
        name: string;
        hexQ: number | null;
        hexR: number | null;
        planetType: string;
        faction: string | null;
        securityLevel: string;
        dockingFee: number;
        resources: string[] | null;
        marketModifiers: Record<string, number> | null;
        eventWeights: Record<string, number> | null;
    }[]>;
    getMap(): Promise<{
        hexes: {
            id: number;
            q: number;
            r: number;
            hasPlanet: boolean;
        }[];
        planets: {
            id: number;
            name: string;
            hexQ: number | null;
            hexR: number | null;
            planetType: string;
            faction: string | null;
            securityLevel: string;
            dockingFee: number;
            resources: string[] | null;
            marketModifiers: Record<string, number> | null;
            eventWeights: Record<string, number> | null;
        }[];
        bounds: {
            minQ: number;
            maxQ: number;
            minR: number;
            maxR: number;
        } | null;
    }>;
    getHex(q: string, r: string): Promise<{
        id: number;
        q: number;
        r: number;
        hasPlanet: boolean;
    } | null>;
    getPlanet(q: string, r: string): Promise<{
        id: number;
        name: string;
        hexQ: number | null;
        hexR: number | null;
        planetType: string;
        faction: string | null;
        securityLevel: string;
        dockingFee: number;
        resources: string[] | null;
        marketModifiers: Record<string, number> | null;
        eventWeights: Record<string, number> | null;
    } | null>;
    getBounds(): Promise<{
        minQ: number;
        maxQ: number;
        minR: number;
        maxR: number;
    } | null>;
    getStatus(): Promise<{
        isGenerated: boolean;
    }>;
    getDistance(query: PathfindingDto): Promise<{
        distance: number;
        from: HexCoordinate;
        to: HexCoordinate;
    }>;
    getPath(dto: PathfindingDto): Promise<{
        path: HexCoordinate[] | null;
        distance: number | null;
        from: HexCoordinate;
        to: HexCoordinate;
    }>;
    clearUniverse(): Promise<void>;
}
