"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddShipLevels1732240800000 = void 0;
const SHIP_SEEDS = [
    ['Aurora Skiff', 1, 5000, 20, 60, 6],
    ['Comet Runner', 2, 12000, 30, 80, 7],
    ['Nebula Rover', 3, 25000, 45, 110, 8],
    ['Starbound Hauler', 4, 40000, 60, 130, 9],
    ['Void Falcon', 5, 60000, 75, 150, 10],
    ['Eclipse Courier', 6, 85000, 90, 170, 11],
    ['Solaris Freighter', 7, 115000, 110, 190, 12],
    ['Galactic Nomad', 8, 150000, 130, 210, 13],
    ['Nova Dreadnought', 9, 190000, 150, 235, 14],
    ['Celestial Titan', 10, 240000, 175, 260, 15],
];
class AddShipLevels1732240800000 {
    name = 'AddShipLevels1732240800000';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "ship"
      ADD COLUMN "level" INT NOT NULL DEFAULT 1
    `);
        await queryRunner.query(`
      ALTER TABLE "ship"
      ADD COLUMN "price" INT NOT NULL DEFAULT 0
    `);
        const values = SHIP_SEEDS.map(([name, level, price, cargo, fuelCapacity, speed]) => `('${name.replace(/'/g, "''")}', ${level}, ${price}, ${cargo}, ${fuelCapacity}, ${fuelCapacity}, ${speed})`).join(',\n        ');
        if (values.length > 0) {
            await queryRunner.query(`
        INSERT INTO "ship"
          ("name", "level", "price", "cargo_capacity", "fuel_capacity", "fuel_current", "speed")
        VALUES
        ${values}
      `);
        }
    }
    async down(queryRunner) {
        const names = SHIP_SEEDS.map(([name]) => `'${name.replace(/'/g, "''")}'`).join(', ');
        if (names.length > 0) {
            await queryRunner.query(`
        DELETE FROM "ship"
        WHERE "name" IN (${names})
      `);
        }
        await queryRunner.query(`
      ALTER TABLE "ship"
      DROP COLUMN "price"
    `);
        await queryRunner.query(`
      ALTER TABLE "ship"
      DROP COLUMN "level"
    `);
    }
}
exports.AddShipLevels1732240800000 = AddShipLevels1732240800000;
//# sourceMappingURL=1732240800000-AddShipLevels.js.map