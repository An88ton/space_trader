"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniverseService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const hex_entity_1 = require("../entities/hex.entity");
const planet_entity_1 = require("../entities/planet.entity");
const planet_market_entity_1 = require("../entities/planet-market.entity");
const good_entity_1 = require("../entities/good.entity");
const hex_coordinates_1 = require("../utils/hex-coordinates");
const market_logic_1 = require("../utils/market-logic");
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
    null,
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
class SeededRandom {
    seed;
    constructor(seed) {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            const char = seed.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        this.seed = hash > 0 ? hash : -hash || 1;
    }
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
    nextInt(max) {
        return Math.floor(this.next() * max);
    }
    choice(array) {
        return array[this.nextInt(array.length)];
    }
}
let UniverseService = class UniverseService {
    hexRepository;
    planetRepository;
    planetMarketRepository;
    goodRepository;
    constructor(hexRepository, planetRepository, planetMarketRepository, goodRepository) {
        this.hexRepository = hexRepository;
        this.planetRepository = planetRepository;
        this.planetMarketRepository = planetMarketRepository;
        this.goodRepository = goodRepository;
    }
    async generateUniverse(config = {}) {
        const hexRadius = config.hexRadius ?? 10;
        const planetCount = config.planetCount ?? 50;
        const seed = config.seed ?? 'default-universe-seed';
        const rng = new SeededRandom(seed);
        const center = { q: 0, r: 0 };
        const hexCoordinates = (0, hex_coordinates_1.hexesInRange)(center, hexRadius);
        const hexes = hexCoordinates.map((coord) => {
            const hex = new hex_entity_1.Hex();
            hex.q = coord.q;
            hex.r = coord.r;
            hex.hasPlanet = false;
            return hex;
        });
        await this.hexRepository.save(hexes);
        const planetHexes = [];
        const usedHexIndices = new Set();
        while (planetHexes.length < planetCount && planetHexes.length < hexes.length) {
            const hexIndex = rng.nextInt(hexes.length);
            if (usedHexIndices.has(hexIndex)) {
                continue;
            }
            const hex = hexes[hexIndex];
            const coord = { q: hex.q, r: hex.r };
            const minDistance = 2;
            const tooClose = planetHexes.some((planetHex) => {
                const dist = Math.abs(coord.q - planetHex.coord.q) +
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
        const planets = [];
        const usedNames = new Set();
        for (const { hex, coord } of planetHexes) {
            const planet = new planet_entity_1.Planet();
            planet.hexQ = coord.q;
            planet.hexR = coord.r;
            planet.hex = hex;
            planet.name = this.generatePlanetName(rng, usedNames);
            planet.planetType = rng.choice(PLANET_TYPES);
            planet.faction = rng.choice(FACTIONS);
            planet.securityLevel = rng.choice(SECURITY_LEVELS);
            planet.dockingFee = 50 + rng.nextInt(200);
            const resourceCount = 1 + rng.nextInt(4);
            planet.resources = [];
            for (let i = 0; i < resourceCount; i++) {
                const resource = rng.choice(RESOURCE_TYPES);
                if (!planet.resources.includes(resource)) {
                    planet.resources.push(resource);
                }
            }
            planet.marketModifiers = {};
            const modifierCount = rng.nextInt(3) + 1;
            const modifierTypes = ['bonus', 'penalty', 'normal'];
            for (let i = 0; i < modifierCount; i++) {
                const goodType = rng.choice(['food', 'tech', 'luxury', 'industrial']);
                const modifierType = rng.choice(modifierTypes);
                if (modifierType === 'bonus') {
                    planet.marketModifiers[goodType] = 0.8 + rng.next() * 0.15;
                }
                else if (modifierType === 'penalty') {
                    planet.marketModifiers[goodType] = 1.1 + rng.next() * 0.2;
                }
            }
            planet.eventWeights = {};
            const eventTypes = ['piracy', 'trade_boom', 'natural_disaster', 'faction_war', 'rare_find'];
            for (const eventType of eventTypes) {
                planet.eventWeights[eventType] = 0.5 + rng.next();
            }
            planets.push(planet);
        }
        await this.planetRepository.save(planets);
        await this.hexRepository.save(hexes);
        return { hexes, planets };
    }
    async getAllHexes() {
        return this.hexRepository.find({ order: { q: 'ASC', r: 'ASC' } });
    }
    async getAllPlanets() {
        return this.planetRepository.find({
            relations: ['hex'],
            order: { hexQ: 'ASC', hexR: 'ASC' },
        });
    }
    async getHexAt(q, r) {
        return this.hexRepository.findOne({ where: { q, r } });
    }
    async getPlanetAt(q, r) {
        return this.planetRepository.findOne({ where: { hexQ: q, hexR: r }, relations: ['hex'] });
    }
    async getUniverseBounds() {
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
    async isUniverseGenerated() {
        const count = await this.hexRepository.count();
        return count > 0;
    }
    async clearUniverse() {
        await this.planetRepository.delete({});
        await this.hexRepository.delete({});
    }
    async getPlanetMarketPrices(q, r) {
        const planet = await this.getPlanetAt(q, r);
        if (!planet) {
            throw new common_1.NotFoundException(`Planet not found at coordinates (${q}, ${r})`);
        }
        const allGoods = await this.goodRepository.find();
        const existingMarkets = await this.planetMarketRepository.find({
            where: { planet: { id: planet.id } },
            relations: ['good'],
        });
        const marketMap = new Map();
        existingMarkets.forEach((market) => {
            const key = `${market.good.id}-${market.isSelling}`;
            marketMap.set(key, market);
        });
        const marketPrices = allGoods.map((good) => {
            const shouldSell = (0, market_logic_1.shouldPlanetSellGood)(planet, good);
            const shouldBuy = (0, market_logic_1.shouldPlanetBuyGood)(planet, good);
            const result = {
                good: {
                    id: good.id,
                    name: good.name,
                    type: good.type,
                    basePrice: good.basePrice,
                },
            };
            if (shouldSell) {
                const marketKey = `${good.id}-true`;
                let marketEntry = marketMap.get(marketKey);
                if (!marketEntry) {
                    const price = (0, market_logic_1.calculateMarketPrice)(planet, good, true);
                    result.selling = {
                        price,
                        isSelling: true,
                    };
                }
                else {
                    result.selling = {
                        price: marketEntry.price,
                        isSelling: marketEntry.isSelling,
                    };
                }
            }
            if (shouldBuy) {
                const marketKey = `${good.id}-false`;
                let marketEntry = marketMap.get(marketKey);
                if (!marketEntry) {
                    const price = (0, market_logic_1.calculateMarketPrice)(planet, good, false);
                    result.buying = {
                        price,
                        isSelling: false,
                    };
                }
                else {
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
                hexQ: planet.hexQ,
                hexR: planet.hexR,
            },
            market: marketPrices,
        };
    }
    generatePlanetName(rng, usedNames) {
        let name;
        let attempts = 0;
        do {
            const prefix = rng.choice(PLANET_NAMES_PREFIXES);
            const suffix = rng.choice(PLANET_NAMES_SUFFIXES);
            name = `${prefix} ${suffix}`;
            attempts++;
            if (attempts > 100) {
                name = `${prefix} ${suffix} ${rng.nextInt(1000)}`;
                break;
            }
        } while (usedNames.has(name));
        usedNames.add(name);
        return name;
    }
};
exports.UniverseService = UniverseService;
exports.UniverseService = UniverseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(hex_entity_1.Hex)),
    __param(1, (0, typeorm_1.InjectRepository)(planet_entity_1.Planet)),
    __param(2, (0, typeorm_1.InjectRepository)(planet_market_entity_1.PlanetMarket)),
    __param(3, (0, typeorm_1.InjectRepository)(good_entity_1.Good)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UniverseService);
//# sourceMappingURL=universe.service.js.map