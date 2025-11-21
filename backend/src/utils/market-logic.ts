import { Planet } from '../entities/planet.entity';
import { Good } from '../entities/good.entity';
import { PlanetMarket } from '../entities/planet-market.entity';

/**
 * Space-relevant good types that match resource types.
 * These types represent different categories of goods in the space trading economy.
 */
export const GOOD_TYPES = [
  'minerals',        // Raw materials and ores
  'energy',          // Power sources, batteries, fuel
  'food',            // Agricultural products, rations
  'technology',      // Advanced tech, devices, equipment
  'luxury',          // High-value items, entertainment, luxury goods
  'industrial',      // Manufacturing materials, alloys, components
  'organic',         // Biological materials, organic compounds
  'rare_elements',   // Exotic elements, rare materials
] as const;

export type GoodType = (typeof GOOD_TYPES)[number];

/**
 * Determines if a planet should sell (produce) a good based on its resources.
 * Planets with a resource produce goods of that type.
 * 
 * @param planet - The planet to check
 * @param good - The good to check
 * @returns true if the planet should sell this good (has the matching resource)
 */
export function shouldPlanetSellGood(planet: Planet, good: Good): boolean {
  if (!planet.resources || planet.resources.length === 0) {
    return false;
  }
  
  // Planet sells goods of types matching its resources
  return planet.resources.includes(good.type);
}

/**
 * Determines if a planet should buy a good based on its resources.
 * Planets without a resource need to buy goods of that type.
 * 
 * @param planet - The planet to check
 * @param good - The good to check
 * @returns true if the planet should buy this good (needs the resource)
 */
export function shouldPlanetBuyGood(planet: Planet, good: Good): boolean {
  if (!planet.resources || planet.resources.length === 0) {
    // Planets with no resources buy all goods
    return true;
  }
  
  // Planet buys goods of types it doesn't have resources for
  return !planet.resources.includes(good.type);
}

/**
 * Filters goods that a planet should sell (produce) based on its resources.
 * These are goods the planet produces and offers for sale.
 * 
 * @param planet - The planet to check
 * @param allGoods - All available goods
 * @returns Array of goods the planet should sell
 */
export function getGoodsPlanetSells(planet: Planet, allGoods: Good[]): Good[] {
  return allGoods.filter((good) => shouldPlanetSellGood(planet, good));
}

/**
 * Filters goods that a planet should buy based on its resources.
 * These are goods the planet needs and will purchase.
 * 
 * @param planet - The planet to check
 * @param allGoods - All available goods
 * @returns Array of goods the planet should buy
 */
export function getGoodsPlanetBuys(planet: Planet, allGoods: Good[]): Good[] {
  return allGoods.filter((good) => shouldPlanetBuyGood(planet, good));
}

/**
 * Calculates the price for a good on a planet's market.
 * Planets selling goods (with resources) typically offer lower prices.
 * Planets buying goods (without resources) typically offer higher prices.
 * 
 * @param planet - The planet
 * @param good - The good
 * @param isSelling - Whether the planet is selling (true) or buying (false)
 * @returns The calculated price
 */
export function calculateMarketPrice(
  planet: Planet,
  good: Good,
  isSelling: boolean,
): number {
  let price = good.basePrice;

  // Apply market modifiers if they exist
  if (planet.marketModifiers && planet.marketModifiers[good.type]) {
    price *= planet.marketModifiers[good.type];
  }

  // Planets selling goods (with resources) offer lower prices (abundance)
  // Planets buying goods (without resources) offer higher prices (demand)
  if (isSelling) {
    // Selling: typically 0.8-1.0x base price (cheaper due to abundance)
    price *= 0.85 + Math.random() * 0.15; // 0.85-1.0
  } else {
    // Buying: typically 1.1-1.3x base price (higher due to demand)
    price *= 1.1 + Math.random() * 0.2; // 1.1-1.3
  }

  return Math.round(price);
}

/**
 * Creates a market entry for a planet and good.
 * 
 * @param planet - The planet
 * @param good - The good
 * @param isSelling - Whether the planet is selling (true) or buying (false)
 * @returns A new PlanetMarket entity
 */
export function createMarketEntry(
  planet: Planet,
  good: Good,
  isSelling: boolean,
): PlanetMarket {
  const market = new PlanetMarket();
  market.planet = planet;
  market.good = good;
  market.isSelling = isSelling;
  market.price = calculateMarketPrice(planet, good, isSelling);
  market.demandModifier = 1.0;
  market.updatedAt = new Date();
  return market;
}

