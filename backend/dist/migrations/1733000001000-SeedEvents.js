"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedEvents1733000001000 = void 0;
const events = [
    {
        name: 'Pirate Ambush',
        description: 'Pirates intercept your ship! They demand cargo, damage your engines, or force you to pay a bribe.',
        eventType: 'travel',
        eventCategory: 'pirate_ambush',
        probability: 15,
        reputationChange: -5,
        cargoLossPercentage: 0.3,
        fuelPenaltyMultiplier: 1.5,
        creditCost: 500,
    },
    {
        name: 'Engine Failure',
        description: 'Your engines malfunction mid-journey, consuming extra fuel.',
        eventType: 'travel',
        eventCategory: 'engine_failure',
        probability: 10,
        reputationChange: 0,
        fuelPenaltyMultiplier: 1.5,
    },
    {
        name: 'Fuel Leak',
        description: 'A fuel leak is detected. You lose a portion of your fuel.',
        eventType: 'travel',
        eventCategory: 'fuel_leak',
        probability: 8,
        reputationChange: 0,
        cargoLossPercentage: 0.15,
    },
    {
        name: 'Safe Passage',
        description: 'A peaceful journey through space. No incidents.',
        eventType: 'travel',
        eventCategory: 'safe_passage',
        probability: 50,
        reputationChange: 5,
    },
    {
        name: 'Meteor Shower',
        description: 'A meteor shower damages some of your cargo.',
        eventType: 'travel',
        eventCategory: 'meteor_shower',
        probability: 10,
        reputationChange: 0,
    },
    {
        name: 'Space Patrol',
        description: 'You encounter friendly space patrol. Your reputation improves.',
        eventType: 'travel',
        eventCategory: 'space_patrol',
        probability: 7,
        reputationChange: 10,
    },
    {
        name: 'Epidemic',
        description: 'An epidemic breaks out! Medicine demand skyrockets.',
        eventType: 'market',
        eventCategory: 'epidemic',
        probability: 20,
        reputationChange: 0,
        marketEffects: [
            {
                goodType: 'organic',
                priceModifier: 3.0,
                durationTurns: 5,
            },
        ],
    },
    {
        name: 'Harvest Boom',
        description: 'A record harvest increases food supply and lowers prices.',
        eventType: 'market',
        eventCategory: 'harvest_boom',
        probability: 25,
        reputationChange: 0,
        marketEffects: [
            {
                goodType: 'food',
                priceModifier: 0.7,
                durationTurns: 5,
            },
        ],
    },
    {
        name: 'Mining Rush',
        description: 'New mining operations flood the market with metals.',
        eventType: 'market',
        eventCategory: 'mining_rush',
        probability: 20,
        reputationChange: 0,
        marketEffects: [
            {
                goodType: 'minerals',
                priceModifier: 0.8,
                durationTurns: 5,
            },
        ],
    },
    {
        name: 'Planetary Famine',
        description: 'A famine increases food demand and prices significantly.',
        eventType: 'market',
        eventCategory: 'planetary_famine',
        probability: 15,
        reputationChange: 0,
        marketEffects: [
            {
                goodType: 'food',
                priceModifier: 2.0,
                durationTurns: 5,
            },
        ],
    },
    {
        name: 'Trade Festival',
        description: 'A planet-wide trade festival slightly lowers all prices.',
        eventType: 'market',
        eventCategory: 'trade_festival',
        probability: 10,
        reputationChange: 5,
        marketEffects: [
            {
                priceModifier: 0.9,
                durationTurns: 5,
            },
        ],
    },
    {
        name: 'Smuggling Crackdown',
        description: 'Authorities crack down on contraband. Selling illegal goods reduces reputation.',
        eventType: 'market',
        eventCategory: 'smuggling_crackdown',
        probability: 10,
        reputationChange: 0,
        marketEffects: [],
    },
    {
        name: 'Black Market Offer',
        description: 'A shady dealer offers cheap goods, but trading with them reduces your reputation.',
        eventType: 'player_status',
        eventCategory: 'black_market_offer',
        probability: 25,
        reputationChange: -10,
        creditReward: 0,
    },
    {
        name: 'Investor Interest',
        description: 'An investor offers you credits, but future taxes will apply.',
        eventType: 'player_status',
        eventCategory: 'investor_interest',
        probability: 20,
        reputationChange: 5,
        creditReward: 2000,
    },
    {
        name: 'Merchant Guild Reward',
        description: 'The Merchant Guild rewards you for your trading efforts.',
        eventType: 'player_status',
        eventCategory: 'merchant_guild_reward',
        probability: 20,
        reputationChange: 15,
        creditReward: 500,
    },
    {
        name: 'Insurance Payout',
        description: 'You receive an insurance payout for previous cargo losses.',
        eventType: 'player_status',
        eventCategory: 'insurance_payout',
        probability: 15,
        reputationChange: 0,
        creditReward: 1000,
    },
];
class SeedEvents1733000001000 {
    name = 'SeedEvents1733000001000';
    async up(queryRunner) {
        for (const eventSeed of events) {
            const eventResult = await queryRunner.query(`INSERT INTO "events" (
          "name", "description", "event_type", "event_category", 
          "probability", "reputation_change", "cargo_loss_percentage", 
          "fuel_penalty_multiplier", "credit_cost", "credit_reward"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING "id"`, [
                eventSeed.name,
                eventSeed.description,
                eventSeed.eventType,
                eventSeed.eventCategory,
                eventSeed.probability,
                eventSeed.reputationChange,
                eventSeed.cargoLossPercentage || null,
                eventSeed.fuelPenaltyMultiplier || null,
                eventSeed.creditCost || null,
                eventSeed.creditReward || null,
            ]);
            const eventId = eventResult[0].id;
            if (eventSeed.marketEffects && eventSeed.marketEffects.length > 0) {
                for (const effect of eventSeed.marketEffects) {
                    let goodId = null;
                    if (effect.goodType) {
                        const goodResult = await queryRunner.query(`SELECT "id" FROM "goods" WHERE "type" = $1 LIMIT 1`, [effect.goodType]);
                        goodId = goodResult.length > 0 ? goodResult[0].id : null;
                    }
                    await queryRunner.query(`INSERT INTO "event_market_effects" (
              "event_id", "planet_id", "good_id", "price_modifier", "duration_turns"
            ) VALUES ($1, $2, $3, $4, $5)`, [eventId, null, goodId, effect.priceModifier, effect.durationTurns]);
                }
            }
        }
    }
    async down(queryRunner) {
        for (const eventSeed of events) {
            await queryRunner.query(`DELETE FROM "events" WHERE "name" = $1 AND "event_category" = $2`, [eventSeed.name, eventSeed.eventCategory]);
        }
    }
}
exports.SeedEvents1733000001000 = SeedEvents1733000001000;
//# sourceMappingURL=1733000001000-SeedEvents.js.map