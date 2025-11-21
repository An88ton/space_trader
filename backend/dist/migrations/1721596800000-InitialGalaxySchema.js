"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialGalaxySchema1721596800000 = void 0;
class InitialGalaxySchema1721596800000 {
    name = 'InitialGalaxySchema1721596800000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL PRIMARY KEY,
        "email" VARCHAR(255) UNIQUE NOT NULL,
        "password_hash" VARCHAR(255) NOT NULL,
        "username" VARCHAR(50) UNIQUE NOT NULL,
        "reputation" INT DEFAULT 0,
        "rank" VARCHAR(50) DEFAULT 'Captain',
        "credits" INT DEFAULT 1000,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "ship" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INT UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
        "name" VARCHAR(50) NOT NULL,
        "cargo_capacity" INT NOT NULL,
        "fuel_capacity" INT NOT NULL,
        "fuel_current" INT NOT NULL,
        "speed" INT NOT NULL,
        "acquired_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "planets" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(100) NOT NULL,
        "coordinate_x" INT NOT NULL,
        "coordinate_y" INT NOT NULL,
        "docking_fee" INT DEFAULT 100
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "goods" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(100) NOT NULL,
        "base_price" INT NOT NULL
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "planet_market" (
        "id" SERIAL PRIMARY KEY,
        "planet_id" INT REFERENCES "planets"("id") ON DELETE CASCADE,
        "good_id" INT REFERENCES "goods"("id") ON DELETE CASCADE,
        "price" INT NOT NULL,
        "demand_modifier" DOUBLE PRECISION DEFAULT 1.0,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await queryRunner.query(`CREATE INDEX "idx_planet_market_planet" ON "planet_market" ("planet_id")`);
        await queryRunner.query(`CREATE INDEX "idx_planet_market_good" ON "planet_market" ("good_id")`);
        await queryRunner.query(`
      CREATE TABLE "player_inventory" (
        "id" SERIAL PRIMARY KEY,
        "ship_id" INT REFERENCES "ship"("id") ON DELETE CASCADE,
        "good_id" INT REFERENCES "goods"("id") ON DELETE CASCADE,
        "quantity" INT DEFAULT 0
      )
    `);
        await queryRunner.query(`CREATE INDEX "idx_player_inventory_ship" ON "player_inventory" ("ship_id")`);
        await queryRunner.query(`CREATE INDEX "idx_player_inventory_good" ON "player_inventory" ("good_id")`);
        await queryRunner.query(`
      CREATE TABLE "events" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(100) NOT NULL,
        "description" TEXT,
        "probability" DOUBLE PRECISION NOT NULL,
        "reputation_change" INT DEFAULT 0
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "event_market_effects" (
        "id" SERIAL PRIMARY KEY,
        "event_id" INT REFERENCES "events"("id") ON DELETE CASCADE,
        "planet_id" INT REFERENCES "planets"("id"),
        "good_id" INT REFERENCES "goods"("id"),
        "price_modifier" DOUBLE PRECISION NOT NULL,
        "duration_turns" INT DEFAULT 3
      )
    `);
        await queryRunner.query(`CREATE INDEX "idx_event_effect_event" ON "event_market_effects" ("event_id")`);
        await queryRunner.query(`
      CREATE TABLE "event_log" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INT REFERENCES "users"("id") ON DELETE CASCADE,
        "event_id" INT REFERENCES "events"("id") ON DELETE SET NULL,
        "occurred_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "reputation_delta" INT,
        "notes" TEXT
      )
    `);
        await queryRunner.query(`CREATE INDEX "idx_event_log_user" ON "event_log" ("user_id")`);
        await queryRunner.query(`CREATE INDEX "idx_event_log_event" ON "event_log" ("event_id")`);
        await queryRunner.query(`
      CREATE TABLE "travel_log" (
        "id" SERIAL PRIMARY KEY,
        "ship_id" INT REFERENCES "ship"("id") ON DELETE CASCADE,
        "origin_planet_id" INT REFERENCES "planets"("id"),
        "destination_planet_id" INT REFERENCES "planets"("id"),
        "distance" INT NOT NULL,
        "fuel_used" INT NOT NULL,
        "travel_turn" INT NOT NULL,
        "event_id" INT REFERENCES "events"("id"),
        "completed_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await queryRunner.query(`CREATE INDEX "idx_travel_log_ship" ON "travel_log" ("ship_id")`);
        await queryRunner.query(`CREATE INDEX "idx_travel_log_event" ON "travel_log" ("event_id")`);
        await queryRunner.query(`
      CREATE TABLE "reputation_log" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INT REFERENCES "users"("id"),
        "delta" INT NOT NULL,
        "reason" VARCHAR(255),
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await queryRunner.query(`CREATE INDEX "idx_reputation_log_user" ON "reputation_log" ("user_id")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "idx_reputation_log_user"`);
        await queryRunner.query(`DROP INDEX "idx_travel_log_event"`);
        await queryRunner.query(`DROP INDEX "idx_travel_log_ship"`);
        await queryRunner.query(`DROP INDEX "idx_event_log_event"`);
        await queryRunner.query(`DROP INDEX "idx_event_log_user"`);
        await queryRunner.query(`DROP INDEX "idx_event_effect_event"`);
        await queryRunner.query(`DROP INDEX "idx_player_inventory_good"`);
        await queryRunner.query(`DROP INDEX "idx_player_inventory_ship"`);
        await queryRunner.query(`DROP INDEX "idx_planet_market_good"`);
        await queryRunner.query(`DROP INDEX "idx_planet_market_planet"`);
        await queryRunner.query(`DROP TABLE "reputation_log"`);
        await queryRunner.query(`DROP TABLE "travel_log"`);
        await queryRunner.query(`DROP TABLE "event_log"`);
        await queryRunner.query(`DROP TABLE "event_market_effects"`);
        await queryRunner.query(`DROP TABLE "events"`);
        await queryRunner.query(`DROP TABLE "player_inventory"`);
        await queryRunner.query(`DROP TABLE "planet_market"`);
        await queryRunner.query(`DROP TABLE "goods"`);
        await queryRunner.query(`DROP TABLE "ship"`);
        await queryRunner.query(`DROP TABLE "planets"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
exports.InitialGalaxySchema1721596800000 = InitialGalaxySchema1721596800000;
//# sourceMappingURL=1721596800000-InitialGalaxySchema.js.map