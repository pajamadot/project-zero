import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from "../constants";
import { ENEMIES } from "../data/enemies";
import { InventorySystem } from "../systems/InventorySystem";
import {
  BattleState, createBattleState,
  playerAttack, playerDefend, playerUsePotion, playerFlee, enemyTurn,
} from "../systems/BattleSystem";

interface BattleData {
  enemyType: string;
  playerHP: number;
  inventory: InventorySystem;
  onWin: (remainingHP: number) => void;
  onLose: () => void;
}

const MENU_ITEMS = ["Attack", "Defend", "Item", "Flee"] as const;

export class BattleScene extends Phaser.Scene {
  private state!: BattleState;
  private data_!: BattleData;
  private selectedMenu = 0;
  private playerTurn = true;
  private battleOver = false;

  // UI
  private logText!: Phaser.GameObjects.Text;
  private playerHPText!: Phaser.GameObjects.Text;
  private enemyHPText!: Phaser.GameObjects.Text;
  private menuTexts: Phaser.GameObjects.Text[] = [];
  private playerHPBar!: Phaser.GameObjects.Rectangle;
  private enemyHPBar!: Phaser.GameObjects.Rectangle;
  private enemySprite!: Phaser.GameObjects.Sprite;

  constructor() {
    super("BattleScene");
  }

  init(data: BattleData) {
    this.data_ = data;
    this.selectedMenu = 0;
    this.playerTurn = true;
    this.battleOver = false;
  }

  create() {
    const enemyDef = ENEMIES[this.data_.enemyType];
    if (!enemyDef) return;

    this.state = createBattleState(enemyDef, this.data_.playerHP);

    // Background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x111122);

    // Enemy display
    this.enemySprite = this.add.sprite(GAME_WIDTH / 2, 160, enemyDef.texture).setScale(3);

    this.enemyHPText = this.add.text(GAME_WIDTH / 2, 60, "", {
      fontSize: "16px", fontFamily: "monospace", color: "#ffffff",
    }).setOrigin(0.5);

    // Enemy HP bar
    this.add.rectangle(GAME_WIDTH / 2, 85, 204, 14, COLORS.hpBarBg).setOrigin(0.5);
    this.enemyHPBar = this.add.rectangle(GAME_WIDTH / 2 - 100, 85, 200, 10, COLORS.hpBar).setOrigin(0, 0.5);

    // Player stats area
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 180, GAME_WIDTH - 40, 100, 0x1a1a33)
      .setStrokeStyle(2, COLORS.dialogueBorder);

    this.playerHPText = this.add.text(40, GAME_HEIGHT - 220, "", {
      fontSize: "16px", fontFamily: "monospace", color: "#ffffff",
    });

    // Player HP bar
    this.add.rectangle(40, GAME_HEIGHT - 195, 204, 14, COLORS.hpBarBg).setOrigin(0, 0.5);
    this.playerHPBar = this.add.rectangle(42, GAME_HEIGHT - 195, 200, 10, COLORS.hpBar).setOrigin(0, 0.5);

    // Battle log
    this.logText = this.add.text(40, GAME_HEIGHT - 175, "", {
      fontSize: "13px", fontFamily: "monospace", color: "#aaaacc",
      wordWrap: { width: GAME_WIDTH - 80 },
    });

    // Menu
    const menuX = GAME_WIDTH - 200;
    const menuY = GAME_HEIGHT - 100;
    MENU_ITEMS.forEach((item, i) => {
      const t = this.add.text(menuX, menuY + i * 24, "", {
        fontSize: "16px", fontFamily: "monospace", color: "#ffffff",
      });
      this.menuTexts.push(t);
    });

    // Input
    const upKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const downKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const selectKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    upKey.on("down", () => {
      if (!this.playerTurn || this.battleOver) return;
      this.selectedMenu = Math.max(0, this.selectedMenu - 1);
    });
    downKey.on("down", () => {
      if (!this.playerTurn || this.battleOver) return;
      this.selectedMenu = Math.min(MENU_ITEMS.length - 1, this.selectedMenu + 1);
    });

