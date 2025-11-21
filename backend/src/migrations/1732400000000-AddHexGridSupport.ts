import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHexGridSupport1732400000000 implements MigrationInterface {
  name = 'AddHexGridSupport1732400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create hexes table
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

    // Add hex grid columns to planets table
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

    // Note: hex_q and hex_r start as nullable for backward compatibility
    // After data migration, they should be set to NOT NULL
    // For now, they remain nullable to allow existing planets without hex coordinates

    // Make coordinate_x and coordinate_y nullable for backward compatibility
    await queryRunner.query(`
      ALTER TABLE "planets"
      ALTER COLUMN "coordinate_x" DROP NOT NULL,
      ALTER COLUMN "coordinate_y" DROP NOT NULL
    `);

    // Add index for hex coordinates
    await queryRunner.query(`
      CREATE INDEX "idx_planets_hex_coordinates" ON "planets" ("hex_q", "hex_r")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_planets_hex_coordinates"
    `);

    // Remove hex grid columns from planets
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

    // Restore NOT NULL constraints if needed (we'll leave as-is since there might be nulls)
    // ALTER TABLE "planets"
    // ALTER COLUMN "coordinate_x" SET NOT NULL,
    // ALTER COLUMN "coordinate_y" SET NOT NULL

    // Drop hexes table
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_hexes_coordinates"
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "hexes"
    `);
  }
}

