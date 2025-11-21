export interface HexCoordinate {
    q: number;
    r: number;
}
export declare const HEX_DIRECTIONS: HexCoordinate[];
export declare function hexNeighbor(hex: HexCoordinate, direction: number): HexCoordinate;
export declare function hexNeighbors(hex: HexCoordinate): HexCoordinate[];
export declare function hexDistance(a: HexCoordinate, b: HexCoordinate): number;
export declare function axialToCube(hex: HexCoordinate): {
    q: number;
    r: number;
    s: number;
};
export declare function cubeToAxial(cube: {
    q: number;
    r: number;
    s: number;
}): HexCoordinate;
export declare function hexesInRange(center: HexCoordinate, radius: number): HexCoordinate[];
export declare function hexRing(center: HexCoordinate, radius: number): HexCoordinate[];
export declare function hexPath(start: HexCoordinate, goal: HexCoordinate, isPassable: (hex: HexCoordinate) => boolean): HexCoordinate[] | null;
