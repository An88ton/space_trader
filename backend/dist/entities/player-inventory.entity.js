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
exports.PlayerInventory = void 0;
const typeorm_1 = require("typeorm");
const ship_entity_1 = require("./ship.entity");
const good_entity_1 = require("./good.entity");
let PlayerInventory = class PlayerInventory {
    id;
    ship;
    good;
    quantity;
};
exports.PlayerInventory = PlayerInventory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PlayerInventory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ship_entity_1.Ship, (ship) => ship.inventories, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'ship_id' }),
    __metadata("design:type", ship_entity_1.Ship)
], PlayerInventory.prototype, "ship", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => good_entity_1.Good, (good) => good.inventories, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'good_id' }),
    __metadata("design:type", good_entity_1.Good)
], PlayerInventory.prototype, "good", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PlayerInventory.prototype, "quantity", void 0);
exports.PlayerInventory = PlayerInventory = __decorate([
    (0, typeorm_1.Entity)({ name: 'player_inventory' }),
    (0, typeorm_1.Index)('idx_player_inventory_ship', ['ship']),
    (0, typeorm_1.Index)('idx_player_inventory_good', ['good'])
], PlayerInventory);
//# sourceMappingURL=player-inventory.entity.js.map