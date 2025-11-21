"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddGoodType1763723248333 = void 0;
class AddGoodType1763723248333 {
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "goods"
            ADD COLUMN "type" VARCHAR(50)
        `);
        const goodTypeMapping = {
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
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "goods"
            DROP COLUMN "type"
        `);
    }
}
exports.AddGoodType1763723248333 = AddGoodType1763723248333;
//# sourceMappingURL=1763723248333-AddGoodType.js.map