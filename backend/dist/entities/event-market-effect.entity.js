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
exports.EventMarketEffect = void 0;
const typeorm_1 = require("typeorm");
const event_entity_1 = require("./event.entity");
const planet_entity_1 = require("./planet.entity");
const good_entity_1 = require("./good.entity");
let EventMarketEffect = class EventMarketEffect {
    id;
    event;
    planet;
    good;
    priceModifier;
    durationTurns;
};
exports.EventMarketEffect = EventMarketEffect;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EventMarketEffect.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => event_entity_1.Event, (event) => event.marketEffects, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'event_id' }),
    __metadata("design:type", event_entity_1.Event)
], EventMarketEffect.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => planet_entity_1.Planet, (planet) => planet.marketEffects, {
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'planet_id' }),
    __metadata("design:type", Object)
], EventMarketEffect.prototype, "planet", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => good_entity_1.Good, (good) => good.eventEffects, {
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'good_id' }),
    __metadata("design:type", Object)
], EventMarketEffect.prototype, "good", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price_modifier', type: 'double precision' }),
    __metadata("design:type", Number)
], EventMarketEffect.prototype, "priceModifier", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duration_turns', default: 3 }),
    __metadata("design:type", Number)
], EventMarketEffect.prototype, "durationTurns", void 0);
exports.EventMarketEffect = EventMarketEffect = __decorate([
    (0, typeorm_1.Entity)({ name: 'event_market_effects' }),
    (0, typeorm_1.Index)('idx_event_effect_event', ['event'])
], EventMarketEffect);
//# sourceMappingURL=event-market-effect.entity.js.map