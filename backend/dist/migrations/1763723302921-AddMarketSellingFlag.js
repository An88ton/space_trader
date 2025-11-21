"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMarketSellingFlag1763723302921 = void 0;
class AddMarketSellingFlag1763723302921 {
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "planet_market"
            ADD COLUMN "is_selling" BOOLEAN NOT NULL DEFAULT true
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "planet_market"
            DROP COLUMN "is_selling"
        `);
    }
}
exports.AddMarketSellingFlag1763723302921 = AddMarketSellingFlag1763723302921;
//# sourceMappingURL=1763723302921-AddMarketSellingFlag.js.map