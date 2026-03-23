import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "../constants";
import { fadeIn, fadeOut } from "../systems/Effects";

const ASSET_BASE = "https://api.pajama.studio/api/v1/assets/file";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("TitleScene");
  }

  preload() {
    // Load battle background for title screen
    this.load.image("bg-battle", `${ASSET_BASE}/asset_a74fe97358954aba`);
    this.load.image("logo", "/logo.svg");
  }

  create() {
    // Animated background — slow pan
    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "bg-battle")
      .setDisplaySize(GAME_WIDTH * 1.3, GAME_HEIGHT * 1.3)
      .setAlpha(0.3);
    this.tweens.add({
      targets: bg, x: GAME_WIDTH / 2 + 30, y: GAME_HEIGHT / 2 - 20,
      duration: 8000, yoyo: true, repeat: -1, ease: "Sine.easeInOut",
    });

    // Dark overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5);

    // Logo
    const logo = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT * 0.22, "logo")
      .setDisplaySize(80, 80).setAlpha(0);
    this.tweens.add({ targets: logo, alpha: 1, y: GAME_HEIGHT * 0.2, duration: 800, ease: "Back.easeOut" });

    // Title
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.38, "PROJECT ZERO", {
      fontSize: "42px", fontFamily: "monospace", color: "#6c8aff",
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: title, alpha: 1, duration: 600, delay: 300 });

    // Subtitle
    const sub = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.48, "A Tiny JRPG", {
      fontSize: "16px", fontFamily: "monospace", color: "#8888aa",
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: sub, alpha: 1, duration: 600, delay: 500 });

    // Menu options
    const menuY = GAME_HEIGHT * 0.65;
    const newGame = this.add.text(GAME_WIDTH / 2, menuY, "New Game", {
      fontSize: "18px", fontFamily: "monospace", color: "#e4e4ef",
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: newGame, alpha: 1, duration: 400, delay: 700 });

    // Check if save exists
    const hasSave = !!localStorage.getItem("pz_save");
    let continueBtn: Phaser.GameObjects.Text | null = null;
    if (hasSave) {
      continueBtn = this.add.text(GAME_WIDTH / 2, menuY + 30, "Continue", {
        fontSize: "18px", fontFamily: "monospace", color: "#aaaacc",
      }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: continueBtn, alpha: 1, duration: 400, delay: 800 });
    }

    // Start prompt
    const prompt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.88, "Press SPACE or ENTER", {
      fontSize: "12px", fontFamily: "monospace", color: "#555566",
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: prompt, alpha: 0.6, duration: 400, delay: 900 });
    this.tweens.add({ targets: prompt, alpha: 0.2, duration: 800, yoyo: true, repeat: -1, delay: 1300 });

    // Credits
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.95, "Built by Pajama Game Studio", {
      fontSize: "10px", fontFamily: "monospace", color: "#444455",
    }).setOrigin(0.5);

    // Input
    const start = (loadSave = false) => {
      fadeOut(this, 400).then(() => {
        this.scene.start("WorldScene", { loadSave });
      });
    };

    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).once("down", () => start(false));
    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).once("down", () => start(hasSave));

    fadeIn(this, 600);
  }
}
