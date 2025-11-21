"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedCoreGoods1732329600000 = void 0;
const GOOD_SEEDS = [
    ['Hydroponic Produce', 120, 'food'],
    ['Stellar Alloys', 650, 'industrial'],
    ['Quantum Batteries', 900, 'energy'],
    ['Antimatter Vials', 2500, 'energy'],
    ['Exotic Spices', 300, 'luxury'],
    ['Terraforming Kits', 1800, 'technology'],
    ['Cryo Stasis Pods', 1400, 'technology'],
    ['Darkwave Music Chips', 80, 'luxury'],
    ['Orbital Security Drones', 1100, 'technology'],
    ['Nebula Reserve Rum', 220, 'luxury'],
];
class SeedCoreGoods1732329600000 {
    name = 'SeedCoreGoods1732329600000';
    async up(queryRunner) {
        if (GOOD_SEEDS.length === 0) {
            return;
        }
        const values = GOOD_SEEDS.map(([name, basePrice, type]) => `('${name.replace(/'/g, "''")}', ${basePrice}, '${type}')`).join(',\n        ');
        await queryRunner.query(`
      INSERT INTO "goods" ("name", "base_price", "type")
      VALUES
      ${values}
    `);
    }
    async down(queryRunner) {
        if (GOOD_SEEDS.length === 0) {
            return;
        }
        const names = GOOD_SEEDS.map(([name]) => `'${name.replace(/'/g, "''")}'`).join(', ');
        await queryRunner.query(`
      DELETE FROM "goods"
      WHERE "name" IN (${names})
    `);
    }
}
exports.SeedCoreGoods1732329600000 = SeedCoreGoods1732329600000;
//# sourceMappingURL=1732329600000-SeedCoreGoods.js.map