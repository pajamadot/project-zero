/**
 * Save/Load System — persists game state to localStorage.
 */

const SAVE_KEY = "pz_save";

export interface SaveData {
  version: number;
  timestamp: string;
  player: {
    hp: number;
    gridX: number;
    gridY: number;
    facing: string;
  };
  inventory: Array<{ id: string; name: string; type: string; power?: number }>;
  quest: string; // "inactive" | "active" | "complete"
  currentMap: string;
  bossDefeated: boolean;
  stepCount: number;
}

export function saveGame(data: SaveData): void {
  data.version = 1;
  data.timestamp = new Date().toISOString();
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

export function loadGame(): SaveData | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SaveData;
  } catch {
    return null;
  }
}

export function hasSave(): boolean {
  return !!localStorage.getItem(SAVE_KEY);
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
