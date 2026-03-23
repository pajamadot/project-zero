import Phaser from "phaser";
import { TILE_SIZE, SCALE, COLORS } from "../constants";

const A = "https://api.pajama.studio/api/v1/assets/file";
const S = TILE_SIZE * SCALE; // 32px rendered size

/**
 * BootScene — Hybrid approach:
 *   Procedural: all gameplay sprites + tiles (pixel-perfect at exact size)
 *   AI-generated: title background, portraits (where large images work)
 */
export class BootScene extends Phaser.Scene {
  constructor() { super("BootScene"); }

  preload() {
    const w = this.cameras.main.width, h = this.cameras.main.height;
    this.add.rectangle(w / 2, h / 2, w * 0.5, 4, 0x222229);
    const bar = this.add.rectangle(w / 2 - w * 0.25, h / 2, 0, 4, 0x6c8aff).setOrigin(0, 0.5);
    this.add.text(w / 2, h / 2 + 20, "Loading...", { fontSize: "12px", fontFamily: "monospace", color: "#6b6b76" }).setOrigin(0.5);
    this.load.on("progress", (p: number) => { bar.width = w * 0.5 * p; });

    // AI assets: only for non-gameplay visuals (correct use case)
    this.load.image("bg-battle", `${A}/asset_a74fe97358954aba`);
    this.load.image("portrait-elder", `${A}/asset_d8c4301e68894ef7`);
  }

  create() {
    this.generateCharacters();
    this.generateEnemies();
    this.generateTiles();
    this.scene.start("TitleScene");
  }

  private generateCharacters() {
    // Hero: blue tunic character with eyes
    this.makeChar("player", COLORS.player, S, { hair: 0x4466aa, skin: 0xffccaa });
    // NPCs
    this.makeChar("npc-elder", 0xff8844, S, { hair: 0xcccccc, skin: 0xffccaa });
    this.makeChar("npc-guard", 0x88aa44, S, { hair: 0x665533, skin: 0xddbb88 });
    this.makeChar("npc-merchant", 0xddaa22, S, { hair: 0x553311, skin: 0xffccaa });
  }

  private makeChar(key: string, bodyColor: number, size: number, details: { hair: number; skin: number }) {
    const g = this.make.graphics({ x: 0, y: 0 });
    const s = size;
    const px = (x: number, y: number, w: number, h: number, c: number) => {
      g.fillStyle(c); g.fillRect(x, y, w, h);
    };

    // Body
    px(s * 0.25, s * 0.35, s * 0.5, s * 0.55, bodyColor);
    // Head
    px(s * 0.25, s * 0.1, s * 0.5, s * 0.35, details.skin);
    // Hair
    px(s * 0.22, s * 0.06, s * 0.56, s * 0.15, details.hair);
    // Eyes
    px(s * 0.32, s * 0.28, s * 0.08, s * 0.08, 0xffffff);
    px(s * 0.56, s * 0.28, s * 0.08, s * 0.08, 0xffffff);
    px(s * 0.34, s * 0.30, s * 0.04, s * 0.04, 0x222244);
    px(s * 0.58, s * 0.30, s * 0.04, s * 0.04, 0x222244);
    // Feet
    px(s * 0.25, s * 0.85, s * 0.18, s * 0.1, 0x553322);
    px(s * 0.57, s * 0.85, s * 0.18, s * 0.1, 0x553322);

    g.generateTexture(key, s, s);
    g.destroy();
  }

