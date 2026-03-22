import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT, TEXT_SPEED, COLORS, DIALOGUE_BOX_HEIGHT } from "../constants";

export interface DialogueLine {
  text: string;
  choices?: { text: string; value: string }[];
}

export class DialogueSystem {
  private scene: Phaser.Scene;
  private active = false;
  private lines: DialogueLine[] = [];
  private lineIndex = 0;
  private charIndex = 0;
  private charTimer = 0;
  private callback?: (result?: string) => void;
  private selectedChoice = 0;

  // UI elements
  private box?: Phaser.GameObjects.Rectangle;
  private border?: Phaser.GameObjects.Rectangle;
  private textObj?: Phaser.GameObjects.Text;
  private choiceTexts: Phaser.GameObjects.Text[] = [];
  private advanceKey?: Phaser.Input.Keyboard.Key;
  private upKey?: Phaser.Input.Keyboard.Key;
  private downKey?: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.advanceKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.upKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.downKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
  }

  show(lines: DialogueLine[], callback?: (result?: string) => void) {
    this.lines = lines;
    this.lineIndex = 0;
    this.charIndex = 0;
    this.charTimer = 0;
    this.callback = callback;
    this.active = true;
    this.selectedChoice = 0;

    const boxY = GAME_HEIGHT - DIALOGUE_BOX_HEIGHT - 10;
    const boxW = GAME_WIDTH - 40;

    // Border
    this.border = this.scene.add
      .rectangle(GAME_WIDTH / 2, boxY + DIALOGUE_BOX_HEIGHT / 2, boxW + 4, DIALOGUE_BOX_HEIGHT + 4, COLORS.dialogueBorder)
      .setScrollFactor(0)
      .setDepth(150);

    // Background
    this.box = this.scene.add
      .rectangle(GAME_WIDTH / 2, boxY + DIALOGUE_BOX_HEIGHT / 2, boxW, DIALOGUE_BOX_HEIGHT, COLORS.dialogueBg)
      .setScrollFactor(0)
      .setDepth(151);

    // Text
    this.textObj = this.scene.add
      .text(30, boxY + 15, "", {
        fontSize: "15px",
        fontFamily: "monospace",
        color: "#ffffff",
        wordWrap: { width: boxW - 30 },
        lineSpacing: 4,
      })
      .setScrollFactor(0)
      .setDepth(152);
  }

  isActive(): boolean {
    return this.active;
  }

  update() {
    if (!this.active || !this.textObj) return;

    const line = this.lines[this.lineIndex];
    if (!line) return;

    const dt = this.scene.game.loop.delta / 1000;

    // Typewriter effect
    if (this.charIndex < line.text.length) {
      this.charTimer += dt * TEXT_SPEED;
      while (this.charTimer >= 1 && this.charIndex < line.text.length) {
        this.charIndex++;
        this.charTimer -= 1;
      }
      this.textObj.setText(line.text.substring(0, this.charIndex));

      // Skip animation on key press
      if (Phaser.Input.Keyboard.JustDown(this.advanceKey!)) {
        this.charIndex = line.text.length;
        this.textObj.setText(line.text);
      }
      return;
    }

    // Text fully displayed — show choices if any
    if (line.choices && line.choices.length > 0) {
      this.showChoices(line.choices);

      if (Phaser.Input.Keyboard.JustDown(this.upKey!)) {
        this.selectedChoice = Math.max(0, this.selectedChoice - 1);
        this.highlightChoice();
      }
      if (Phaser.Input.Keyboard.JustDown(this.downKey!)) {
        this.selectedChoice = Math.min(line.choices.length - 1, this.selectedChoice + 1);
        this.highlightChoice();
      }
      if (Phaser.Input.Keyboard.JustDown(this.advanceKey!)) {
        const selected = line.choices[this.selectedChoice].value;
        this.close();
        this.callback?.(selected);
      }
      return;
    }

    // Advance to next line or close
    if (Phaser.Input.Keyboard.JustDown(this.advanceKey!)) {
      this.lineIndex++;
      this.charIndex = 0;
      this.charTimer = 0;
      this.clearChoices();

      if (this.lineIndex >= this.lines.length) {
        this.close();
        this.callback?.();
      }
    }
  }

  private showChoices(choices: { text: string; value: string }[]) {
    if (this.choiceTexts.length > 0) return; // already shown

    const boxY = GAME_HEIGHT - DIALOGUE_BOX_HEIGHT - 10;
    choices.forEach((c, i) => {
      const t = this.scene.add
        .text(60, boxY + 60 + i * 22, `${i === this.selectedChoice ? "> " : "  "}${c.text}`, {
          fontSize: "14px",
          fontFamily: "monospace",
          color: i === this.selectedChoice ? "#ffcc44" : "#aaaacc",
        })
        .setScrollFactor(0)
        .setDepth(153);
      this.choiceTexts.push(t);
    });
  }

  private highlightChoice() {
    this.choiceTexts.forEach((t, i) => {
      const line = this.lines[this.lineIndex];
      const label = line.choices![i].text;
      t.setText(`${i === this.selectedChoice ? "> " : "  "}${label}`);
      t.setColor(i === this.selectedChoice ? "#ffcc44" : "#aaaacc");
    });
  }

  private clearChoices() {
    this.choiceTexts.forEach((t) => t.destroy());
    this.choiceTexts = [];
    this.selectedChoice = 0;
  }

  private close() {
    this.active = false;
    this.box?.destroy();
    this.border?.destroy();
    this.textObj?.destroy();
    this.clearChoices();
    this.box = undefined;
    this.border = undefined;
    this.textObj = undefined;
  }
}
