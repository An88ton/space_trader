"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddEventChoices1733000002000 = void 0;
class AddEventChoices1733000002000 {
    name = 'AddEventChoices1733000002000';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "events"
      ADD COLUMN IF NOT EXISTS "requires_choice" BOOLEAN NOT NULL DEFAULT false
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "event_choices" (
        "id" SERIAL PRIMARY KEY,
        "event_id" INT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
        "label" VARCHAR(100) NOT NULL,
        "description" TEXT,
        "outcome" JSONB NOT NULL,
        "sort_order" INT NOT NULL DEFAULT 0
      )
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_event_choice_event" ON "event_choices" ("event_id")
    `);
        await queryRunner.query(`
      UPDATE "events"
      SET "requires_choice" = true
      WHERE "event_category" = 'pirate_ambush'
    `);
        const pirateEvent = await queryRunner.query(`
      SELECT "id" FROM "events" WHERE "event_category" = 'pirate_ambush' LIMIT 1
    `);
        if (pirateEvent.length > 0) {
            const eventId = pirateEvent[0].id;
            await queryRunner.query(`INSERT INTO "event_choices" ("event_id", "label", "description", "outcome", "sort_order")
         VALUES ($1, $2, $3, $4, $5)`, [
                eventId,
                'Fight Back',
                'Engage the pirates in combat. High risk of cargo or ship damage, but you might keep everything.',
                JSON.stringify({
                    cargoLossPercentage: 0.4,
                    reputationChange: 5,
                    description: 'You fight back bravely! You lose some cargo in the battle, but your reputation increases for standing up to the pirates.',
                }),
                0,
            ]);
            await queryRunner.query(`INSERT INTO "event_choices" ("event_id", "label", "description", "outcome", "sort_order")
         VALUES ($1, $2, $3, $4, $5)`, [
                eventId,
                'Pay the Bribe',
                'Hand over credits to avoid violence. Keeps your cargo safe but costs money.',
                JSON.stringify({
                    creditsCost: 500,
                    reputationChange: -3,
                    description: 'You pay the pirates to leave you alone. Your cargo is safe, but you lose credits and some reputation.',
                }),
                1,
            ]);
            await queryRunner.query(`INSERT INTO "event_choices" ("event_id", "label", "description", "outcome", "sort_order")
         VALUES ($1, $2, $3, $4, $5)`, [
                eventId,
                'Surrender Cargo',
                'Give them a portion of your cargo to avoid conflict. Loses cargo but no credits.',
                JSON.stringify({
                    cargoLossPercentage: 0.3,
                    reputationChange: -2,
                    description: 'You surrender some cargo to the pirates. They take what they want and leave.',
                }),
                2,
            ]);
        }
        await queryRunner.query(`
      UPDATE "events"
      SET "requires_choice" = true
      WHERE "event_category" = 'black_market_offer'
    `);
        const blackMarketEvent = await queryRunner.query(`
      SELECT "id" FROM "events" WHERE "event_category" = 'black_market_offer' LIMIT 1
    `);
        if (blackMarketEvent.length > 0) {
            const eventId = blackMarketEvent[0].id;
            await queryRunner.query(`INSERT INTO "event_choices" ("event_id", "label", "description", "outcome", "sort_order")
         VALUES ($1, $2, $3, $4, $5)`, [
                eventId,
                'Accept the Offer',
                'Buy cheap goods from the black market. Gain goods at discount prices but lose reputation.',
                JSON.stringify({
                    creditsReward: 0,
                    reputationChange: -10,
                    description: 'You accept the black market deal. You gain access to cheap goods, but your reputation suffers.',
                }),
                0,
            ]);
            await queryRunner.query(`INSERT INTO "event_choices" ("event_id", "label", "description", "outcome", "sort_order")
         VALUES ($1, $2, $3, $4, $5)`, [
                eventId,
                'Decline the Offer',
                'Refuse to deal with criminals. Maintain your reputation.',
                JSON.stringify({
                    reputationChange: 5,
                    description: 'You decline the black market offer, maintaining your integrity. Your reputation increases slightly.',
                }),
                1,
            ]);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "event_choices"`);
        await queryRunner.query(`
      ALTER TABLE "events"
      DROP COLUMN IF EXISTS "requires_choice"
    `);
    }
}
exports.AddEventChoices1733000002000 = AddEventChoices1733000002000;
//# sourceMappingURL=1733000002000-AddEventChoices.js.map