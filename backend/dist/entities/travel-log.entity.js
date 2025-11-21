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
exports.TravelLog = void 0;
const typeorm_1 = require("typeorm");
const ship_entity_1 = require("./ship.entity");
const planet_entity_1 = require("./planet.entity");
const event_entity_1 = require("./event.entity");
let TravelLog = class TravelLog {
    id;
    ship;
    originPlanet;
    destinationPlanet;
    distance;
    fuelUsed;
    travelTurn;
    event;
    completedAt;
};
exports.TravelLog = TravelLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TravelLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ship_entity_1.Ship, (ship) => ship.travelLogs, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'ship_id' }),
    __metadata("design:type", ship_entity_1.Ship)
], TravelLog.prototype, "ship", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => planet_entity_1.Planet, (planet) => planet.originTravelLogs, {
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'origin_planet_id' }),
    __metadata("design:type", Object)
], TravelLog.prototype, "originPlanet", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => planet_entity_1.Planet, (planet) => planet.destinationTravelLogs, {
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'destination_planet_id' }),
    __metadata("design:type", Object)
], TravelLog.prototype, "destinationPlanet", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TravelLog.prototype, "distance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fuel_used' }),
    __metadata("design:type", Number)
], TravelLog.prototype, "fuelUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'travel_turn' }),
    __metadata("design:type", Number)
], TravelLog.prototype, "travelTurn", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => event_entity_1.Event, (event) => event.travelLogs, {
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'event_id' }),
    __metadata("design:type", Object)
], TravelLog.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'completed_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], TravelLog.prototype, "completedAt", void 0);
exports.TravelLog = TravelLog = __decorate([
    (0, typeorm_1.Entity)({ name: 'travel_log' }),
    (0, typeorm_1.Index)('idx_travel_log_ship', ['ship']),
    (0, typeorm_1.Index)('idx_travel_log_event', ['event'])
], TravelLog);
//# sourceMappingURL=travel-log.entity.js.map