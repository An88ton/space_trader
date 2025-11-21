import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGoodType1763723248333 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add type column to goods table (nullable first, then we'll update and make it NOT NULL)
        await queryRunner.query(`
            ALTER TABLE "goods"
            ADD COLUMN "type" VARCHAR(50)
        `);

        // Update existing goods with their types based on name matching
        const goodTypeMapping: Record<string, string> = {
            'Hydroponic Produce': 'food',
            'Stellar Alloys': 'industrial',
            'Quantum Batteries': 'energy',
            'Antimatter Vials': 'energy',
            'Exotic Spices': 'luxury',
            'Terraforming Kits': 'technology',
            'Cryo Stasis Pods': 'technology',
            'Darkwave Music Chips': 'luxury',
            'Orbital Security Drones': 'technology',
            'Nebula Reserve Rum': 'luxury',
        };

        for (const [name, type] of Object.entries(goodTypeMapping)) {
            await queryRunner.query(`
                UPDATE "goods"
                SET "type" = $1
                WHERE "name" = $2
            `, [type, name]);
        }

        // Set default for any remaining goods and make column NOT NULL
        await queryRunner.query(`
            UPDATE "goods"
            SET "type" = 'industrial'
            WHERE "type" IS NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "goods"
            ALTER COLUMN "type" SET NOT NULL,
            ALTER COLUMN "type" SET DEFAULT 'industrial'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "goods"
            DROP COLUMN "type"
        `);
    }

}
