import Phaser from "phaser";
import { TILE_SIZE, SCALE, COLORS } from "../constants";

const ASSET_BASE = "https://api.pajama.studio/api/v1/assets/file";

// v3 asset IDs from the Pajama Studio asset system
const ASSETS: Record<string, string> = {
  "player":       "asset_9cf61e71e4064ccd",
  "npc-elder":    "asset_cc740ce395924908",
  "npc-guard":    "asset_92c78ae385c74559",
  "npc-merchant": "asset_aad15be078e24c86",
  "slime":        "asset_43f4f6eba2654731",
  "boss":         "asset_7f66e3aba7a04808",
  "tile-grass":   "asset_4fa521595d52407e",
  "tile-path":    "asset_7f8fe48ab0454dc7",
  "tile-dungeon-floor": "asset_301abd5c4de8435d",
  "tile-water":   "asset_0fef810b3ca84130",
  "tile-wall":    "asset_aa04b10ab8a04e9b",
};

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // Loading bar
    const bg = this.add.rectangle(w / 2, h / 2, w * 0.5, 4, 0x222229);
    const bar = this.add.rectangle(w / 2 - w * 0.25, h / 2, 0, 4, COLORS.player).setOrigin(0, 0.5);
    const label = this.add.text(w / 2, h / 2 + 20, "Loading...", {
      fontSize: "12px", fontFamily: "monospace", color: "#6b6b76",
    }).setOrigin(0.5);

    this.load.on("progress", (p: number) => { bar.width = w * 0.5 * p; });
    this.load.on("complete", () => { bg.destroy(); bar.destroy(); label.destroy(); });

    // Load v3 assets from CDN
    for (const [key, assetId] of Object.entries(ASSETS)) {
      this.load.image(key, `${ASSET_BASE}/${assetId}`);
    }
  }

  create() {
    const s = TILE_SIZE * SCALE;

    // Generate remaining tiles that aren't in CDN
    const fallbacks: Record<string, number> = {
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
      g.fillStyle(0x000000, 0.1);
      for (let i = 0; i < 6; i++) g.fillRect(Math.random() * s, Math.random() * s, 2, 2);
      g.generateTexture(key, s, s);
      g.destroy();
    }

    this.scene.start("TitleScene");
  }
}
