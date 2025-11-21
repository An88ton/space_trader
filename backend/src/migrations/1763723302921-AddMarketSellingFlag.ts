import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMarketSellingFlag1763723302921 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add is_selling column to planet_market table
        await queryRunner.query(`
            ALTER TABLE "planet_market"
            ADD COLUMN "is_selling" BOOLEAN NOT NULL DEFAULT true
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "planet_market"
            DROP COLUMN "is_selling"
        `);
    }

}
