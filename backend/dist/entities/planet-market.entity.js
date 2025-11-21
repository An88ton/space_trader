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
exports.PlanetMarket = void 0;
const typeorm_1 = require("typeorm");
const planet_entity_1 = require("./planet.entity");
const good_entity_1 = require("./good.entity");
let PlanetMarket = class PlanetMarket {
    id;
    planet;
    good;
    price;
    demandModifier;
    updatedAt;
};
exports.PlanetMarket = PlanetMarket;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PlanetMarket.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => planet_entity_1.Planet, (planet) => planet.marketEntries, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'planet_id' }),
    __metadata("design:type", planet_entity_1.Planet)
], PlanetMarket.prototype, "planet", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => good_entity_1.Good, (good) => good.marketEntries, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'good_id' }),
    __metadata("design:type", good_entity_1.Good)
], PlanetMarket.prototype, "good", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PlanetMarket.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'demand_modifier',
        type: 'double precision',
        default: 1.0,
    }),
    __metadata("design:type", Number)
], PlanetMarket.prototype, "demandModifier", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'updated_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], PlanetMarket.prototype, "updatedAt", void 0);
exports.PlanetMarket = PlanetMarket = __decorate([
    (0, typeorm_1.Entity)({ name: 'planet_market' }),
    (0, typeorm_1.Index)('idx_planet_market_planet', ['planet']),
    (0, typeorm_1.Index)('idx_planet_market_good', ['good'])
], PlanetMarket);
//# sourceMappingURL=planet-market.entity.js.map