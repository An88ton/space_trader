import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hex } from '../entities/hex.entity';
import { Planet } from '../entities/planet.entity';
import { PlanetMarket } from '../entities/planet-market.entity';
import { Good } from '../entities/good.entity';
import { hexesInRange, HexCoordinate } from '../utils/hex-coordinates';
import {
  shouldPlanetSellGood,
  shouldPlanetBuyGood,
  calculateMarketPrice,
} from '../utils/market-logic';

export interface UniverseGenerationConfig {
  hexRadius?: number; // Radius of hexes to generate (default: 10, generates ~331 hexes)
  planetCount?: number; // Number of planets to generate (default: 50)
  seed?: string; // Seed for reproducible generation
}

const PLANET_TYPES = [
  'terrestrial',
  'gas_giant',
  'ice',
  'desert',
  'ocean',
  'volcanic',
  'forest',
  'barren',
  'toxic',
  'mining_colony',
];

const FACTIONS = [
  'Independent',
  'Terran Federation',
  'Xenon Collective',
  'Free Traders',
  'Mercenary Guild',
  null, // Unclaimed
];

const SECURITY_LEVELS = ['low', 'medium', 'high', 'none'];

const RESOURCE_TYPES = [
  'minerals',
  'energy',
  'food',
  'technology',
  'luxury',
  'industrial',
  'organic',
  'rare_elements',
];

const PLANET_NAMES_PREFIXES = [
  'Alpha',
  'Beta',
  'Gamma',
  'Delta',
  'New',
  'Old',
  'Prime',
  'Sanctum',
  'Outpost',
  'Station',
  'Fortress',
  'Haven',
  'Nexus',
  'Terminus',
  'Echo',
  'Stellar',
  'Nebula',
  'Void',
  'Deep',
  'Far',
];

const PLANET_NAMES_SUFFIXES = [
  'Prime',
  'Secundus',
  'III',
  'IV',
  'V',
  'Station',
  'Outpost',
  'Haven',
  'Fortress',
  'Terminus',
  'Nexus',
  'World',
  'Colony',
  'Base',
  'Point',
  'Reach',
];

/**
 * Simple seeded random number generator for reproducible generation
 */
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    this.seed = hash > 0 ? hash : -hash || 1;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  choice<T>(array: T[]): T {
    return array[this.nextInt(array.length)];
  }
}

@Injectable()
export class UniverseService {
  constructor(
    @InjectRepository(Hex)
    private hexRepository: Repository<Hex>,
    @InjectRepository(Planet)
    private planetRepository: Repository<Planet>,
    @InjectRepository(PlanetMarket)
    private planetMarketRepository: Repository<PlanetMarket>,
    @InjectRepository(Good)
    private goodRepository: Repository<Good>,
  ) {}

