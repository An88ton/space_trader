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
exports.ActiveEvent = void 0;
const typeorm_1 = require("typeorm");
const event_entity_1 = require("./event.entity");
const planet_entity_1 = require("./planet.entity");
let ActiveEvent = class ActiveEvent {
    id;
    event;
    planet;
    startedAtTurn;
    expiresAtTurn;
    isActive;
    createdAt;
};
exports.ActiveEvent = ActiveEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ActiveEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => event_entity_1.Event, (event) => event.activeEvents, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'event_id' }),
    __metadata("design:type", event_entity_1.Event)
], ActiveEvent.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => planet_entity_1.Planet, {
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'planet_id' }),
    __metadata("design:type", Object)
], ActiveEvent.prototype, "planet", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'started_at_turn', type: 'int' }),
    __metadata("design:type", Number)
], ActiveEvent.prototype, "startedAtTurn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at_turn', type: 'int' }),
    __metadata("design:type", Number)
], ActiveEvent.prototype, "expiresAtTurn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ActiveEvent.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'created_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], ActiveEvent.prototype, "createdAt", void 0);
exports.ActiveEvent = ActiveEvent = __decorate([
    (0, typeorm_1.Entity)({ name: 'active_events' }),
    (0, typeorm_1.Index)('idx_active_event_event', ['event']),
    (0, typeorm_1.Index)('idx_active_event_planet', ['planet']),
    (0, typeorm_1.Index)('idx_active_event_active', ['isActive', 'expiresAtTurn'])
], ActiveEvent);
//# sourceMappingURL=active-event.entity.js.map