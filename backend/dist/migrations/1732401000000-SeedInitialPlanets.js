"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedInitialPlanets1732401000000 = void 0;
const PLANET_SEEDS = [
    {
        name: 'Alpha Prime',
        hexQ: 0,
        hexR: 0,
        planetType: 'terrestrial',
        faction: 'Terran Federation',
        securityLevel: 'high',
        dockingFee: 150,
        resources: ['minerals', 'food', 'technology'],
        marketModifiers: { food: 0.85, tech: 1.15 },
        eventWeights: { piracy: 0.3, trade_boom: 1.2, natural_disaster: 0.4, faction_war: 0.5, rare_find: 0.6 },
    },
    {
        name: 'New Terra',
        hexQ: 2,
        hexR: -1,
        planetType: 'ocean',
        faction: 'Terran Federation',
        securityLevel: 'medium',
        dockingFee: 120,
        resources: ['food', 'organic'],
        marketModifiers: { food: 0.8 },
        eventWeights: { piracy: 0.5, trade_boom: 1.0, natural_disaster: 0.8, faction_war: 0.6, rare_find: 0.5 },
    },
    {
        name: 'Miners Outpost',
        hexQ: -2,
        hexR: 1,
        planetType: 'barren',
        faction: 'Independent',
        securityLevel: 'low',
        dockingFee: 80,
        resources: ['minerals', 'rare_elements'],
        marketModifiers: { industrial: 0.9 },
        eventWeights: { piracy: 1.3, trade_boom: 0.7, natural_disaster: 0.6, faction_war: 0.8, rare_find: 1.4 },
    },
    {
        name: 'Nexus Station',
        hexQ: 1,
        hexR: 1,
        planetType: 'terrestrial',
        faction: 'Free Traders',
        securityLevel: 'medium',
        dockingFee: 100,
        resources: ['technology', 'luxury', 'industrial'],
        marketModifiers: { luxury: 0.88, tech: 0.92 },
        eventWeights: { piracy: 0.6, trade_boom: 1.3, natural_disaster: 0.3, faction_war: 0.4, rare_find: 0.8 },
    },
    {
        name: 'Deep Void',
        hexQ: -3,
        hexR: 0,
        planetType: 'ice',
        faction: null,
        securityLevel: 'none',
        dockingFee: 200,
        resources: ['rare_elements'],
        marketModifiers: {},
        eventWeights: { piracy: 1.5, trade_boom: 0.5, natural_disaster: 1.2, faction_war: 0.3, rare_find: 1.8 },
    },
    {
        name: 'Solar Haven',
        hexQ: 3,
        hexR: -2,
        planetType: 'desert',
        faction: 'Independent',
        securityLevel: 'medium',
        dockingFee: 90,
        resources: ['energy', 'minerals'],
        marketModifiers: { industrial: 0.95 },
        eventWeights: { piracy: 0.8, trade_boom: 0.9, natural_disaster: 1.0, faction_war: 0.7, rare_find: 0.7 },
    },
    {
        name: 'Xenon Base',
        hexQ: -1,
        hexR: -2,
        planetType: 'toxic',
        faction: 'Xenon Collective',
        securityLevel: 'high',
        dockingFee: 180,
        resources: ['technology', 'rare_elements'],
        marketModifiers: { tech: 0.82, luxury: 1.25 },
        eventWeights: { piracy: 0.4, trade_boom: 0.8, natural_disaster: 0.5, faction_war: 1.4, rare_find: 0.9 },
    },
    {
        name: 'Trade Terminal',
        hexQ: 2,
        hexR: 2,
        planetType: 'terrestrial',
        faction: 'Free Traders',
        securityLevel: 'medium',
        dockingFee: 75,
        resources: ['food', 'luxury', 'industrial'],
        marketModifiers: { food: 0.92, luxury: 0.88, industrial: 0.91 },
        eventWeights: { piracy: 0.5, trade_boom: 1.5, natural_disaster: 0.4, faction_war: 0.5, rare_find: 0.6 },
    },
    {
        name: 'Frozen Reach',
        hexQ: 0,
        hexR: -3,
        planetType: 'ice',
        faction: 'Independent',
        securityLevel: 'low',
        dockingFee: 110,
        resources: ['rare_elements', 'minerals'],
        marketModifiers: { industrial: 1.1 },
        eventWeights: { piracy: 1.0, trade_boom: 0.6, natural_disaster: 1.3, faction_war: 0.7, rare_find: 1.2 },
    },
    {
        name: 'Mercenary Guild Hall',
        hexQ: -2,
        hexR: -1,
        planetType: 'barren',
        faction: 'Mercenary Guild',
        securityLevel: 'medium',
        dockingFee: 130,
        resources: ['technology', 'industrial'],
        marketModifiers: { tech: 1.12, industrial: 1.08 },
        eventWeights: { piracy: 1.2, trade_boom: 0.7, natural_disaster: 0.5, faction_war: 1.3, rare_find: 0.8 },
    },
    {
        name: 'Jungle World',
        hexQ: 1,
        hexR: -2,
        planetType: 'forest',
        faction: 'Terran Federation',
        securityLevel: 'medium',
        dockingFee: 95,
        resources: ['food', 'organic', 'luxury'],
        marketModifiers: { food: 0.87, luxury: 0.9 },
        eventWeights: { piracy: 0.6, trade_boom: 1.1, natural_disaster: 0.9, faction_war: 0.6, rare_find: 0.7 },
    },
    {
        name: 'Volcanic Forge',
        hexQ: -1,
        hexR: 2,
        planetType: 'volcanic',
        faction: 'Independent',
        securityLevel: 'low',
        dockingFee: 85,
        resources: ['minerals', 'industrial', 'energy'],
        marketModifiers: { industrial: 0.83, tech: 1.18 },
        eventWeights: { piracy: 1.1, trade_boom: 0.8, natural_disaster: 1.5, faction_war: 0.9, rare_find: 0.9 },
    },
    {
        name: 'Gas Giant Refinery',
        hexQ: 4,
        hexR: -1,
        planetType: 'gas_giant',
        faction: 'Free Traders',
        securityLevel: 'medium',
        dockingFee: 140,
        resources: ['energy', 'industrial'],
        marketModifiers: { industrial: 0.89 },
        eventWeights: { piracy: 0.7, trade_boom: 1.0, natural_disaster: 0.7, faction_war: 0.5, rare_find: 0.5 },
    },
    {
        name: 'Sanctuary Point',
        hexQ: 0,
        hexR: 3,
        planetType: 'ocean',
        faction: 'Terran Federation',
        securityLevel: 'high',
        dockingFee: 160,
        resources: ['food', 'organic', 'luxury'],
        marketModifiers: { food: 0.84, luxury: 0.93 },
        eventWeights: { piracy: 0.3, trade_boom: 1.2, natural_disaster: 0.8, faction_war: 0.4, rare_find: 0.6 },
    },
    {
        name: 'Outer Rim Outpost',
        hexQ: -3,
        hexR: 2,
        planetType: 'barren',
        faction: null,
        securityLevel: 'low',
        dockingFee: 70,
        resources: ['minerals'],
        marketModifiers: {},
        eventWeights: { piracy: 1.4, trade_boom: 0.5, natural_disaster: 0.8, faction_war: 0.6, rare_find: 1.1 },
    },
    {
        name: 'Stellar Hub',
        hexQ: 2,
        hexR: 0,
        planetType: 'terrestrial',
        faction: 'Free Traders',
        securityLevel: 'medium',
        dockingFee: 105,
        resources: ['technology', 'luxury', 'food'],
        marketModifiers: { tech: 0.91, luxury: 0.89 },
        eventWeights: { piracy: 0.5, trade_boom: 1.4, natural_disaster: 0.4, faction_war: 0.5, rare_find: 0.7 },
    },
    {
        name: 'Mining Colony VII',
        hexQ: -2,
        hexR: 3,
        planetType: 'barren',
        faction: 'Independent',
        securityLevel: 'low',
        dockingFee: 88,
        resources: ['minerals', 'rare_elements'],
        marketModifiers: { industrial: 0.94 },
        eventWeights: { piracy: 1.1, trade_boom: 0.7, natural_disaster: 0.7, faction_war: 0.8, rare_find: 1.3 },
    },
    {
        name: 'Eden Prime',
        hexQ: 1,
        hexR: 3,
        planetType: 'forest',
        faction: 'Terran Federation',
        securityLevel: 'high',
        dockingFee: 170,
        resources: ['food', 'organic', 'luxury'],
        marketModifiers: { food: 0.79, luxury: 0.85 },
        eventWeights: { piracy: 0.2, trade_boom: 1.3, natural_disaster: 0.6, faction_war: 0.3, rare_find: 0.5 },
    },
    {
        name: 'Pirate Den',
        hexQ: -4,
        hexR: 1,
        planetType: 'barren',
        faction: null,
        securityLevel: 'none',
        dockingFee: 250,
        resources: ['industrial'],
        marketModifiers: { luxury: 1.3, tech: 1.25 },
        eventWeights: { piracy: 1.8, trade_boom: 0.3, natural_disaster: 0.6, faction_war: 0.7, rare_find: 1.5 },
    },
    {
        name: 'Research Station Alpha',
        hexQ: 3,
        hexR: 1,
        planetType: 'terrestrial',
        faction: 'Terran Federation',
        securityLevel: 'high',
        dockingFee: 145,
        resources: ['technology', 'luxury'],
        marketModifiers: { tech: 0.75, luxury: 0.95 },
        eventWeights: { piracy: 0.4, trade_boom: 1.1, natural_disaster: 0.5, faction_war: 0.6, rare_find: 1.0 },
    },
];
class SeedInitialPlanets1732401000000 {
    name = 'SeedInitialPlanets1732401000000';
    async up(queryRunner) {
        if (PLANET_SEEDS.length === 0) {
            return;
        }
        for (const planet of PLANET_SEEDS) {
            await queryRunner.query(`
        INSERT INTO "hexes" ("q", "r", "has_planet")
        VALUES (${planet.hexQ}, ${planet.hexR}, true)
        ON CONFLICT ("q", "r") DO UPDATE SET "has_planet" = true
      `);
        }
        const hexCoordsList = PLANET_SEEDS.map((p) => `(${p.hexQ}, ${p.hexR})`).join(', ');
        const hexIds = await queryRunner.query(`
      SELECT "id", "q", "r" FROM "hexes" WHERE ("q", "r") IN (${hexCoordsList})
    `);
        const hexIdMap = new Map();
        for (const hex of hexIds) {
            hexIdMap.set(`${hex.q},${hex.r}`, hex.id);
        }
        for (const planet of PLANET_SEEDS) {
            const hexId = hexIdMap.get(`${planet.hexQ},${planet.hexR}`);
            const resourcesJson = JSON.stringify(planet.resources);
            const marketModifiersJson = planet.marketModifiers && Object.keys(planet.marketModifiers).length > 0
                ? JSON.stringify(planet.marketModifiers)
                : null;
            const eventWeightsJson = JSON.stringify(planet.eventWeights);
            const faction = planet.faction ? planet.faction.replace(/'/g, "''") : null;
            const name = planet.name.replace(/'/g, "''");
            await queryRunner.query(`
        INSERT INTO "planets" (
          "name", "hex_q", "hex_r", "hex_id", "planet_type", 
          "market_modifiers", "resources", "faction", "security_level", 
          "event_weights", "docking_fee"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10::jsonb, $11)
        `, [
                name,
                planet.hexQ,
                planet.hexR,
                hexId || null,
                planet.planetType,
                marketModifiersJson,
                resourcesJson,
                faction,
                planet.securityLevel,
                eventWeightsJson,
                planet.dockingFee,
            ]);
        }
    }
    async down(queryRunner) {
        if (PLANET_SEEDS.length === 0) {
            return;
        }
        const names = PLANET_SEEDS.map((planet) => `'${planet.name.replace(/'/g, "''")}'`).join(', ');
        await queryRunner.query(`
      DELETE FROM "planets"
      WHERE "name" IN (${names})
    `);
        const hexCoords = PLANET_SEEDS.map((p) => `(${p.hexQ}, ${p.hexR})`).join(', ');
        await queryRunner.query(`
      UPDATE "hexes"
      SET "has_planet" = false
      WHERE ("q", "r") IN (${hexCoords})
        AND NOT EXISTS (
          SELECT 1 FROM "planets" WHERE "hex_q" = "hexes"."q" AND "hex_r" = "hexes"."r"
        )
    `);
    }
}
exports.SeedInitialPlanets1732401000000 = SeedInitialPlanets1732401000000;
//# sourceMappingURL=1732401000000-SeedInitialPlanets.js.map