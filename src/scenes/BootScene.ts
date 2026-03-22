import Phaser from "phaser";
import { TILE_SIZE, SCALE, COLORS } from "../constants";

/**
 * BootScene — loads assets from the Pajama Studio asset system.
 *
 * Assets are served via the API at /api/v1/assets/file/{assetId}.
 * Fallback: generates procedural textures if asset loading fails.
 */

// Asset IDs from the Pajama Game Studio asset system
const ASSET_BASE = "https://api.pajama.studio/api/v1/assets/file";
const ASSETS: Record<string, string> = {
  "player": "asset_79c7c91ba4af4386",
  "npc-elder": "asset_e2e885485279413e",
  "npc-guard": "asset_77ce68af69174bbe",
  "npc-merchant": "asset_b9c06335bb024351",
  "slime": "asset_fb55a85874d24b78",
  "boss": "asset_9d60e493fd1648ce",
  "tile-grass": "asset_8c06fe1201ab49dc",
  "tile-path": "asset_df1b172a42fc4411",
  "tile-dungeon-floor": "asset_1dc53386746f43a8",
};

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    // Load assets from CDN
    for (const [key, assetId] of Object.entries(ASSETS)) {
      this.load.image(key, `${ASSET_BASE}/${assetId}`);
    }

    // Loading bar
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const bar = this.add.rectangle(w / 2, h / 2, 0, 16, COLORS.player);
    this.load.on("progress", (p: number) => {
      bar.width = w * 0.6 * p;
    });
    this.load.on("complete", () => bar.destroy());
  }

  create() {
    const s = TILE_SIZE * SCALE;

    // Generate fallback/additional textures that aren't loaded from CDN
    this.generateFallbackTextures(s);

    this.scene.start("TitleScene");
  }

  private generateFallbackTextures(s: number) {
    // Generate textures only for assets not loaded from CDN
    const fallbacks: Record<string, number> = {
      "tile-water": COLORS.water,
      "tile-wall": COLORS.wall,
      "tile-tree": COLORS.tree,
      "tile-door": COLORS.door,
      "tile-roof": COLORS.roof,
      "tile-dungeon-wall": 0x2a2a3e,
    };

    for (const [key, color] of Object.entries(fallbacks)) {
      if (this.textures.exists(key)) continue;
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(color);
      g.fillRect(0, 0, s, s);
      g.fillStyle(0x000000, 0.08);
      for (let i = 0; i < 4; i++) {
        g.fillRect(Math.random() * s, Math.random() * s, 2, 2);
      }
      g.generateTexture(key, s, s);
      g.destroy();
    }
  }
}
