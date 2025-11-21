"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddShipPositionTracking1732560000000 = void 0;
const STARTING_PLANET_NAME = 'Alpha Prime';
class AddShipPositionTracking1732560000000 {
    name = 'AddShipPositionTracking1732560000000';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "user_ships"
      ADD COLUMN "current_planet_id" INT
    `);
        await queryRunner.query(`
      ALTER TABLE "user_ships"
      ADD CONSTRAINT "fk_user_ships_current_planet"
      FOREIGN KEY ("current_planet_id") REFERENCES "planets"("id")
      ON DELETE SET NULL
    `);
        await queryRunner.query(`
      CREATE INDEX "idx_user_ships_planet"
      ON "user_ships" ("current_planet_id")
    `);
        await queryRunner.query(`
      WITH preferred_planet AS (
        SELECT "id" FROM "planets"
        WHERE "name" = $1
        ORDER BY "id"
        LIMIT 1
      ),
      fallback_planet AS (
        SELECT "id" FROM "planets"
        ORDER BY "id"
        LIMIT 1
      ),
      chosen AS (
        SELECT COALESCE(
          (SELECT "id" FROM preferred_planet),
          (SELECT "id" FROM fallback_planet)
        ) AS "id"
      )
      UPDATE "user_ships" us
      SET "current_planet_id" = chosen."id"
      FROM chosen
      WHERE us."current_planet_id" IS NULL
        AND chosen."id" IS NOT NULL
    `, [STARTING_PLANET_NAME]);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_user_ships_planet"
    `);
        await queryRunner.query(`
      ALTER TABLE "user_ships"
      DROP CONSTRAINT IF EXISTS "fk_user_ships_current_planet"
    `);
        await queryRunner.query(`
      ALTER TABLE "user_ships"
      DROP COLUMN IF EXISTS "current_planet_id"
    `);
    }
}
exports.AddShipPositionTracking1732560000000 = AddShipPositionTracking1732560000000;
//# sourceMappingURL=1732560000000-AddShipPositionTracking.js.map