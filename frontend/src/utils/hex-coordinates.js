/**
 * Hex grid utilities for frontend rendering
 * Axial coordinate system (q, r)
 */

/**
 * Convert axial coordinates to pixel coordinates for SVG rendering
 * Uses pointy-top hexagons
 */
export function hexToPixel(hex, size = 30) {
  const x = size * (Math.sqrt(3) * hex.q + (Math.sqrt(3) / 2) * hex.r);
  const y = size * ((3 / 2) * hex.r);
  return { x, y };
}

/**
 * Convert pixel coordinates to hex coordinates (approximate)
 */
export function pixelToHex(point, size = 30) {
  const q = ((2 / 3) * point.x) / size;
  const r = ((-1 / 3) * point.x + (Math.sqrt(3) / 3) * point.y) / size;
  return hexRound({ q, r });
}

/**
 * Round fractional hex coordinates to nearest hex
 */
function hexRound(hex) {
  let q = Math.round(hex.q);
  let r = Math.round(hex.r);
  const s = Math.round(-hex.q - hex.r);

  const qDiff = Math.abs(q - hex.q);
  const rDiff = Math.abs(r - hex.r);
  const sDiff = Math.abs(s - (-hex.q - hex.r));

  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - s;
  } else if (rDiff > sDiff) {
    r = -q - s;
  }

  return { q, r };
}

/**
 * Generate SVG path for a hexagon (pointy-top)
 * Hexagons are drawn with pointy top, starting from the top vertex
 */
export function hexPath(size = 30) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    // Start at top (angle = 0), then go clockwise
    // Pointy-top hexagon: top vertex at 0, then 60, 120, 180, 240, 300 degrees
    const angle = (Math.PI / 3) * i - Math.PI / 2; // Rotate -90deg so top is at angle 0
    const x = size * Math.cos(angle);
    const y = size * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return `M ${points.join(' L ')} Z`;
}

/**
 * Calculate distance between two hexes
 */
export function hexDistance(a, b) {
  return (
    (Math.abs(a.q - b.q) +
      Math.abs(a.q + a.r - b.q - b.r) +
      Math.abs(a.r - b.r)) /
    2
  );
}

/**
 * Get neighbors of a hex
 */
export const HEX_DIRECTIONS = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

export function hexNeighbors(hex) {
  return HEX_DIRECTIONS.map((dir) => ({ q: hex.q + dir.q, r: hex.r + dir.r }));
}

