import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserShipsRelation1732233600000
  implements MigrationInterface
{
  name = 'AddUserShipsRelation1732233600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_ships" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "ship_id" INT NOT NULL REFERENCES "ship"("id") ON DELETE CASCADE,
        "is_active" BOOLEAN NOT NULL DEFAULT false,
        "acquired_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_user_ship_pair" ON "user_ships" ("user_id", "ship_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_ships_user" ON "user_ships" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_ships_ship" ON "user_ships" ("ship_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_user_active_ship" ON "user_ships" ("user_id") WHERE "is_active" = true`,
    );

    await queryRunner.query(`
      INSERT INTO "user_ships" ("user_id", "ship_id", "is_active", "acquired_at")
      SELECT "user_id", "id", true, "acquired_at"
      FROM "ship"
      WHERE "user_id" IS NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "ship"
      DROP COLUMN "user_id"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "ship"
      ADD COLUMN "user_id" INT
    `);
    await queryRunner.query(`
      ALTER TABLE "ship"
      ADD CONSTRAINT "uq_ship_user" UNIQUE ("user_id")
    `);
    await queryRunner.query(`
      ALTER TABLE "ship"
      ADD CONSTRAINT "fk_ship_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      WITH active_assignments AS (
        SELECT DISTINCT ON ("ship_id")
          "ship_id",
          "user_id"
        FROM "user_ships"
        WHERE "is_active" = true
        ORDER BY "ship_id", "id"
      )
      UPDATE "ship" s
      SET "user_id" = aa."user_id"
      FROM active_assignments aa
      WHERE aa."ship_id" = s."id"
    `);

    await queryRunner.query(
      `DROP INDEX "uq_user_active_ship"`,
    );
    await queryRunner.query(
      `DROP INDEX "idx_user_ships_ship"`,
    );
    await queryRunner.query(
      `DROP INDEX "idx_user_ships_user"`,
    );
    await queryRunner.query(
      `DROP INDEX "uq_user_ship_pair"`,
    );

    await queryRunner.query(`
      DROP TABLE "user_ships"
    `);
  }
}


