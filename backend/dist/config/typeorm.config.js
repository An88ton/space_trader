"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSourceOptions = void 0;
require("dotenv/config");
const typeorm_1 = require("typeorm");
const _1721596800000_InitialGalaxySchema_1 = require("../migrations/1721596800000-InitialGalaxySchema");
const _1732147200000_AddSessionVersionToUsers_1 = require("../migrations/1732147200000-AddSessionVersionToUsers");
const user_entity_1 = require("../entities/user.entity");
const ship_entity_1 = require("../entities/ship.entity");
const planet_entity_1 = require("../entities/planet.entity");
const good_entity_1 = require("../entities/good.entity");
const planet_market_entity_1 = require("../entities/planet-market.entity");
const player_inventory_entity_1 = require("../entities/player-inventory.entity");
const event_entity_1 = require("../entities/event.entity");
const event_market_effect_entity_1 = require("../entities/event-market-effect.entity");
const event_log_entity_1 = require("../entities/event-log.entity");
const active_event_entity_1 = require("../entities/active-event.entity");
const event_choice_entity_1 = require("../entities/event-choice.entity");
const travel_log_entity_1 = require("../entities/travel-log.entity");
const reputation_log_entity_1 = require("../entities/reputation-log.entity");
const user_ship_entity_1 = require("../entities/user-ship.entity");
const hex_entity_1 = require("../entities/hex.entity");
const _1732233600000_AddUserShipsRelation_1 = require("../migrations/1732233600000-AddUserShipsRelation");
const _1732240800000_AddShipLevels_1 = require("../migrations/1732240800000-AddShipLevels");
const _1732329600000_SeedCoreGoods_1 = require("../migrations/1732329600000-SeedCoreGoods");
const _1732400000000_AddHexGridSupport_1 = require("../migrations/1732400000000-AddHexGridSupport");
const _1732401000000_SeedInitialPlanets_1 = require("../migrations/1732401000000-SeedInitialPlanets");
const _1732560000000_AddShipPositionTracking_1 = require("../migrations/1732560000000-AddShipPositionTracking");
const _1763723248333_AddGoodType_1 = require("../migrations/1763723248333-AddGoodType");
const _1763723302921_AddMarketSellingFlag_1 = require("../migrations/1763723302921-AddMarketSellingFlag");
const _1763724000000_AddFiftyGoods_1 = require("../migrations/1763724000000-AddFiftyGoods");
const _1733000000000_EnhanceEventSystem_1 = require("../migrations/1733000000000-EnhanceEventSystem");
const _1733000001000_SeedEvents_1 = require("../migrations/1733000001000-SeedEvents");
const _1733000002000_AddEventChoices_1 = require("../migrations/1733000002000-AddEventChoices");
const _1733000003000_RebalanceEventProbabilities_1 = require("../migrations/1733000003000-RebalanceEventProbabilities");
exports.dataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'space_trader',
    synchronize: false,
    logging: process.env.TYPEORM_LOGGING === 'true',
    entities: [
        user_entity_1.User,
        ship_entity_1.Ship,
        planet_entity_1.Planet,
        good_entity_1.Good,
        planet_market_entity_1.PlanetMarket,
        player_inventory_entity_1.PlayerInventory,
        event_entity_1.Event,
        event_market_effect_entity_1.EventMarketEffect,
        event_log_entity_1.EventLog,
        active_event_entity_1.ActiveEvent,
        event_choice_entity_1.EventChoice,
        travel_log_entity_1.TravelLog,
        reputation_log_entity_1.ReputationLog,
        user_ship_entity_1.UserShip,
        hex_entity_1.Hex,
    ],
    migrations: [
        _1721596800000_InitialGalaxySchema_1.InitialGalaxySchema1721596800000,
        _1732147200000_AddSessionVersionToUsers_1.AddSessionVersionToUsers1732147200000,
        _1732233600000_AddUserShipsRelation_1.AddUserShipsRelation1732233600000,
        _1732240800000_AddShipLevels_1.AddShipLevels1732240800000,
        _1732329600000_SeedCoreGoods_1.SeedCoreGoods1732329600000,
        _1732400000000_AddHexGridSupport_1.AddHexGridSupport1732400000000,
        _1732401000000_SeedInitialPlanets_1.SeedInitialPlanets1732401000000,
        _1732560000000_AddShipPositionTracking_1.AddShipPositionTracking1732560000000,
        _1763723248333_AddGoodType_1.AddGoodType1763723248333,
        _1763723302921_AddMarketSellingFlag_1.AddMarketSellingFlag1763723302921,
        _1763724000000_AddFiftyGoods_1.AddFiftyGoods1763724000000,
        _1733000000000_EnhanceEventSystem_1.EnhanceEventSystem1733000000000,
        _1733000001000_SeedEvents_1.SeedEvents1733000001000,
        _1733000002000_AddEventChoices_1.AddEventChoices1733000002000,
        _1733000003000_RebalanceEventProbabilities_1.RebalanceEventProbabilities1733000003000,
    ],
};
const dataSource = new typeorm_1.DataSource(exports.dataSourceOptions);
exports.default = dataSource;
//# sourceMappingURL=typeorm.config.js.map