  /**
   * Generate a procedurally generated universe
   */
  async generateUniverse(config: UniverseGenerationConfig = {}): Promise<{
    hexes: Hex[];
    planets: Planet[];
  }> {
    const hexRadius = config.hexRadius ?? 10;
    const planetCount = config.planetCount ?? 50;
    const seed = config.seed ?? 'default-universe-seed';

    const rng = new SeededRandom(seed);

    // Generate hex grid
    const center: HexCoordinate = { q: 0, r: 0 };
    const hexCoordinates = hexesInRange(center, hexRadius);

    // Create hex entities
    const hexes = hexCoordinates.map((coord) => {
      const hex = new Hex();
      hex.q = coord.q;
      hex.r = coord.r;
      hex.hasPlanet = false;
      return hex;
    });

    // Save hexes
    await this.hexRepository.save(hexes);

    // Select random hexes for planets (ensuring minimum distance between planets)
    const planetHexes: { hex: Hex; coord: HexCoordinate }[] = [];
    const usedHexIndices = new Set<number>();

    while (planetHexes.length < planetCount && planetHexes.length < hexes.length) {
      const hexIndex = rng.nextInt(hexes.length);
      if (usedHexIndices.has(hexIndex)) {
        continue;
      }

      const hex = hexes[hexIndex];
      const coord = { q: hex.q, r: hex.r };

      // Check minimum distance from other planets (optional: ensure planets aren't too close)
      const minDistance = 2; // Minimum hex distance between planets
      const tooClose = planetHexes.some((planetHex) => {
        const dist =
          Math.abs(coord.q - planetHex.coord.q) +
          Math.abs(coord.q + coord.r - (planetHex.coord.q + planetHex.coord.r)) +
          Math.abs(coord.r - planetHex.coord.r);
        return dist / 2 < minDistance;
      });

      if (!tooClose) {
        planetHexes.push({ hex, coord });
        usedHexIndices.add(hexIndex);
        hex.hasPlanet = true;
      }
    }

    // Generate planets
    const planets: Planet[] = [];
    const usedNames = new Set<string>();

    for (const { hex, coord } of planetHexes) {
      const planet = new Planet();
      planet.hexQ = coord.q;
      planet.hexR = coord.r;
      planet.hex = hex; // Set the relation, TypeORM will handle the foreign key
      planet.name = this.generatePlanetName(rng, usedNames);
      planet.planetType = rng.choice(PLANET_TYPES);
      planet.faction = rng.choice(FACTIONS);
      planet.securityLevel = rng.choice(SECURITY_LEVELS);
      planet.dockingFee = 50 + rng.nextInt(200);

      // Generate resources based on planet type
      const resourceCount = 1 + rng.nextInt(4);
      planet.resources = [];
      for (let i = 0; i < resourceCount; i++) {
        const resource = rng.choice(RESOURCE_TYPES);
        if (!planet.resources.includes(resource)) {
          planet.resources.push(resource);
        }
      }

      // Generate market modifiers (some planets have better prices for certain goods)
      planet.marketModifiers = {};
      const modifierCount = rng.nextInt(3) + 1;
      const modifierTypes = ['bonus', 'penalty', 'normal'];
      for (let i = 0; i < modifierCount; i++) {
        const goodType = rng.choice(['food', 'tech', 'luxury', 'industrial']);
        const modifierType = rng.choice(modifierTypes);
        if (modifierType === 'bonus') {
          planet.marketModifiers[goodType] = 0.8 + rng.next() * 0.15; // 0.8-0.95 (cheaper)
        } else if (modifierType === 'penalty') {
          planet.marketModifiers[goodType] = 1.1 + rng.next() * 0.2; // 1.1-1.3 (more expensive)
        }
      }

      // Generate event weights (some planets have higher chance of certain events)
      planet.eventWeights = {};
      const eventTypes = ['piracy', 'trade_boom', 'natural_disaster', 'faction_war', 'rare_find'];
      for (const eventType of eventTypes) {
        planet.eventWeights[eventType] = 0.5 + rng.next(); // 0.5-1.5
      }

      planets.push(planet);
    }

    // Save planets
    await this.planetRepository.save(planets);

    // Update hexes to mark which have planets
    await this.hexRepository.save(hexes);

    return { hexes, planets };
  }

  /**
   * Get all hexes in the universe
   */
  async getAllHexes(): Promise<Hex[]> {
    return this.hexRepository.find({ order: { q: 'ASC', r: 'ASC' } });
  }

  /**
   * Get all planets with their hex information
   */
  async getAllPlanets(): Promise<Planet[]> {
    return this.planetRepository.find({
      relations: ['hex'],
      order: { hexQ: 'ASC', hexR: 'ASC' },
    });
  }

  /**
   * Get hex at specific coordinates
   */
  async getHexAt(q: number, r: number): Promise<Hex | null> {
    return this.hexRepository.findOne({ where: { q, r } });
  }

  /**
   * Get planet at specific hex coordinates
   */
  async getPlanetAt(q: number, r: number): Promise<Planet | null> {
    return this.planetRepository.findOne({ where: { hexQ: q, hexR: r }, relations: ['hex'] });
  }

