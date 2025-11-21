import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSessionVersionToUsers1732147200000
  implements MigrationInterface
{
  name = 'AddSessionVersionToUsers1732147200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "session_version" INT NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "session_version"
    `);
  }
}