  private generateEnemies() {
    // Slime: green blob with eyes
    const g1 = this.make.graphics({ x: 0, y: 0 });
    g1.fillStyle(0x44cc44);
    g1.fillEllipse(S * 0.5, S * 0.6, S * 0.7, S * 0.6);
    g1.fillStyle(0x55dd55);
    g1.fillEllipse(S * 0.5, S * 0.55, S * 0.5, S * 0.35);
    // Eyes
    g1.fillStyle(0xffffff);
    g1.fillCircle(S * 0.38, S * 0.48, S * 0.07);
    g1.fillCircle(S * 0.62, S * 0.48, S * 0.07);
    g1.fillStyle(0x111111);
    g1.fillCircle(S * 0.4, S * 0.5, S * 0.035);
    g1.fillCircle(S * 0.64, S * 0.5, S * 0.035);
    // Mouth
    g1.fillStyle(0x228822);
    g1.fillEllipse(S * 0.5, S * 0.65, S * 0.15, S * 0.06);
    g1.generateTexture("slime", S, S);
    g1.destroy();

    // Boss: large purple slime with crown
    const bs = S * 1.5;
    const g2 = this.make.graphics({ x: 0, y: 0 });
    g2.fillStyle(0x8833aa);
    g2.fillEllipse(bs * 0.5, bs * 0.6, bs * 0.75, bs * 0.65);
    g2.fillStyle(0x9944bb);
    g2.fillEllipse(bs * 0.5, bs * 0.55, bs * 0.55, bs * 0.4);
    // Crown
    g2.fillStyle(0xffcc00);
    g2.fillRect(bs * 0.28, bs * 0.18, bs * 0.44, bs * 0.08);
    g2.fillTriangle(bs * 0.28, bs * 0.18, bs * 0.35, bs * 0.08, bs * 0.42, bs * 0.18);
    g2.fillTriangle(bs * 0.42, bs * 0.18, bs * 0.5, bs * 0.06, bs * 0.58, bs * 0.18);
    g2.fillTriangle(bs * 0.58, bs * 0.18, bs * 0.65, bs * 0.08, bs * 0.72, bs * 0.18);
    // Gem
    g2.fillStyle(0xff3333);
    g2.fillCircle(bs * 0.5, bs * 0.2, bs * 0.03);
    // Eyes
    g2.fillStyle(0xff4444);
    g2.fillCircle(bs * 0.38, bs * 0.45, bs * 0.06);
    g2.fillCircle(bs * 0.62, bs * 0.45, bs * 0.06);
    g2.fillStyle(0xffff00);
    g2.fillCircle(bs * 0.39, bs * 0.44, bs * 0.025);
    g2.fillCircle(bs * 0.63, bs * 0.44, bs * 0.025);
    g2.generateTexture("boss", bs, bs);
    g2.destroy();
  }

  private generateTiles() {
    const tiles: Record<string, { base: number; detail?: number; detailCount?: number }> = {
      "tile-grass":        { base: 0x3a7a3a, detail: 0x2d6a2d, detailCount: 8 },
      "tile-path":         { base: 0xb8a050, detail: 0xa89040, detailCount: 6 },
      "tile-water":        { base: 0x2a5a8a, detail: 0x3a6a9a, detailCount: 4 },
      "tile-wall":         { base: 0x5a5a6e, detail: 0x4a4a5e, detailCount: 3 },
      "tile-tree":         { base: 0x2d5a27, detail: 0x1d4a17, detailCount: 5 },
      "tile-door":         { base: 0x6b3a2a, detail: 0x5b2a1a, detailCount: 2 },
      "tile-roof":         { base: 0x8b4513, detail: 0x7b3503, detailCount: 4 },
      "tile-dungeon-floor": { base: 0x3a3a4e, detail: 0x2a2a3e, detailCount: 6 },
      "tile-dungeon-wall": { base: 0x2a2a3e, detail: 0x1a1a2e, detailCount: 4 },
    };

    for (const [key, cfg] of Object.entries(tiles)) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Base fill
      g.fillStyle(cfg.base);
      g.fillRect(0, 0, S, S);
      // Detail pixels (noise)
      if (cfg.detail) {
        g.fillStyle(cfg.detail);
        for (let i = 0; i < (cfg.detailCount || 4); i++) {
          const px = Math.floor(Math.random() * (S / 2)) * 2;
          const py = Math.floor(Math.random() * (S / 2)) * 2;
          g.fillRect(px, py, 2, 2);
        }
      }
      // Grid lines for tiles (subtle)
      if (key.startsWith("tile-wall") || key === "tile-dungeon-floor") {
        g.fillStyle(0x000000, 0.08);
        g.fillRect(0, S / 2 - 1, S, 1);
        g.fillRect(S / 2 - 1, 0, 1, S);
      }
      g.generateTexture(key, S, S);
      g.destroy();
    }
  }
}
