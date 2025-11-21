"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedCoreGoods1732329600000 = void 0;
const GOOD_SEEDS = [
    ['Hydroponic Produce', 120],
    ['Stellar Alloys', 650],
    ['Quantum Batteries', 900],
    ['Antimatter Vials', 2500],
    ['Exotic Spices', 300],
    ['Terraforming Kits', 1800],
    ['Cryo Stasis Pods', 1400],
    ['Darkwave Music Chips', 80],
    ['Orbital Security Drones', 1100],
    ['Nebula Reserve Rum', 220],
];
class SeedCoreGoods1732329600000 {
    name = 'SeedCoreGoods1732329600000';
    async up(queryRunner) {
        if (GOOD_SEEDS.length === 0) {
            return;
        }
        const values = GOOD_SEEDS.map(([name, basePrice]) => `('${name.replace(/'/g, "''")}', ${basePrice})`).join(',\n        ');
        await queryRunner.query(`
      INSERT INTO "goods" ("name", "base_price")
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