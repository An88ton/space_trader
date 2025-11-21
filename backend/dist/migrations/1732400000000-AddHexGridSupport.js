"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddHexGridSupport1732400000000 = void 0;
class AddHexGridSupport1732400000000 {
    name = 'AddHexGridSupport1732400000000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE "hexes" (
        "id" SERIAL PRIMARY KEY,
        "q" INT NOT NULL,
        "r" INT NOT NULL,
        "has_planet" BOOLEAN DEFAULT false,
        UNIQUE ("q", "r")
      )
    `);
        await queryRunner.query(`
      CREATE INDEX "idx_hexes_coordinates" ON "hexes" ("q", "r")
    `);
        await queryRunner.query(`
      ALTER TABLE "planets"
      ADD COLUMN "hex_q" INT,
      ADD COLUMN "hex_r" INT,
      ADD COLUMN "hex_id" INT REFERENCES "hexes"("id") ON DELETE SET NULL,
      ADD COLUMN "planet_type" VARCHAR(50) DEFAULT 'terrestrial',
      ADD COLUMN "market_modifiers" JSONB,
      ADD COLUMN "resources" JSONB,
      ADD COLUMN "faction" VARCHAR(50),
      ADD COLUMN "security_level" VARCHAR(50) DEFAULT 'medium',
      ADD COLUMN "event_weights" JSONB
    `);
        await queryRunner.query(`
      ALTER TABLE "planets"
      ALTER COLUMN "coordinate_x" DROP NOT NULL,
      ALTER COLUMN "coordinate_y" DROP NOT NULL
    `);
        await queryRunner.query(`
      CREATE INDEX "idx_planets_hex_coordinates" ON "planets" ("hex_q", "hex_r")
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_planets_hex_coordinates"
    `);
        await queryRunner.query(`
      ALTER TABLE "planets"
      DROP COLUMN IF EXISTS "hex_q",
      DROP COLUMN IF EXISTS "hex_r",
      DROP COLUMN IF EXISTS "hex_id",
      DROP COLUMN IF EXISTS "planet_type",
      DROP COLUMN IF EXISTS "market_modifiers",
      DROP COLUMN IF EXISTS "resources",
      DROP COLUMN IF EXISTS "faction",
      DROP COLUMN IF EXISTS "security_level",
      DROP COLUMN IF EXISTS "event_weights"
    `);
        await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_hexes_coordinates"
    `);
        await queryRunner.query(`
      DROP TABLE IF EXISTS "hexes"
    `);
    }
}
exports.AddHexGridSupport1732400000000 = AddHexGridSupport1732400000000;
//# sourceMappingURL=1732400000000-AddHexGridSupport.js.map