import { MigrationInterface, QueryRunner } from 'typeorm';

type GoodSeed = [name: string, basePrice: number, type: string];

const GOOD_SEEDS: GoodSeed[] = [
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

export class SeedCoreGoods1732329600000 implements MigrationInterface {
  name = 'SeedCoreGoods1732329600000';

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


