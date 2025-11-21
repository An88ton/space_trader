"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HEX_DIRECTIONS = void 0;
exports.hexNeighbor = hexNeighbor;
exports.hexNeighbors = hexNeighbors;
exports.hexDistance = hexDistance;
exports.axialToCube = axialToCube;
exports.cubeToAxial = cubeToAxial;
exports.hexesInRange = hexesInRange;
exports.hexRing = hexRing;
exports.hexPath = hexPath;
exports.HEX_DIRECTIONS = [
    { q: 1, r: 0 },
    { q: 1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: 1 },
    { q: 0, r: 1 },
];
function hexNeighbor(hex, direction) {
    const dir = exports.HEX_DIRECTIONS[direction % 6];
    return { q: hex.q + dir.q, r: hex.r + dir.r };
}
function hexNeighbors(hex) {
    return exports.HEX_DIRECTIONS.map((dir) => ({ q: hex.q + dir.q, r: hex.r + dir.r }));
}
function hexDistance(a, b) {
    return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
}
function axialToCube(hex) {
    const s = -hex.q - hex.r;
    return { q: hex.q, r: hex.r, s };
}
function cubeToAxial(cube) {
    return { q: cube.q, r: cube.r };
}
function hexesInRange(center, radius) {
    const results = [];
    for (let q = -radius; q <= radius; q++) {
        const r1 = Math.max(-radius, -q - radius);
        const r2 = Math.min(radius, -q + radius);
        for (let r = r1; r <= r2; r++) {
            results.push({ q: center.q + q, r: center.r + r });
        }
    }
    return results;
}
function hexRing(center, radius) {
    if (radius === 0) {
        return [center];
    }
    const results = [];
    let hex = { q: center.q + exports.HEX_DIRECTIONS[4].q * radius, r: center.r + exports.HEX_DIRECTIONS[4].r * radius };
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < radius; j++) {
            results.push({ ...hex });
            hex = hexNeighbor(hex, i);
        }
    }
    return results;
}
function hexPath(start, goal, isPassable) {
    const frontier = [];
    const cameFrom = new Map();
    const costSoFar = new Map();
    const hexKey = (h) => `${h.q},${h.r}`;
    const heuristic = (a, b) => hexDistance(a, b);
    frontier.push({ hex: start, priority: 0 });
    cameFrom.set(hexKey(start), null);
    costSoFar.set(hexKey(start), 0);
    while (frontier.length > 0) {
        frontier.sort((a, b) => a.priority - b.priority);
        const current = frontier.shift().hex;
        if (current.q === goal.q && current.r === goal.r) {
            const path = [];
            let step = current;
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
            if (!costSoFar.has(nextKey) || newCost < costSoFar.get(nextKey)) {
                costSoFar.set(nextKey, newCost);
                const priority = newCost + heuristic(next, goal);
                frontier.push({ hex: next, priority });
                cameFrom.set(nextKey, current);
            }
        }
    }
    return null;
}
//# sourceMappingURL=hex-coordinates.js.map