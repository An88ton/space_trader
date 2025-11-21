"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const user_entity_1 = require("../entities/user.entity");
const ship_entity_1 = require("../entities/ship.entity");
const planet_entity_1 = require("../entities/planet.entity");
const good_entity_1 = require("../entities/good.entity");
const user_ship_entity_1 = require("../entities/user-ship.entity");
const player_inventory_entity_1 = require("../entities/player-inventory.entity");
const planet_market_entity_1 = require("../entities/planet-market.entity");
const market_controller_1 = require("./market.controller");
const market_service_1 = require("./market.service");
let MarketModule = class MarketModule {
};
exports.MarketModule = MarketModule;
exports.MarketModule = MarketModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                ship_entity_1.Ship,
                planet_entity_1.Planet,
                good_entity_1.Good,
                user_ship_entity_1.UserShip,
                player_inventory_entity_1.PlayerInventory,
                planet_market_entity_1.PlanetMarket,
            ]),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET ?? 'space-trader-super-secret',
            }),
        ],
        controllers: [market_controller_1.MarketController],
        providers: [market_service_1.MarketService],
        exports: [market_service_1.MarketService],
    })
], MarketModule);
//# sourceMappingURL=market.module.js.map