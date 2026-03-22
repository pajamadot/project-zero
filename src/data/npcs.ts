export interface NPCDef {
  name: string;
  gridX: number;
  gridY: number;
  texture: string;
}

export const NPC_DATA: NPCDef[] = [
  { name: "Elder", gridX: 12, gridY: 7, texture: "npc-elder" },
  { name: "Guard", gridX: 11, gridY: 15, texture: "npc-guard" },
  { name: "Merchant", gridX: 21, gridY: 14, texture: "npc-merchant" },
];
