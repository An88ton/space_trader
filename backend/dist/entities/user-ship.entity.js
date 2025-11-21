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
exports.UserShip = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const ship_entity_1 = require("./ship.entity");
const planet_entity_1 = require("./planet.entity");
let UserShip = class UserShip {
    id;
    user;
    ship;
    isActive;
    acquiredAt;
    currentPlanet;
};
exports.UserShip = UserShip;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserShip.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.userShips, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], UserShip.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ship_entity_1.Ship, (ship) => ship.userShips, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'ship_id' }),
    __metadata("design:type", ship_entity_1.Ship)
], UserShip.prototype, "ship", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], UserShip.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'acquired_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], UserShip.prototype, "acquiredAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => planet_entity_1.Planet, {
        onDelete: 'SET NULL',
        nullable: true,
        eager: false,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'current_planet_id' }),
    __metadata("design:type", Object)
], UserShip.prototype, "currentPlanet", void 0);
exports.UserShip = UserShip = __decorate([
    (0, typeorm_1.Entity)({ name: 'user_ships' }),
    (0, typeorm_1.Unique)('uq_user_ship_pair', ['user', 'ship']),
    (0, typeorm_1.Index)('idx_user_ships_user', ['user']),
    (0, typeorm_1.Index)('idx_user_ships_ship', ['ship']),
    (0, typeorm_1.Index)('idx_user_ships_planet', ['currentPlanet']),
    (0, typeorm_1.Index)('uq_user_active_ship', ['user'], {
        unique: true,
        where: '"is_active" = true',
    })
], UserShip);
//# sourceMappingURL=user-ship.entity.js.map