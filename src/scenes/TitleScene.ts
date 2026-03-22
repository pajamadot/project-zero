import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from "../constants";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("TitleScene");
  }

  create() {
    // Title
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.3, "PROJECT ZERO", {
        fontSize: "48px",
        fontFamily: "monospace",
        color: "#4488ff",
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.42, "A Tiny JRPG", {
        fontSize: "18px",
        fontFamily: "monospace",
        color: "#888899",
      })
      .setOrigin(0.5);

    // Start prompt (blinking)
    const startText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.65, "Press SPACE or ENTER to start", {
        fontSize: "16px",
        fontFamily: "monospace",
        color: "#aaaacc",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Credits
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.85, "Built by Pajama Game Studio", {
        fontSize: "12px",
        fontFamily: "monospace",
        color: "#555566",
      })
      .setOrigin(0.5);

    // Input
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    const startGame = () => {
      this.scene.start("WorldScene");
    };

    spaceKey.once("down", startGame);
    enterKey.once("down", startGame);
  }
}
