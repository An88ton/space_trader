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
exports.Ship = void 0;
const typeorm_1 = require("typeorm");
const player_inventory_entity_1 = require("./player-inventory.entity");
const travel_log_entity_1 = require("./travel-log.entity");
const user_ship_entity_1 = require("./user-ship.entity");
let Ship = class Ship {
    id;
    name;
    level;
    price;
    cargoCapacity;
    fuelCapacity;
    fuelCurrent;
    speed;
    acquiredAt;
    inventories;
    travelLogs;
    userShips;
};
exports.Ship = Ship;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Ship.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], Ship.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Ship.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Ship.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cargo_capacity' }),
    __metadata("design:type", Number)
], Ship.prototype, "cargoCapacity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fuel_capacity' }),
    __metadata("design:type", Number)
], Ship.prototype, "fuelCapacity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fuel_current' }),
    __metadata("design:type", Number)
], Ship.prototype, "fuelCurrent", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Ship.prototype, "speed", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'acquired_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], Ship.prototype, "acquiredAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => player_inventory_entity_1.PlayerInventory, (inventory) => inventory.ship),
    __metadata("design:type", Array)
], Ship.prototype, "inventories", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => travel_log_entity_1.TravelLog, (travelLog) => travelLog.ship),
    __metadata("design:type", Array)
], Ship.prototype, "travelLogs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_ship_entity_1.UserShip, (userShip) => userShip.ship),
    __metadata("design:type", Array)
], Ship.prototype, "userShips", void 0);
exports.Ship = Ship = __decorate([
    (0, typeorm_1.Entity)({ name: 'ship' })
], Ship);
//# sourceMappingURL=ship.entity.js.map