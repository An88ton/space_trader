"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddFiftyGoods1763724000000 = void 0;
const GOOD_SEEDS = [
    ['Titanium Ore', 450, 'minerals'],
    ['Platinum Crystals', 1200, 'minerals'],
    ['Iron Deposits', 180, 'minerals'],
    ['Copper Alloys', 320, 'minerals'],
    ['Gold Nuggets', 850, 'minerals'],
    ['Silver Veins', 550, 'minerals'],
    ['Diamond Shards', 2000, 'minerals'],
    ['Solar Panels', 600, 'energy'],
    ['Fusion Cores', 1500, 'energy'],
    ['Plasma Cells', 800, 'energy'],
    ['Ion Batteries', 400, 'energy'],
    ['Zero-Point Modules', 3000, 'energy'],
    ['Warp Cores', 2200, 'energy'],
    ['Photon Generators', 950, 'energy'],
    ['Synthetic Protein', 150, 'food'],
    ['Freeze-Dried Rations', 90, 'food'],
    ['Alien Fruits', 280, 'food'],
    ['Space Wheat', 120, 'food'],
    ['Nutrition Bars', 75, 'food'],
    ['Aquaponic Vegetables', 200, 'food'],
    ['Quantum Processors', 1800, 'technology'],
    ['Holographic Displays', 1100, 'technology'],
    ['AI Cores', 2500, 'technology'],
    ['Nanite Swarms', 1600, 'technology'],
    ['Gravity Plates', 1900, 'technology'],
    ['Shield Generators', 2100, 'technology'],
    ['FTL Navigation Systems', 2800, 'technology'],
    ['Crystal Wine', 350, 'luxury'],
    ['Alien Artifacts', 1200, 'luxury'],
    ['Virtual Reality Pods', 750, 'luxury'],
    ['Designer Spacesuits', 550, 'luxury'],
    ['Stardust Perfume', 420, 'luxury'],
    ['Galactic Art Pieces', 1500, 'luxury'],
    ['Steel Beams', 380, 'industrial'],
    ['Composite Materials', 720, 'industrial'],
    ['Circuit Boards', 580, 'industrial'],
    ['Hydraulic Systems', 950, 'industrial'],
    ['Reinforced Plating', 1100, 'industrial'],
    ['Manufacturing Robots', 1400, 'industrial'],
    ['Biological Samples', 450, 'organic'],
    ['Genetic Material', 800, 'organic'],
    ['Enzyme Cultures', 600, 'organic'],
    ['Organic Compounds', 350, 'organic'],
    ['Biomass Fuel', 280, 'organic'],
    ['Living Tissue', 1200, 'organic'],
    ['Unobtanium', 5000, 'rare_elements'],
    ['Neutronium', 3500, 'rare_elements'],
    ['Dark Matter', 4200, 'rare_elements'],
    ['Exotic Matter', 3800, 'rare_elements'],
    ['Quantum Foam', 4500, 'rare_elements'],
];
class AddFiftyGoods1763724000000 {
    name = 'AddFiftyGoods1763724000000';
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
exports.AddFiftyGoods1763724000000 = AddFiftyGoods1763724000000;
//# sourceMappingURL=1763724000000-AddFiftyGoods.js.map