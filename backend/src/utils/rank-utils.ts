/**
 * Calculates the user's rank based on their reputation
 * Ranks:
 * - Captain: 0-9 reputation
 * - Commander: 10-99 reputation
 * - Admiral: 100-999 reputation
 * - Fleet Admiral: 1000+ reputation
 */
export function calculateRank(reputation: number): string {
  if (reputation >= 1000) {
    return 'Fleet Admiral';
  } else if (reputation >= 100) {
    return 'Admiral';
  } else if (reputation >= 10) {
    return 'Commander';
  } else {
    return 'Captain';
  }
}

/**
 * Calculates the docking fee discount multiplier based on rank
 * Higher ranks get better discounts
 */
export function getDockingFeeMultiplier(rank: string): number {
  switch (rank) {
    case 'Fleet Admiral':
      return 0.5; // 50% discount
    case 'Admiral':
      return 0.7; // 30% discount
    case 'Commander':
      return 0.85; // 15% discount
    case 'Captain':
    default:
      return 1.0; // No discount
  }
}
