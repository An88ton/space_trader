import { MigrationInterface, QueryRunner } from 'typeorm';

type GoodSeed = [name: string, basePrice: number, type: string];

const GOOD_SEEDS: GoodSeed[] = [
  // Minerals (7 goods)
  ['Titanium Ore', 450, 'minerals'],
  ['Platinum Crystals', 1200, 'minerals'],
  ['Iron Deposits', 180, 'minerals'],
  ['Copper Alloys', 320, 'minerals'],
  ['Gold Nuggets', 850, 'minerals'],
  ['Silver Veins', 550, 'minerals'],
  ['Diamond Shards', 2000, 'minerals'],

  // Energy (7 goods)
  ['Solar Panels', 600, 'energy'],
  ['Fusion Cores', 1500, 'energy'],
  ['Plasma Cells', 800, 'energy'],
  ['Ion Batteries', 400, 'energy'],
  ['Zero-Point Modules', 3000, 'energy'],
  ['Warp Cores', 2200, 'energy'],
  ['Photon Generators', 950, 'energy'],

  // Food (6 goods)
  ['Synthetic Protein', 150, 'food'],
  ['Freeze-Dried Rations', 90, 'food'],
  ['Alien Fruits', 280, 'food'],
  ['Space Wheat', 120, 'food'],
  ['Nutrition Bars', 75, 'food'],
  ['Aquaponic Vegetables', 200, 'food'],

  // Technology (7 goods)
  ['Quantum Processors', 1800, 'technology'],
  ['Holographic Displays', 1100, 'technology'],
  ['AI Cores', 2500, 'technology'],
  ['Nanite Swarms', 1600, 'technology'],
  ['Gravity Plates', 1900, 'technology'],
  ['Shield Generators', 2100, 'technology'],
  ['FTL Navigation Systems', 2800, 'technology'],

  // Luxury (6 goods)
  ['Crystal Wine', 350, 'luxury'],
  ['Alien Artifacts', 1200, 'luxury'],
  ['Virtual Reality Pods', 750, 'luxury'],
  ['Designer Spacesuits', 550, 'luxury'],
  ['Stardust Perfume', 420, 'luxury'],
  ['Galactic Art Pieces', 1500, 'luxury'],

  // Industrial (6 goods)
  ['Steel Beams', 380, 'industrial'],
  ['Composite Materials', 720, 'industrial'],
  ['Circuit Boards', 580, 'industrial'],
  ['Hydraulic Systems', 950, 'industrial'],
  ['Reinforced Plating', 1100, 'industrial'],
  ['Manufacturing Robots', 1400, 'industrial'],

  // Organic (6 goods)
  ['Biological Samples', 450, 'organic'],
  ['Genetic Material', 800, 'organic'],
  ['Enzyme Cultures', 600, 'organic'],
  ['Organic Compounds', 350, 'organic'],
  ['Biomass Fuel', 280, 'organic'],
  ['Living Tissue', 1200, 'organic'],

  // Rare Elements (5 goods)
  ['Unobtanium', 5000, 'rare_elements'],
  ['Neutronium', 3500, 'rare_elements'],
  ['Dark Matter', 4200, 'rare_elements'],
  ['Exotic Matter', 3800, 'rare_elements'],
  ['Quantum Foam', 4500, 'rare_elements'],
];

export class AddFiftyGoods1763724000000 implements MigrationInterface {
  name = 'AddFiftyGoods1763724000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (GOOD_SEEDS.length === 0) {
      return;
    }

    const values = GOOD_SEEDS.map(
      ([name, basePrice, type]) => `('${name.replace(/'/g, "''")}', ${basePrice}, '${type}')`,
    ).join(',\n        ');

    await queryRunner.query(`
      INSERT INTO "goods" ("name", "base_price", "type")
      VALUES
        ${values}
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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

