// Tile types
export const TILE_TYPES = {
  GRASS: 0, PATH: 1, WATER: 2, WALL: 3, TREE: 4, DOOR: 5, ROOF: 6,
  DUNGEON_FLOOR: 7, DUNGEON_WALL: 8,
} as const;

export const TILE_TEXTURES: Record<number, string> = {
  0: "tile-grass", 1: "tile-path", 2: "tile-water", 3: "tile-wall",
  4: "tile-tree", 5: "tile-door", 6: "tile-roof",
  7: "tile-dungeon-floor", 8: "tile-dungeon-wall",
};

export const SOLID_TILES = new Set<number>([
  TILE_TYPES.WATER, TILE_TYPES.WALL, TILE_TYPES.TREE,
  TILE_TYPES.ROOF, TILE_TYPES.DUNGEON_WALL,
]);

// Village map — 30x22 tiles (bigger, more space to explore)
// 0=grass 1=path 2=water 3=wall 4=tree 5=door 6=roof
const _ = 0, P = 1, W = 2, S = 3, T = 4, D = 5, R = 6;
export const VILLAGE_MAP: number[][] = [
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,T],
  [T,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,T],
  [T,_,_,T,T,_,_,R,R,R,_,_,_,R,R,R,_,_,_,_,_,_,_,R,R,R,_,_,_,T],
  [T,_,_,T,T,_,_,S,S,S,_,_,_,S,S,S,_,_,_,_,_,_,_,S,S,S,_,_,_,T],
  [T,_,_,_,_,_,_,S,D,S,_,_,_,S,D,S,_,_,_,_,_,_,_,S,D,S,_,_,_,T],
  [T,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,T],
  [T,_,_,_,_,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,_,_,_,_,T],
  [T,_,_,_,_,P,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,P,_,_,_,_,T],
  [T,_,_,_,_,P,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,P,_,_,_,_,T],
  [T,_,_,_,_,P,_,_,_,W,W,W,_,_,_,_,W,W,W,_,_,_,_,_,P,_,_,_,_,T],
  [T,_,_,_,_,P,_,_,_,W,W,W,_,_,_,_,W,W,W,_,_,_,_,_,P,_,_,_,_,T],
  [T,_,_,_,_,P,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,P,_,_,_,_,T],
  [T,_,_,_,_,P,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,P,_,_,_,_,T],
  [T,_,_,_,_,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,_,_,_,_,T],
  [T,_,_,_,_,_,_,_,_,_,_,_,_,P,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,T],
  [T,_,_,_,_,_,_,_,_,_,_,_,_,P,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,T],
  [T,_,_,_,_,_,_,_,_,_,_,_,_,P,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,P,P,P,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,P,P,P,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,P,P,P,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,P,P,P,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

// Dungeon map — 30x22 tiles (bigger, more rooms)
const F = 7, X = 8;
export const DUNGEON_MAP: number[][] = [
  [X,X,X,X,X,X,X,X,X,X,X,X,F,F,F,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
  [X,F,F,F,F,F,F,X,F,F,F,F,F,F,F,F,F,F,F,X,F,F,F,F,F,F,F,F,F,X],
  [X,F,F,F,F,F,F,X,F,F,F,F,F,F,F,F,F,F,F,X,F,F,F,F,F,F,F,F,F,X],
  [X,F,F,F,F,F,F,X,F,F,F,F,F,F,F,F,F,F,F,X,F,F,F,F,F,F,F,F,F,X],
  [X,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,X],
  [X,F,F,F,F,F,F,F,F,F,X,X,X,F,F,F,X,X,X,F,F,F,F,F,F,F,F,F,F,X],
  [X,F,F,F,F,F,F,F,F,F,X,F,F,F,F,F,F,F,X,F,F,F,F,F,F,F,F,F,F,X],
  [X,X,X,X,F,X,X,F,F,F,X,F,F,F,F,F,F,F,X,F,F,F,X,X,F,X,X,X,X,X],
  [X,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,X],
  [X,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,X],
  [X,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,X],
  [X,X,X,X,F,X,X,F,F,F,X,X,X,F,F,F,X,X,X,F,F,F,X,X,F,X,X,X,X,X],
  [X,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,X],
  [X,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,X],
  [X,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,X],
  [X,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,X],
  [X,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,X],
  [X,X,X,X,X,X,X,X,X,X,F,F,F,F,F,F,F,F,F,F,X,X,X,X,X,X,X,X,X,X],
  [X,X,X,X,X,X,X,X,X,X,F,F,F,F,F,F,F,F,F,F,X,X,X,X,X,X,X,X,X,X],
  [X,X,X,X,X,X,X,X,X,X,F,F,F,F,F,F,F,F,F,F,X,X,X,X,X,X,X,X,X,X],
  [X,X,X,X,X,X,X,X,X,X,F,F,F,F,F,F,F,F,F,F,X,X,X,X,X,X,X,X,X,X],
  [X,X,X,X,X,X,X,X,X,X,F,F,F,F,F,F,F,F,F,F,X,X,X,X,X,X,X,X,X,X],
];

export const MAP_W = 30;
export const MAP_H = 22;

// Transitions — 3-tile wide south exit
export interface MapTransition {
  fromMap: string;
  fromX: number;
  fromY: number;
  toMap: string;
  toX: number;
  toY: number;
}

export const TRANSITIONS: MapTransition[] = [
  // Village south exit (3 tiles wide: columns 12,13,14)
  { fromMap: "village", fromX: 12, fromY: 21, toMap: "dungeon", toX: 13, toY: 0 },
  { fromMap: "village", fromX: 13, fromY: 21, toMap: "dungeon", toX: 13, toY: 0 },
  { fromMap: "village", fromX: 14, fromY: 21, toMap: "dungeon", toX: 13, toY: 0 },
  // Dungeon north exit (3 tiles wide)
  { fromMap: "dungeon", fromX: 12, fromY: 0, toMap: "village", toX: 13, toY: 18 },
  { fromMap: "dungeon", fromX: 13, fromY: 0, toMap: "village", toX: 13, toY: 18 },
  { fromMap: "dungeon", fromX: 14, fromY: 0, toMap: "village", toX: 13, toY: 18 },
];

// Boss spawn — in the large open boss room at the bottom
export const BOSS_POSITION = { x: 15, y: 19 };
