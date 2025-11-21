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
exports.Event = void 0;
const typeorm_1 = require("typeorm");
const event_market_effect_entity_1 = require("./event-market-effect.entity");
const event_log_entity_1 = require("./event-log.entity");
const travel_log_entity_1 = require("./travel-log.entity");
const active_event_entity_1 = require("./active-event.entity");
const event_choice_entity_1 = require("./event-choice.entity");
let Event = class Event {
    id;
    name;
    description;
    eventType;
    eventCategory;
    probability;
    reputationChange;
    cargoLossPercentage;
    fuelPenaltyMultiplier;
    creditCost;
    creditReward;
    marketEffects;
    eventLogs;
    travelLogs;
    activeEvents;
    choices;
    requiresChoice;
};
exports.Event = Event;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Event.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Event.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Event.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, name: 'event_type' }),
    __metadata("design:type", String)
], Event.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, name: 'event_category' }),
    __metadata("design:type", String)
], Event.prototype, "eventCategory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'double precision' }),
    __metadata("design:type", Number)
], Event.prototype, "probability", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reputation_change', default: 0 }),
    __metadata("design:type", Number)
], Event.prototype, "reputationChange", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cargo_loss_percentage', type: 'double precision', nullable: true }),
    __metadata("design:type", Object)
], Event.prototype, "cargoLossPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fuel_penalty_multiplier', type: 'double precision', nullable: true }),
    __metadata("design:type", Object)
], Event.prototype, "fuelPenaltyMultiplier", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credit_cost', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], Event.prototype, "creditCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credit_reward', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], Event.prototype, "creditReward", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => event_market_effect_entity_1.EventMarketEffect, (effect) => effect.event),
    __metadata("design:type", Array)
], Event.prototype, "marketEffects", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => event_log_entity_1.EventLog, (eventLog) => eventLog.event),
    __metadata("design:type", Array)
], Event.prototype, "eventLogs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => travel_log_entity_1.TravelLog, (travelLog) => travelLog.event),
    __metadata("design:type", Array)
], Event.prototype, "travelLogs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => active_event_entity_1.ActiveEvent, (activeEvent) => activeEvent.event),
    __metadata("design:type", Array)
], Event.prototype, "activeEvents", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => event_choice_entity_1.EventChoice, (choice) => choice.event),
    __metadata("design:type", Array)
], Event.prototype, "choices", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requires_choice', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Event.prototype, "requiresChoice", void 0);
exports.Event = Event = __decorate([
    (0, typeorm_1.Entity)({ name: 'events' })
], Event);
//# sourceMappingURL=event.entity.js.map