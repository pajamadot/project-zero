import { PLAYER_MAX_ITEMS } from "../constants";

export interface Item {
  id: string;
  name: string;
  type: "consumable" | "key";
  power?: number;
}

export class InventorySystem {
  private items: Item[] = [];

  addItem(item: Item): boolean {
    if (this.items.length >= PLAYER_MAX_ITEMS) return false;
    this.items.push({ ...item });
    return true;
  }

  removeItem(id: string): Item | null {
    const idx = this.items.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    return this.items.splice(idx, 1)[0];
  }

  hasItem(id: string): boolean {
    return this.items.some((i) => i.id === id);
  }

  countItem(id: string): number {
    return this.items.filter((i) => i.id === id).length;
  }

  getItems(): Item[] {
    return [...this.items];
  }

  isFull(): boolean {
    return this.items.length >= PLAYER_MAX_ITEMS;
  }
}
