/**
 * Hex grid utilities using axial coordinates (q, r)
 * Based on: https://www.redblobgames.com/grids/hexagons/
 */

export interface HexCoordinate {
  q: number;
  r: number;
}

/**
 * Hex direction vectors in axial coordinates
 */
export const HEX_DIRECTIONS: HexCoordinate[] = [
  { q: 1, r: 0 }, // East
  { q: 1, r: -1 }, // Northeast
  { q: 0, r: -1 }, // Northwest
  { q: -1, r: 0 }, // West
  { q: -1, r: 1 }, // Southwest
  { q: 0, r: 1 }, // Southeast
];

/**
 * Get a neighbor hex in a given direction
 */
export function hexNeighbor(hex: HexCoordinate, direction: number): HexCoordinate {
  const dir = HEX_DIRECTIONS[direction % 6];
  return { q: hex.q + dir.q, r: hex.r + dir.r };
}

/**
 * Get all neighbors of a hex
 */
export function hexNeighbors(hex: HexCoordinate): HexCoordinate[] {
  return HEX_DIRECTIONS.map((dir) => ({ q: hex.q + dir.q, r: hex.r + dir.r }));
}

/**
 * Calculate distance between two hexes (number of hexes to travel)
 */
export function hexDistance(a: HexCoordinate, b: HexCoordinate): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
}

/**
 * Convert axial coordinates to cube coordinates
 */
export function axialToCube(hex: HexCoordinate): { q: number; r: number; s: number } {
  const s = -hex.q - hex.r;
  return { q: hex.q, r: hex.r, s };
}

/**
 * Convert cube coordinates to axial coordinates
 */
export function cubeToAxial(cube: { q: number; r: number; s: number }): HexCoordinate {
  return { q: cube.q, r: cube.r };
}

/**
 * Generate hexes within a radius from a center hex
 */
export function hexesInRange(center: HexCoordinate, radius: number): HexCoordinate[] {
  const results: HexCoordinate[] = [];
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      results.push({ q: center.q + q, r: center.r + r });
    }
  }
  return results;
}

/**
 * Generate a ring of hexes at a specific radius
 */
export function hexRing(center: HexCoordinate, radius: number): HexCoordinate[] {
  if (radius === 0) {
    return [center];
  }

  const results: HexCoordinate[] = [];
  let hex = { q: center.q + HEX_DIRECTIONS[4].q * radius, r: center.r + HEX_DIRECTIONS[4].r * radius };

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < radius; j++) {
      results.push({ ...hex });
      hex = hexNeighbor(hex, i);
    }
  }

  return results;
}

/**
 * Find a path between two hexes using A* algorithm
 */
export function hexPath(
  start: HexCoordinate,
  goal: HexCoordinate,
  isPassable: (hex: HexCoordinate) => boolean,
): HexCoordinate[] | null {
  const frontier: Array<{ hex: HexCoordinate; priority: number }> = [];
  const cameFrom: Map<string, HexCoordinate | null> = new Map();
  const costSoFar: Map<string, number> = new Map();

  const hexKey = (h: HexCoordinate) => `${h.q},${h.r}`;
  const heuristic = (a: HexCoordinate, b: HexCoordinate) => hexDistance(a, b);

  frontier.push({ hex: start, priority: 0 });
  cameFrom.set(hexKey(start), null);
  costSoFar.set(hexKey(start), 0);

  while (frontier.length > 0) {
    frontier.sort((a, b) => a.priority - b.priority);
    const current = frontier.shift()!.hex;

    if (current.q === goal.q && current.r === goal.r) {
      // Reconstruct path
      const path: HexCoordinate[] = [];
      let step: HexCoordinate | null = current;
      while (step) {
        path.unshift(step);
        step = cameFrom.get(hexKey(step)) || null;
      }
      return path;
    }

    for (const next of hexNeighbors(current)) {
      if (!isPassable(next)) {
        continue;
      }

      const newCost = (costSoFar.get(hexKey(current)) || 0) + 1;
      const nextKey = hexKey(next);

      if (!costSoFar.has(nextKey) || newCost < costSoFar.get(nextKey)!) {
        costSoFar.set(nextKey, newCost);
        const priority = newCost + heuristic(next, goal);
        frontier.push({ hex: next, priority });
        cameFrom.set(nextKey, current);
      }
    }
  }

  return null; // No path found
}

