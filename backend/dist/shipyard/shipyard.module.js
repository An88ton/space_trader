"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipyardModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const user_entity_1 = require("../entities/user.entity");
const ship_entity_1 = require("../entities/ship.entity");
const planet_entity_1 = require("../entities/planet.entity");
const user_ship_entity_1 = require("../entities/user-ship.entity");
const player_inventory_entity_1 = require("../entities/player-inventory.entity");
const shipyard_controller_1 = require("./shipyard.controller");
const shipyard_service_1 = require("./shipyard.service");
let ShipyardModule = class ShipyardModule {
};
exports.ShipyardModule = ShipyardModule;
exports.ShipyardModule = ShipyardModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                ship_entity_1.Ship,
                planet_entity_1.Planet,
                user_ship_entity_1.UserShip,
                player_inventory_entity_1.PlayerInventory,
            ]),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET ?? 'space-trader-super-secret',
            }),
        ],
        controllers: [shipyard_controller_1.ShipyardController],
        providers: [shipyard_service_1.ShipyardService],
        exports: [shipyard_service_1.ShipyardService],
    })
], ShipyardModule);
//# sourceMappingURL=shipyard.module.js.map