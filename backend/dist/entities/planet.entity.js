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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Planet = void 0;
const typeorm_1 = require("typeorm");
const planet_market_entity_1 = require("./planet-market.entity");
const event_market_effect_entity_1 = require("./event-market-effect.entity");
const travel_log_entity_1 = require("./travel-log.entity");
const hex_entity_1 = require("./hex.entity");
const user_ship_entity_1 = require("./user-ship.entity");
let Planet = class Planet {
    id;
    name;
    coordinateX;
    coordinateY;
    hexQ;
    hexR;
    hex;
    dockingFee;
    planetType;
    marketModifiers;
    resources;
    faction;
    securityLevel;
    eventWeights;
    marketEntries;
    marketEffects;
    originTravelLogs;
    destinationTravelLogs;
    dockedShips;
};
exports.Planet = Planet;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Planet.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Planet.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'coordinate_x', nullable: true }),
    __metadata("design:type", Object)
], Planet.prototype, "coordinateX", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'coordinate_y', nullable: true }),
    __metadata("design:type", Object)
], Planet.prototype, "coordinateY", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'hex_q', nullable: true }),
    __metadata("design:type", Object)
], Planet.prototype, "hexQ", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'hex_r', nullable: true }),
    __metadata("design:type", Object)
], Planet.prototype, "hexR", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => hex_entity_1.Hex, (hex) => hex.planets, { nullable: true, eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'hex_id' }),
    __metadata("design:type", Object)
], Planet.prototype, "hex", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'docking_fee', default: 100 }),
    __metadata("design:type", Number)
], Planet.prototype, "dockingFee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, name: 'planet_type', default: 'terrestrial' }),
    __metadata("design:type", String)
], Planet.prototype, "planetType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'market_modifiers', nullable: true }),
    __metadata("design:type", Object)
], Planet.prototype, "marketModifiers", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'resources', nullable: true }),
    __metadata("design:type", Object)
], Planet.prototype, "resources", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, name: 'faction', nullable: true }),
    __metadata("design:type", Object)
], Planet.prototype, "faction", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, name: 'security_level', default: 'medium' }),
    __metadata("design:type", String)
], Planet.prototype, "securityLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'event_weights', nullable: true }),
    __metadata("design:type", Object)
], Planet.prototype, "eventWeights", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => planet_market_entity_1.PlanetMarket, (market) => market.planet),
    __metadata("design:type", Array)
], Planet.prototype, "marketEntries", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => event_market_effect_entity_1.EventMarketEffect, (effect) => effect.planet),
    __metadata("design:type", Array)
], Planet.prototype, "marketEffects", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => travel_log_entity_1.TravelLog, (travel) => travel.originPlanet),
    __metadata("design:type", Array)
], Planet.prototype, "originTravelLogs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => travel_log_entity_1.TravelLog, (travel) => travel.destinationPlanet),
    __metadata("design:type", Array)
], Planet.prototype, "destinationTravelLogs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_ship_entity_1.UserShip, (assignment) => assignment.currentPlanet),
    __metadata("design:type", Array)
], Planet.prototype, "dockedShips", void 0);
exports.Planet = Planet = __decorate([
    (0, typeorm_1.Entity)({ name: 'planets' })
], Planet);
//# sourceMappingURL=planet.entity.js.map