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
exports.EventLog = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const event_entity_1 = require("./event.entity");
let EventLog = class EventLog {
    id;
    user;
    event;
    occurredAt;
    reputationDelta;
    creditDelta;
    fuelDelta;
    cargoLost;
    eventData;
    notes;
};
exports.EventLog = EventLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EventLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.eventLogs, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], EventLog.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => event_entity_1.Event, (event) => event.eventLogs, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'event_id' }),
    __metadata("design:type", Object)
], EventLog.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'occurred_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], EventLog.prototype, "occurredAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reputation_delta', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], EventLog.prototype, "reputationDelta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credit_delta', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], EventLog.prototype, "creditDelta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fuel_delta', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], EventLog.prototype, "fuelDelta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cargo_lost', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], EventLog.prototype, "cargoLost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'event_data', nullable: true }),
    __metadata("design:type", Object)
], EventLog.prototype, "eventData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], EventLog.prototype, "notes", void 0);
exports.EventLog = EventLog = __decorate([
    (0, typeorm_1.Entity)({ name: 'event_log' }),
    (0, typeorm_1.Index)('idx_event_log_user', ['user']),
    (0, typeorm_1.Index)('idx_event_log_event', ['event'])
], EventLog);
//# sourceMappingURL=event-log.entity.js.map