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
exports.Good = void 0;
const typeorm_1 = require("typeorm");
const planet_market_entity_1 = require("./planet-market.entity");
const player_inventory_entity_1 = require("./player-inventory.entity");
const event_market_effect_entity_1 = require("./event-market-effect.entity");
let Good = class Good {
    id;
    name;
    basePrice;
    type;
    marketEntries;
    inventories;
    eventEffects;
};
exports.Good = Good;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Good.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Good.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'base_price' }),
    __metadata("design:type", Number)
], Good.prototype, "basePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Good.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => planet_market_entity_1.PlanetMarket, (market) => market.good),
    __metadata("design:type", Array)
], Good.prototype, "marketEntries", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => player_inventory_entity_1.PlayerInventory, (inventory) => inventory.good),
    __metadata("design:type", Array)
], Good.prototype, "inventories", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => event_market_effect_entity_1.EventMarketEffect, (effect) => effect.good),
    __metadata("design:type", Array)
], Good.prototype, "eventEffects", void 0);
exports.Good = Good = __decorate([
    (0, typeorm_1.Entity)({ name: 'goods' })
], Good);
//# sourceMappingURL=good.entity.js.map