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
exports.UniverseController = void 0;
const common_1 = require("@nestjs/common");
const universe_service_1 = require("./universe.service");
const universe_generation_dto_1 = require("./dto/universe-generation.dto");
const pathfinding_dto_1 = require("./dto/pathfinding.dto");
const hex_coordinates_1 = require("../utils/hex-coordinates");
let UniverseController = class UniverseController {
    universeService;
    constructor(universeService) {
        this.universeService = universeService;
    }
    async generateUniverse(dto) {
        const result = await this.universeService.generateUniverse({
            hexRadius: dto.hexRadius,
            planetCount: dto.planetCount,
            seed: dto.seed,
        });
        return {
            message: 'Universe generated successfully',
            hexCount: result.hexes.length,
            planetCount: result.planets.length,
        };
    }
    async getHexes() {
        const hexes = await this.universeService.getAllHexes();
        return hexes.map((hex) => ({
            id: hex.id,
            q: hex.q,
            r: hex.r,
            hasPlanet: hex.hasPlanet,
        }));
    }
    async getPlanets() {
        const planets = await this.universeService.getAllPlanets();
        return planets.map((planet) => ({
            id: planet.id,
            name: planet.name,
            hexQ: planet.hexQ,
            hexR: planet.hexR,
            planetType: planet.planetType,
            faction: planet.faction,
            securityLevel: planet.securityLevel,
            dockingFee: planet.dockingFee,
            resources: planet.resources,
            marketModifiers: planet.marketModifiers,
            eventWeights: planet.eventWeights,
        }));
    }
    async getMap() {
        const [hexes, planets, bounds] = await Promise.all([
            this.universeService.getAllHexes(),
            this.universeService.getAllPlanets(),
            this.universeService.getUniverseBounds(),
        ]);
        return {
            hexes: hexes.map((hex) => ({
                id: hex.id,
                q: hex.q,
                r: hex.r,
                hasPlanet: hex.hasPlanet,
            })),
            planets: planets.map((planet) => ({
                id: planet.id,
                name: planet.name,
                hexQ: planet.hexQ,
                hexR: planet.hexR,
                planetType: planet.planetType,
                faction: planet.faction,
                securityLevel: planet.securityLevel,
                dockingFee: planet.dockingFee,
                resources: planet.resources,
                marketModifiers: planet.marketModifiers,
                eventWeights: planet.eventWeights,
            })),
            bounds,
        };
    }
    async getHex(q, r) {
        const hex = await this.universeService.getHexAt(parseInt(q, 10), parseInt(r, 10));
        if (!hex) {
            return null;
        }
        return {
            id: hex.id,
            q: hex.q,
            r: hex.r,
            hasPlanet: hex.hasPlanet,
        };
    }
    async getPlanet(q, r) {
        const planet = await this.universeService.getPlanetAt(parseInt(q, 10), parseInt(r, 10));
        if (!planet) {
            return null;
        }
        return {
            id: planet.id,
            name: planet.name,
            hexQ: planet.hexQ,
            hexR: planet.hexR,
            planetType: planet.planetType,
            faction: planet.faction,
            securityLevel: planet.securityLevel,
            dockingFee: planet.dockingFee,
            resources: planet.resources,
            marketModifiers: planet.marketModifiers,
            eventWeights: planet.eventWeights,
        };
    }
    async getPlanetMarket(q, r) {
        return this.universeService.getPlanetMarketPrices(parseInt(q, 10), parseInt(r, 10));
    }
    async getBounds() {
        return this.universeService.getUniverseBounds();
    }
    async getStatus() {
        const isGenerated = await this.universeService.isUniverseGenerated();
        return { isGenerated };
    }
    async getDistance(query) {
        const from = { q: query.fromQ, r: query.fromR };
        const to = { q: query.toQ, r: query.toR };
        const distance = (0, hex_coordinates_1.hexDistance)(from, to);
        return { distance, from, to };
    }
    async getPath(dto) {
        const from = { q: dto.fromQ, r: dto.fromR };
        const to = { q: dto.toQ, r: dto.toR };
        const allHexes = await this.universeService.getAllHexes();
        const hexSet = new Set(allHexes.map((h) => `${h.q},${h.r}`));
        const isPassable = (hex) => {
            return hexSet.has(`${hex.q},${hex.r}`);
        };
        const path = (0, hex_coordinates_1.hexPath)(from, to, isPassable);
        const distance = path ? path.length - 1 : null;
        return {
            path: path || null,
            distance,
            from,
            to,
        };
    }
    async clearUniverse() {
        await this.universeService.clearUniverse();
    }
};
exports.UniverseController = UniverseController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [universe_generation_dto_1.UniverseGenerationDto]),
    __metadata("design:returntype", Promise)
], UniverseController.prototype, "generateUniverse", null);
__decorate([
    (0, common_1.Get)('hexes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UniverseController.prototype, "getHexes", null);
__decorate([
    (0, common_1.Get)('planets'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UniverseController.prototype, "getPlanets", null);
__decorate([
    (0, common_1.Get)('map'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UniverseController.prototype, "getMap", null);
__decorate([
    (0, common_1.Get)('hex/:q/:r'),
    __param(0, (0, common_1.Param)('q')),
    __param(1, (0, common_1.Param)('r')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UniverseController.prototype, "getHex", null);
__decorate([
    (0, common_1.Get)('planet/:q/:r'),
    __param(0, (0, common_1.Param)('q')),
    __param(1, (0, common_1.Param)('r')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UniverseController.prototype, "getPlanet", null);
__decorate([
    (0, common_1.Get)('planet/:q/:r/market'),
    __param(0, (0, common_1.Param)('q')),
    __param(1, (0, common_1.Param)('r')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UniverseController.prototype, "getPlanetMarket", null);
__decorate([
    (0, common_1.Get)('bounds'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UniverseController.prototype, "getBounds", null);
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UniverseController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('distance'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pathfinding_dto_1.PathfindingDto]),
    __metadata("design:returntype", Promise)
], UniverseController.prototype, "getDistance", null);
__decorate([
    (0, common_1.Post)('path'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pathfinding_dto_1.PathfindingDto]),
    __metadata("design:returntype", Promise)
], UniverseController.prototype, "getPath", null);
__decorate([
    (0, common_1.Delete)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UniverseController.prototype, "clearUniverse", null);
exports.UniverseController = UniverseController = __decorate([
    (0, common_1.Controller)('universe'),
    __metadata("design:paramtypes", [universe_service_1.UniverseService])
], UniverseController);
//# sourceMappingURL=universe.controller.js.map