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
exports.Hex = void 0;
const typeorm_1 = require("typeorm");
const planet_entity_1 = require("./planet.entity");
let Hex = class Hex {
    id;
    q;
    r;
    hasPlanet;
    planets;
};
exports.Hex = Hex;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Hex.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Hex.prototype, "q", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Hex.prototype, "r", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false, name: 'has_planet' }),
    __metadata("design:type", Boolean)
], Hex.prototype, "hasPlanet", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => planet_entity_1.Planet, (planet) => planet.hex),
    __metadata("design:type", Array)
], Hex.prototype, "planets", void 0);
exports.Hex = Hex = __decorate([
    (0, typeorm_1.Entity)({ name: 'hexes' }),
    (0, typeorm_1.Unique)(['q', 'r'])
], Hex);
//# sourceMappingURL=hex.entity.js.map