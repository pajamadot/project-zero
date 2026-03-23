export interface NPCDef {
  name: string;
  gridX: number;
  gridY: number;
  texture: string;
}

// NPCs positioned to NOT block any paths
export const NPC_DATA: NPCDef[] = [
  { name: "Elder", gridX: 10, gridY: 9, texture: "npc-elder" },      // Inside village square, off the path
  { name: "Guard", gridX: 15, gridY: 17, texture: "npc-guard" },     // Near south exit but NOT on the path
  { name: "Merchant", gridX: 25, gridY: 4, texture: "npc-merchant" }, // Near the shop building, out of the way
];
