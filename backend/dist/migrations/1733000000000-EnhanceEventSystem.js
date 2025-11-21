"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhanceEventSystem1733000000000 = void 0;
class EnhanceEventSystem1733000000000 {
    name = 'EnhanceEventSystem1733000000000';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "events"
      ADD COLUMN IF NOT EXISTS "event_type" VARCHAR(50) NOT NULL DEFAULT 'travel',
      ADD COLUMN IF NOT EXISTS "event_category" VARCHAR(50) NOT NULL DEFAULT 'safe_passage',
      ADD COLUMN IF NOT EXISTS "cargo_loss_percentage" DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS "fuel_penalty_multiplier" DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS "credit_cost" INT,
      ADD COLUMN IF NOT EXISTS "credit_reward" INT
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "active_events" (
        "id" SERIAL PRIMARY KEY,
        "event_id" INT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
        "planet_id" INT REFERENCES "planets"("id") ON DELETE SET NULL,
        "started_at_turn" INT NOT NULL,
        "expires_at_turn" INT NOT NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_active_event_event" ON "active_events" ("event_id")
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_active_event_planet" ON "active_events" ("planet_id")
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_active_event_active" ON "active_events" ("is_active", "expires_at_turn")
    `);
        await queryRunner.query(`
      ALTER TABLE "event_log"
      ADD COLUMN IF NOT EXISTS "credit_delta" INT,
      ADD COLUMN IF NOT EXISTS "fuel_delta" INT,
      ADD COLUMN IF NOT EXISTS "cargo_lost" INT,
      ADD COLUMN IF NOT EXISTS "event_data" JSONB
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "event_log"
      DROP COLUMN IF EXISTS "event_data",
      DROP COLUMN IF EXISTS "cargo_lost",
      DROP COLUMN IF EXISTS "fuel_delta",
      DROP COLUMN IF EXISTS "credit_delta"
    `);
        await queryRunner.query(`DROP TABLE IF EXISTS "active_events"`);
        await queryRunner.query(`
      ALTER TABLE "events"
      DROP COLUMN IF EXISTS "credit_reward",
      DROP COLUMN IF EXISTS "credit_cost",
      DROP COLUMN IF EXISTS "fuel_penalty_multiplier",
      DROP COLUMN IF EXISTS "cargo_loss_percentage",
      DROP COLUMN IF EXISTS "event_category",
      DROP COLUMN IF EXISTS "event_type"
    `);
    }
}
exports.EnhanceEventSystem1733000000000 = EnhanceEventSystem1733000000000;
//# sourceMappingURL=1733000000000-EnhanceEventSystem.js.map