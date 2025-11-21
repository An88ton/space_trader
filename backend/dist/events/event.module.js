"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const event_controller_1 = require("./event.controller");
const event_service_1 = require("./event.service");
const event_entity_1 = require("../entities/event.entity");
const event_log_entity_1 = require("../entities/event-log.entity");
const active_event_entity_1 = require("../entities/active-event.entity");
const event_choice_entity_1 = require("../entities/event-choice.entity");
const user_entity_1 = require("../entities/user.entity");
const reputation_log_entity_1 = require("../entities/reputation-log.entity");
const good_entity_1 = require("../entities/good.entity");
const ship_entity_1 = require("../entities/ship.entity");
const user_ship_entity_1 = require("../entities/user-ship.entity");
const player_inventory_entity_1 = require("../entities/player-inventory.entity");
const travel_log_entity_1 = require("../entities/travel-log.entity");
let EventModule = class EventModule {
};
exports.EventModule = EventModule;
exports.EventModule = EventModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                event_entity_1.Event,
                event_log_entity_1.EventLog,
                active_event_entity_1.ActiveEvent,
                event_choice_entity_1.EventChoice,
                user_entity_1.User,
                reputation_log_entity_1.ReputationLog,
                good_entity_1.Good,
                ship_entity_1.Ship,
                user_ship_entity_1.UserShip,
                player_inventory_entity_1.PlayerInventory,
                travel_log_entity_1.TravelLog,
            ]),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET ?? 'space-trader-super-secret',
            }),
        ],
        controllers: [event_controller_1.EventController],
        providers: [event_service_1.EventService],
        exports: [event_service_1.EventService],
    })
], EventModule);
//# sourceMappingURL=event.module.js.map