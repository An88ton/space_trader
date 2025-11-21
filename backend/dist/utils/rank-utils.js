"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRank = calculateRank;
exports.getDockingFeeMultiplier = getDockingFeeMultiplier;
function calculateRank(reputation) {
    if (reputation >= 1000) {
        return 'Fleet Admiral';
    }
    else if (reputation >= 100) {
        return 'Admiral';
    }
    else if (reputation >= 10) {
        return 'Commander';
    }
    else {
        return 'Captain';
    }
}
function getDockingFeeMultiplier(rank) {
    switch (rank) {
        case 'Fleet Admiral':
            return 0.5;
        case 'Admiral':
            return 0.7;
        case 'Commander':
            return 0.85;
        case 'Captain':
        default:
            return 1.0;
    }
}
//# sourceMappingURL=rank-utils.js.map