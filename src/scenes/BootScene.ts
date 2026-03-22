import Phaser from "phaser";
import { TILE_SIZE, SCALE, COLORS } from "../constants";

/**
 * BootScene — generates all placeholder art as textures.
 * No external assets needed. Everything is drawn procedurally.
 * This lets us iterate on gameplay without waiting for art.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    this.generateTextures();
    this.scene.start("TitleScene");
  }

  private generateTextures() {
    const s = TILE_SIZE * SCALE; // 32px rendered size

    // Player sprite (blue character with eyes)
    this.createCharTexture("player", COLORS.player, s);

    // NPC sprites
    this.createCharTexture("npc-elder", 0xff8844, s);
    this.createCharTexture("npc-guard", 0x88aa44, s);
    this.createCharTexture("npc-merchant", 0xddaa22, s);

    // Enemy sprites
    this.createEnemyTexture("slime", 0x44cc44, s);
    this.createEnemyTexture("boss", COLORS.boss, s * 1.5);

    // Tile textures (single tile-sized)
    this.createTileTexture("tile-grass", COLORS.grass);
    this.createTileTexture("tile-path", COLORS.path);
    this.createTileTexture("tile-water", COLORS.water);
    this.createTileTexture("tile-wall", COLORS.wall);
    this.createTileTexture("tile-tree", COLORS.tree);
    this.createTileTexture("tile-door", COLORS.door);
    this.createTileTexture("tile-roof", COLORS.roof);
    this.createTileTexture("tile-dungeon-floor", 0x3a3a4e);
    this.createTileTexture("tile-dungeon-wall", 0x2a2a3e);
  }

  private createCharTexture(key: string, color: number, size: number) {
    const g = this.make.graphics({ x: 0, y: 0 });
    // Body
    g.fillStyle(color);
    g.fillRoundedRect(size * 0.15, size * 0.1, size * 0.7, size * 0.85, 4);
    // Eyes
    g.fillStyle(0xffffff);
    g.fillCircle(size * 0.35, size * 0.35, size * 0.08);
    g.fillCircle(size * 0.65, size * 0.35, size * 0.08);
    g.fillStyle(0x000000);
    g.fillCircle(size * 0.37, size * 0.36, size * 0.04);
    g.fillCircle(size * 0.67, size * 0.36, size * 0.04);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  private createEnemyTexture(key: string, color: number, size: number) {
    const g = this.make.graphics({ x: 0, y: 0 });
    // Blob body
    g.fillStyle(color);
    g.fillEllipse(size * 0.5, size * 0.55, size * 0.8, size * 0.7);
    // Eyes
    g.fillStyle(0xffffff);
    g.fillCircle(size * 0.35, size * 0.45, size * 0.1);
    g.fillCircle(size * 0.65, size * 0.45, size * 0.1);
    g.fillStyle(0x000000);
    g.fillCircle(size * 0.37, size * 0.47, size * 0.05);
    g.fillCircle(size * 0.67, size * 0.47, size * 0.05);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  private createTileTexture(key: string, color: number) {
    const s = TILE_SIZE * SCALE;
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(color);
    g.fillRect(0, 0, s, s);
    // Add subtle noise/variation
    g.fillStyle(0x000000, 0.08);
    for (let i = 0; i < 4; i++) {
      const x = Math.random() * s;
      const y = Math.random() * s;
      g.fillRect(x, y, 2, 2);
    }
    g.generateTexture(key, s, s);
    g.destroy();
  }
}
