"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniverseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const universe_service_1 = require("./universe.service");
const universe_controller_1 = require("./universe.controller");
const hex_entity_1 = require("../entities/hex.entity");
const planet_entity_1 = require("../entities/planet.entity");
const planet_market_entity_1 = require("../entities/planet-market.entity");
const good_entity_1 = require("../entities/good.entity");
let UniverseModule = class UniverseModule {
};
exports.UniverseModule = UniverseModule;
exports.UniverseModule = UniverseModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([hex_entity_1.Hex, planet_entity_1.Planet, planet_market_entity_1.PlanetMarket, good_entity_1.Good])],
        controllers: [universe_controller_1.UniverseController],
        providers: [universe_service_1.UniverseService],
        exports: [universe_service_1.UniverseService],
    })
], UniverseModule);
//# sourceMappingURL=universe.module.js.map