    const onSelect = () => {
      if (this.battleOver) {
        this.endBattle();
        return;
      }
      if (!this.playerTurn) return;
      this.executePlayerAction();
    };
    selectKey.on("down", onSelect);
    enterKey.on("down", onSelect);

    this.updateUI();
  }

  private executePlayerAction() {
    const action = MENU_ITEMS[this.selectedMenu];
    this.playerTurn = false;

    switch (action) {
      case "Attack":
        playerAttack(this.state);
        break;
      case "Defend":
        playerDefend(this.state);
        break;
      case "Item": {
        if (this.data_.inventory.countItem("potion") <= 0) {
          this.state.log.push("No potions left!");
          this.playerTurn = true;
          this.updateUI();
          return;
        }
        this.data_.inventory.removeItem("potion");
        playerUsePotion(this.state);
        break;
      }
      case "Flee": {
        const result = playerFlee();
        this.state.log.push(result.msg);
        if (result.success) {
          this.updateUI();
          this.battleOver = true;
          this.state.log.push("Press SPACE to continue...");
          this.updateUI();
          // Flee = return to world with current HP
          this.data_.onWin(this.state.playerHP);
          this.time.delayedCall(800, () => this.endBattle());
          return;
        }
        break;
      }
    }

    this.updateUI();
    this.shakeSprite(this.enemySprite);

    // Check enemy death
    if (this.state.enemyHP <= 0) {
      this.state.log.push(`${this.state.enemy.name} is defeated!`);
      this.state.log.push("Press SPACE to continue...");
      this.battleOver = true;
      this.updateUI();
      return;
    }

    // Enemy turn after delay
    this.time.delayedCall(600, () => {
      enemyTurn(this.state);
      this.updateUI();

      // Check player death
      if (this.state.playerHP <= 0) {
        this.state.log.push("You have been defeated...");
        this.state.log.push("Press SPACE to continue...");
        this.battleOver = true;
        this.updateUI();
        return;
      }

      this.playerTurn = true;
    });
  }

  private shakeSprite(sprite: Phaser.GameObjects.Sprite) {
    this.tweens.add({
      targets: sprite,
      x: sprite.x + 8,
      duration: 50,
      yoyo: true,
      repeat: 2,
    });
  }

  private updateUI() {
    // HP display
    this.playerHPText.setText(`Hero HP: ${this.state.playerHP}/${this.state.playerMaxHP}`);
    this.enemyHPText.setText(`${this.state.enemy.name} HP: ${this.state.enemyHP}/${this.state.enemyMaxHP}`);

    // HP bars
    const playerRatio = Math.max(0, this.state.playerHP / this.state.playerMaxHP);
    const enemyRatio = Math.max(0, this.state.enemyHP / this.state.enemyMaxHP);
    this.playerHPBar.setSize(200 * playerRatio, 10);
    this.enemyHPBar.setSize(200 * enemyRatio, 10);

    // Color HP bars based on health
    this.playerHPBar.setFillStyle(playerRatio > 0.5 ? COLORS.hpBar : playerRatio > 0.25 ? 0xcccc44 : 0xcc4444);
    this.enemyHPBar.setFillStyle(enemyRatio > 0.5 ? COLORS.hpBar : enemyRatio > 0.25 ? 0xcccc44 : 0xcc4444);

    // Log (last 3 lines)
    const recent = this.state.log.slice(-3).join("\n");
    this.logText.setText(recent);

    // Menu
    this.menuTexts.forEach((t, i) => {
      const prefix = i === this.selectedMenu && this.playerTurn ? "> " : "  ";
      let label = MENU_ITEMS[i] as string;
      if (MENU_ITEMS[i] === "Item") {
        label = `Item (${this.data_.inventory.countItem("potion")})`;
      }
      t.setText(`${prefix}${label}`);
      t.setColor(i === this.selectedMenu && this.playerTurn ? "#ffcc44" : "#aaaacc");
    });
  }

  private endBattle() {
    if (this.state.playerHP <= 0) {
      this.data_.onLose();
    } else {
      this.data_.onWin(this.state.playerHP);
    }
    this.scene.stop();
    this.scene.resume("WorldScene");
  }
}