  /**
   * Get universe bounds (min/max q and r values)
   */
  async getUniverseBounds(): Promise<{
    minQ: number;
    maxQ: number;
    minR: number;
    maxR: number;
  } | null> {
    const result = await this.hexRepository
      .createQueryBuilder('hex')
      .select('MIN(hex.q)', 'minQ')
      .addSelect('MAX(hex.q)', 'maxQ')
      .addSelect('MIN(hex.r)', 'minR')
      .addSelect('MAX(hex.r)', 'maxR')
      .getRawOne();

    if (!result || result.minQ === null) {
      return null;
    }

    return {
      minQ: parseInt(result.minQ, 10),
      maxQ: parseInt(result.maxQ, 10),
      minR: parseInt(result.minR, 10),
      maxR: parseInt(result.maxR, 10),
    };
  }

  /**
   * Check if universe has been generated
   */
  async isUniverseGenerated(): Promise<boolean> {
    const count = await this.hexRepository.count();
    return count > 0;
  }

  /**
   * Clear the universe (for regeneration)
   */
  async clearUniverse(): Promise<void> {
    await this.planetRepository.delete({});
    await this.hexRepository.delete({});
  }

  /**
   * Get market prices for a planet at specific coordinates
   * Returns buying and selling prices for all goods available on the planet
   */
  async getPlanetMarketPrices(q: number, r: number): Promise<{
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
  }> {
    const planet = await this.getPlanetAt(q, r);
    if (!planet) {
      throw new NotFoundException(`Planet not found at coordinates (${q}, ${r})`);
    }

    // Get all goods
    const allGoods = await this.goodRepository.find();

    // Get existing market entries for this planet
    const existingMarkets = await this.planetMarketRepository.find({
      where: { planet: { id: planet.id } },
      relations: ['good'],
    });

    // Create a map of existing markets by good ID and isSelling flag
    const marketMap = new Map<string, PlanetMarket>();
    existingMarkets.forEach((market) => {
      const key = `${market.good.id}-${market.isSelling}`;
      marketMap.set(key, market);
    });

    // Build market prices for all goods
    const marketPrices = allGoods.map((good) => {
      const shouldSell = shouldPlanetSellGood(planet, good);
      const shouldBuy = shouldPlanetBuyGood(planet, good);

      const result: {
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
      } = {
        good: {
          id: good.id,
          name: good.name,
          type: good.type,
          basePrice: good.basePrice,
        },
      };

      // If planet should sell this good, include selling price
      if (shouldSell) {
        const marketKey = `${good.id}-true`;
        let marketEntry = marketMap.get(marketKey);

        // If market entry doesn't exist or is stale, calculate new price
        if (!marketEntry) {
          const price = calculateMarketPrice(planet, good, true);
          result.selling = {
            price,
            isSelling: true,
          };
        } else {
          result.selling = {
            price: marketEntry.price,
            isSelling: marketEntry.isSelling,
          };
        }
      }

      // If planet should buy this good, include buying price
      if (shouldBuy) {
        const marketKey = `${good.id}-false`;
        let marketEntry = marketMap.get(marketKey);

        // If market entry doesn't exist or is stale, calculate new price
        if (!marketEntry) {
          const price = calculateMarketPrice(planet, good, false);
          result.buying = {
            price,
            isSelling: false,
          };
        } else {
          result.buying = {
            price: marketEntry.price,
            isSelling: marketEntry.isSelling,
          };
        }
      }

      return result;
    });

    return {
      planet: {
        id: planet.id,
        name: planet.name,
        hexQ: planet.hexQ!,
        hexR: planet.hexR!,
      },
      market: marketPrices,
    };
  }

  private generatePlanetName(rng: SeededRandom, usedNames: Set<string>): string {
    let name: string;
    let attempts = 0;
    do {
      const prefix = rng.choice(PLANET_NAMES_PREFIXES);
      const suffix = rng.choice(PLANET_NAMES_SUFFIXES);
      name = `${prefix} ${suffix}`;
      attempts++;
      if (attempts > 100) {
        // Fallback if too many attempts
        name = `${prefix} ${suffix} ${rng.nextInt(1000)}`;
        break;
      }
    } while (usedNames.has(name));

    usedNames.add(name);
    return name;
  }
}

