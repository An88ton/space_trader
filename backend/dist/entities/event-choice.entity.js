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
exports.EventChoice = void 0;
const typeorm_1 = require("typeorm");
const event_entity_1 = require("./event.entity");
let EventChoice = class EventChoice {
    id;
    event;
    label;
    description;
    outcome;
    sortOrder;
};
exports.EventChoice = EventChoice;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EventChoice.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => event_entity_1.Event, (event) => event.choices, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'event_id' }),
    __metadata("design:type", event_entity_1.Event)
], EventChoice.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], EventChoice.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], EventChoice.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'outcome' }),
    __metadata("design:type", Object)
], EventChoice.prototype, "outcome", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sort_order', default: 0 }),
    __metadata("design:type", Number)
], EventChoice.prototype, "sortOrder", void 0);
exports.EventChoice = EventChoice = __decorate([
    (0, typeorm_1.Entity)({ name: 'event_choices' })
], EventChoice);
//# sourceMappingURL=event-choice.entity.js.map