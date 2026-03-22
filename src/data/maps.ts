// Tile types for procedural maps
// 0 = grass, 1 = path, 2 = water, 3 = wall, 4 = tree, 5 = door, 6 = roof
// 7 = dungeon floor, 8 = dungeon wall

export const TILE_TYPES = {
  GRASS: 0,
  PATH: 1,
  WATER: 2,
  WALL: 3,
  TREE: 4,
  DOOR: 5,
  ROOF: 6,
  DUNGEON_FLOOR: 7,
  DUNGEON_WALL: 8,
} as const;

// Tile texture keys mapped to tile type
export const TILE_TEXTURES: Record<number, string> = {
  0: "tile-grass",
  1: "tile-path",
  2: "tile-water",
  3: "tile-wall",
  4: "tile-tree",
  5: "tile-door",
  6: "tile-roof",
  7: "tile-dungeon-floor",
  8: "tile-dungeon-wall",
};

// Which tiles block movement
export const SOLID_TILES = new Set<number>([
  TILE_TYPES.WATER,
  TILE_TYPES.WALL,
  TILE_TYPES.TREE,
  TILE_TYPES.ROOF,
  TILE_TYPES.DUNGEON_WALL,
]);

// Village map (25x19 tiles = 800x608 at 32px scale)
// W=25 columns, H=19 rows
const T = TILE_TYPES;
export const VILLAGE_MAP: number[][] = [
  // Row 0-2: Top tree border
  [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
  [4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,4],
  [4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,4],
  // Row 3: Houses top
  [4,0,0,0,0,4,0,6,6,6,0,0,6,6,6,0,0,0,0,4,0,0,0,0,4],
  // Row 4: Houses middle
  [4,0,0,0,0,0,0,3,3,3,0,0,3,3,3,0,0,0,0,0,0,0,0,0,4],
  // Row 5: Houses bottom (with doors)
  [4,0,0,0,0,0,0,3,5,3,0,0,3,5,3,0,0,0,0,0,0,0,0,0,4],
  // Row 6-7: Village center path
  [4,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,4],
  // Row 8: Center
  [4,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,4],
  // Row 9: Well / fountain area
  [4,0,0,0,0,0,1,0,0,2,2,2,2,0,0,0,1,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,1,0,0,2,2,2,2,0,0,0,1,0,0,0,0,0,0,0,4],
  // Row 11-12: Bottom half
  [4,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,4],
  // Row 13-14: Bottom village
  [4,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,6,6,6,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,3,3,3,0,4],
  // Row 15: Shop
  [4,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,3,5,3,0,4],
  // Row 16: Path to dungeon exit (south)
  [4,4,4,4,4,4,4,4,4,4,4,1,4,4,4,4,4,4,4,4,4,4,4,4,4],
  // Row 17-18: Exit zone (becomes dungeon transition)
  [4,4,4,4,4,4,4,4,4,4,4,1,4,4,4,4,4,4,4,4,4,4,4,4,4],
  [4,4,4,4,4,4,4,4,4,4,4,1,4,4,4,4,4,4,4,4,4,4,4,4,4],
];

// Dungeon map (25x19 tiles)
export const DUNGEON_MAP: number[][] = [
  [8,8,8,8,8,8,8,8,8,8,8,7,8,8,8,8,8,8,8,8,8,8,8,8,8],
  [8,7,7,7,7,8,7,7,7,7,7,7,7,7,7,7,7,8,7,7,7,7,7,7,8],
  [8,7,7,7,7,8,7,7,7,7,7,7,7,7,7,7,7,8,7,7,7,7,7,7,8],
  [8,7,7,7,7,8,7,7,7,7,7,7,7,7,7,7,7,8,7,7,7,7,7,7,8],
  [8,7,7,7,7,7,7,7,8,8,8,7,8,8,8,7,7,7,7,7,7,7,7,7,8],
  [8,7,7,7,7,7,7,7,8,7,7,7,7,7,8,7,7,7,7,7,7,7,7,7,8],
  [8,7,7,7,7,8,7,7,8,7,7,7,7,7,8,7,7,8,7,7,7,7,7,7,8],
  [8,8,8,7,8,8,7,7,8,7,7,7,7,7,8,7,7,8,8,7,8,8,8,8,8],
  [8,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,8],
  [8,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,8],
  [8,8,8,7,8,8,7,7,8,8,8,7,8,8,8,7,7,8,8,7,8,8,8,8,8],
  [8,7,7,7,7,8,7,7,7,7,7,7,7,7,7,7,7,8,7,7,7,7,7,7,8],
  [8,7,7,7,7,8,7,7,7,7,7,7,7,7,7,7,7,8,7,7,7,7,7,7,8],
  [8,7,7,7,7,8,7,7,7,7,7,7,7,7,7,7,7,8,7,7,7,7,7,7,8],
  [8,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,8],
  [8,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,8],
  [8,8,8,8,8,8,8,8,8,8,7,7,7,8,8,8,8,8,8,8,8,8,8,8,8],
  // Boss room (bottom)
  [8,8,8,8,8,8,8,8,8,8,7,7,7,8,8,8,8,8,8,8,8,8,8,8,8],
  [8,8,8,8,8,8,8,8,8,8,7,7,7,8,8,8,8,8,8,8,8,8,8,8,8],
];

// Map transition zones
export interface MapTransition {
  fromMap: string;
  fromX: number;
  fromY: number;
  toMap: string;
  toX: number;
  toY: number;
}

export const TRANSITIONS: MapTransition[] = [
  // Village south exit → Dungeon north entrance
  { fromMap: "village", fromX: 11, fromY: 18, toMap: "dungeon", toX: 11, toY: 0 },
  // Dungeon north exit → Village south entrance
  { fromMap: "dungeon", fromX: 11, fromY: 0, toMap: "village", toX: 11, toY: 16 },
];

// Boss spawn position in dungeon
export const BOSS_POSITION = { x: 11, y: 17 };
