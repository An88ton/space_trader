"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GOOD_TYPES = void 0;
exports.shouldPlanetSellGood = shouldPlanetSellGood;
exports.shouldPlanetBuyGood = shouldPlanetBuyGood;
exports.getGoodsPlanetSells = getGoodsPlanetSells;
exports.getGoodsPlanetBuys = getGoodsPlanetBuys;
exports.calculateMarketPrice = calculateMarketPrice;
exports.createMarketEntry = createMarketEntry;
const planet_market_entity_1 = require("../entities/planet-market.entity");
exports.GOOD_TYPES = [
    'minerals',
    'energy',
    'food',
    'technology',
    'luxury',
    'industrial',
    'organic',
    'rare_elements',
];
function shouldPlanetSellGood(planet, good) {
    if (!planet.resources || planet.resources.length === 0) {
        return false;
    }
    return planet.resources.includes(good.type);
}
function shouldPlanetBuyGood(planet, good) {
    if (!planet.resources || planet.resources.length === 0) {
        return true;
    }
    return !planet.resources.includes(good.type);
}
function getGoodsPlanetSells(planet, allGoods) {
    return allGoods.filter((good) => shouldPlanetSellGood(planet, good));
}
function getGoodsPlanetBuys(planet, allGoods) {
    return allGoods.filter((good) => shouldPlanetBuyGood(planet, good));
}
function calculateMarketPrice(planet, good, isSelling) {
    let price = good.basePrice;
    if (planet.marketModifiers && planet.marketModifiers[good.type]) {
        price *= planet.marketModifiers[good.type];
    }
    if (isSelling) {
        price *= 0.85 + Math.random() * 0.15;
    }
    else {
        price *= 1.1 + Math.random() * 0.2;
    }
    return Math.round(price);
}
function createMarketEntry(planet, good, isSelling) {
    const market = new planet_market_entity_1.PlanetMarket();
    market.planet = planet;
    market.good = good;
    market.isSelling = isSelling;
    market.price = calculateMarketPrice(planet, good, isSelling);
    market.demandModifier = 1.0;
    market.updatedAt = new Date();
    return market;
}
//# sourceMappingURL=market-logic.js.map