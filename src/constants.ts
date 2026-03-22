// ===== Tuning Knobs =====
// All gameplay numbers live here. Never hardcode in game logic.

// Display
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const TILE_SIZE = 16;
export const SCALE = 2; // 16px tiles rendered at 32px

// Movement
export const GRID_SIZE = 16;
export const PLAYER_SPEED = 160; // px/sec
export const MOVE_DURATION = 200; // ms per grid step (tween)

// Player stats
export const PLAYER_HP = 30;
export const PLAYER_ATK = 10;
export const PLAYER_DEF = 5;
export const PLAYER_MAX_ITEMS = 5;

// Enemies
export const SLIME_HP = 8;
export const SLIME_ATK = 4;
export const SLIME_DEF = 2;
export const BOSS_HP = 50;
export const BOSS_ATK = 8;
export const BOSS_DEF = 4;

// Battle
export const ENCOUNTER_RATE = 0.125; // 1 in 8 steps
export const DAMAGE_VARIANCE = 2; // +/- random

// Items
export const POTION_HEAL = 15;

// Dialogue
export const TEXT_SPEED = 30; // chars per second
export const DIALOGUE_BOX_HEIGHT = 120;

// Colors (JRPG palette)
export const COLORS = {
  bg: 0x1a1a2e,
  grass: 0x4a7c59,
  path: 0xc4a35a,
  water: 0x2e5a88,
  wall: 0x5a5a6e,
  roof: 0x8b4513,
  door: 0x6b3a2a,
  tree: 0x2d5a27,
  player: 0x4488ff,
  npc: 0xff8844,
  enemy: 0xcc3333,
  boss: 0x880088,
  dialogueBg: 0x111122,
  dialogueBorder: 0x4444aa,
  hpBar: 0x44cc44,
  hpBarBg: 0x333333,
  menuHighlight: 0x3355aa,
  white: 0xffffff,
  black: 0x000000,
};
