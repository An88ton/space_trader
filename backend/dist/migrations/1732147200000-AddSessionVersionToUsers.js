"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSessionVersionToUsers1732147200000 = void 0;
class AddSessionVersionToUsers1732147200000 {
    name = 'AddSessionVersionToUsers1732147200000';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "session_version" INT NOT NULL DEFAULT 0
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "session_version"
    `);
    }
}
exports.AddSessionVersionToUsers1732147200000 = AddSessionVersionToUsers1732147200000;
//# sourceMappingURL=1732147200000-AddSessionVersionToUsers.js.map