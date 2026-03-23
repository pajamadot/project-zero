import Phaser from "phaser";
import { TILE_SIZE, SCALE, GAME_WIDTH, GAME_HEIGHT, ENCOUNTER_RATE, COLORS, PLAYER_HP } from "../constants";
import { Player, Direction } from "../entities/Player";
import { NPC } from "../entities/NPC";
import { DialogueSystem } from "../systems/DialogueSystem";
import { InventorySystem } from "../systems/InventorySystem";
import { QuestSystem, QuestState } from "../systems/QuestSystem";
import { saveGame, loadGame, type SaveData } from "../systems/SaveSystem";
import {
  VILLAGE_MAP, DUNGEON_MAP, SOLID_TILES, TILE_TEXTURES,
  TRANSITIONS, BOSS_POSITION, MAP_W, MAP_H,
} from "../data/maps";
import { NPC_DATA } from "../data/npcs";
import { fadeOut, fadeIn, battleTransition } from "../systems/Effects";

const CELL = TILE_SIZE * SCALE;

export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private npcs: (NPC | Phaser.GameObjects.Sprite)[] = [];
  private dialogue!: DialogueSystem;
  private inventory!: InventorySystem;
  private quests!: QuestSystem;
  private currentMap = "village";
  private mapTiles: Phaser.GameObjects.Image[] = [];
  private stepCount = 0;
  private bossDefeated = false;
  private enemiesDefeated = 0;
  private startTime = 0;
  private hud!: Phaser.GameObjects.Text;
  private areaLabel?: Phaser.GameObjects.Text;

  constructor() {
    super("WorldScene");
  }

  create(data?: { loadSave?: boolean }) {
    this.dialogue = new DialogueSystem(this);
    this.inventory = new InventorySystem();
    this.quests = new QuestSystem();
    this.startTime = Date.now();
    this.stepCount = 0;
    this.enemiesDefeated = 0;
    this.bossDefeated = false;

    // Load save or start fresh
    if (data?.loadSave) {
      const save = loadGame();
      if (save) {
        this.loadFromSave(save);
        return;
      }
    }

    // Fresh start: 3 potions
    this.inventory.addItem({ id: "potion", name: "Potion", type: "consumable", power: 15 });
    this.inventory.addItem({ id: "potion", name: "Potion", type: "consumable", power: 15 });
    this.inventory.addItem({ id: "potion", name: "Potion", type: "consumable", power: 15 });

    this.loadMap("village", 13, 10);
    this.createHUD();
    this.showAreaName("Sleepy Village");
    fadeIn(this, 600);
  }

  // ============ SAVE/LOAD ============

  private loadFromSave(save: SaveData) {
    this.bossDefeated = save.bossDefeated;
    this.stepCount = save.stepCount;
    if (save.quest === "active") this.quests.activate("main");
    if (save.quest === "complete") { this.quests.activate("main"); this.quests.complete("main"); }
    for (const item of save.inventory) this.inventory.addItem(item as { id: string; name: string; type: "consumable" | "key"; power?: number });

    this.loadMap(save.currentMap, save.player.gridX, save.player.gridY);
    this.player.setData("hp", save.player.hp);
    this.createHUD();
    this.showAreaName(save.currentMap === "village" ? "Sleepy Village" : "Dark Dungeon");
    fadeIn(this, 600);
  }

  private autoSave() {
    saveGame({
      version: 1,
      timestamp: new Date().toISOString(),
      player: {
        hp: (this.player.getData("hp") as number) || PLAYER_HP,
        gridX: this.player.gridX,
        gridY: this.player.gridY,
        facing: this.player.facing,
      },
      inventory: this.inventory.getItems(),
      quest: this.quests.getState("main"),
      currentMap: this.currentMap,
      bossDefeated: this.bossDefeated,
      stepCount: this.stepCount,
    });
  }

  // ============ MAP ============

  private loadMap(mapName: string, spawnX: number, spawnY: number) {
    this.mapTiles.forEach((t) => t.destroy());
    this.mapTiles = [];
    this.npcs.forEach((n) => n.destroy());
    this.npcs = [];
    this.currentMap = mapName;

    const mapData = mapName === "village" ? VILLAGE_MAP : DUNGEON_MAP;
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const tileType = mapData[y]?.[x] ?? 0;
        const textureKey = TILE_TEXTURES[tileType];
        if (textureKey) {
          const tile = this.add.image(x * CELL + CELL / 2, y * CELL + CELL / 2, textureKey).setDepth(0);
          this.mapTiles.push(tile);
        }
      }
    }

    if (this.player) this.player.destroy();
    this.player = new Player(this, spawnX, spawnY, (gx, gy) => this.isSolid(gx, gy));
    this.player.onStep((gx, gy) => this.onPlayerStep(gx, gy));
    this.player.onInteract((gx, gy, dir) => this.onPlayerInteract(gx, gy, dir));

    // No continuous bobbing — handled per-step in onPlayerStep

    if (mapName === "village") this.spawnVillageNPCs();
    if (mapName === "dungeon" && !this.bossDefeated) {
      const bossMarker = this.add.sprite(BOSS_POSITION.x * CELL + CELL / 2, BOSS_POSITION.y * CELL + CELL / 2, "boss").setDepth(5);
      bossMarker.setData("isBoss", true);
      // Boss idle animation
      this.tweens.add({ targets: bossMarker, scaleX: 1.05, scaleY: 0.95, duration: 600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      this.npcs.push(bossMarker as unknown as NPC);
    }

    this.cameras.main.setBounds(0, 0, MAP_W * CELL, MAP_H * CELL);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Auto-save on map change
    this.time.delayedCall(500, () => this.autoSave());
  }

  private spawnVillageNPCs() {
    for (const data of NPC_DATA) {
      const npc = new NPC(this, data.gridX, data.gridY, data.texture, data.name);
      // NPC idle bobbing
      this.tweens.add({ targets: npc, y: npc.y - 2, duration: 1200 + Math.random() * 400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      this.npcs.push(npc);
    }
  }

  // ============ AREA NAME POPUP ============

  private showAreaName(name: string) {
    this.areaLabel?.destroy();
    this.areaLabel = this.add.text(GAME_WIDTH / 2, 40, name, {
      fontSize: "20px", fontFamily: "monospace", color: "#e4e4ef",
      stroke: "#000000", strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

    this.tweens.add({
      targets: this.areaLabel, alpha: 1, y: 50, duration: 400, ease: "Back.easeOut",
      onComplete: () => {
        this.tweens.add({ targets: this.areaLabel, alpha: 0, delay: 1500, duration: 600 });
      },
    });
  }

  // ============ COLLISION ============

  private isSolid(gx: number, gy: number): boolean {
    if (gx < 0 || gy < 0 || gx >= MAP_W || gy >= MAP_H) return true;
    const mapData = this.currentMap === "village" ? VILLAGE_MAP : DUNGEON_MAP;
    if (SOLID_TILES.has(mapData[gy]?.[gx] ?? 0)) return true;
    for (const npc of this.npcs) {
      if (npc instanceof NPC && npc.gridX === gx && npc.gridY === gy) return true;
    }
    return false;
  }

  // ============ STEP + TRANSITIONS ============

  private onPlayerStep(gx: number, gy: number) {
    this.stepCount++;

    // Walk bob: quick squash-stretch on each step
    this.tweens.add({
      targets: this.player,
      scaleX: 1.08, scaleY: 0.92,
      duration: 80, yoyo: true, ease: "Sine.easeOut",
    });

    for (const t of TRANSITIONS) {
      if (t.fromMap === this.currentMap && t.fromX === gx && t.fromY === gy) {
        if (t.toMap === "dungeon" && this.quests.getState("main") === QuestState.INACTIVE) {
          this.dialogue.show([{ text: "The path is dark and dangerous. Maybe I should talk to someone first..." }]);
          this.player.teleport(gx, gy - 1);
          return;
        }
        fadeOut(this, 300).then(() => {
          this.loadMap(t.toMap, t.toX, t.toY + 1);
          this.showAreaName(t.toMap === "village" ? "Sleepy Village" : "Dark Dungeon");
          fadeIn(this, 300);
        });
        return;
      }
    }

    if (this.currentMap === "dungeon" && !this.bossDefeated && Math.random() < ENCOUNTER_RATE) {
      this.startBattle("slime");
    }
  }

  // ============ NPC INTERACTION ============

  private onPlayerInteract(gx: number, gy: number, _dir: Direction) {
    if (this.dialogue.isActive()) return;
    for (const npc of this.npcs) {
      const npcGx = npc instanceof NPC ? npc.gridX : Math.floor((npc.x - CELL / 2) / CELL);
      const npcGy = npc instanceof NPC ? npc.gridY : Math.floor((npc.y - CELL / 2) / CELL);
      if (npcGx === gx && npcGy === gy) {
        if (npc.getData?.("isBoss")) {
          this.dialogue.show([{ text: "A massive shadow blocks your path!\nThe Dark Slime King appears!" }], () => this.startBattle("boss"));
          return;
        }
        if (npc instanceof NPC) this.handleNPCDialogue(npc);
        return;
      }
    }
  }

  private handleNPCDialogue(npc: NPC) {
    const data = NPC_DATA.find((d) => d.name === npc.npcName);
    if (!data) return;
    const qs = this.quests.getState("main");

    if (data.name === "Elder" && qs === QuestState.INACTIVE) {
      this.dialogue.show([
        { text: "Elder: Brave adventurer! A terrible evil lurks in the dungeon to the south." },
        { text: "Elder: The Dark Slime King threatens our village. Will you defeat it?" },
        { text: "Elder: Will you accept this quest?", choices: [{ text: "Yes, I'll do it!", value: "accept" }, { text: "Not yet...", value: "decline" }] },
      ], (result) => {
        if (result === "accept") {
          this.quests.activate("main");
          this.dialogue.show([{ text: "Elder: Thank you! Take this potion. Head south to the dungeon." }]);
          this.inventory.addItem({ id: "potion", name: "Potion", type: "consumable", power: 15 });
        }
      });
    } else if (data.name === "Elder" && qs === QuestState.ACTIVE) {
      this.dialogue.show([{ text: "Elder: Please hurry! Defeat the Dark Slime King!" }]);
    } else if (data.name === "Elder" && qs === QuestState.COMPLETE) {
      this.showVictory();
    } else if (data.name === "Guard") {
      this.dialogue.show([{ text: qs === QuestState.INACTIVE ? "Guard: The dungeon is dangerous. Talk to the Elder first." : "Guard: Be careful! Use potions to heal." }]);
    } else if (data.name === "Merchant") {
      this.dialogue.show([{ text: "Merchant: Welcome! Here, take a potion." }], () => {
        if (!this.inventory.addItem({ id: "potion", name: "Potion", type: "consumable", power: 15 })) {
          this.dialogue.show([{ text: "Your inventory is full!" }]);
        }
      });
    }
  }

  // ============ BATTLE ============

  private startBattle(enemyType: string) {
    this.autoSave();
    battleTransition(this).then(() => this.scene.pause());
    this.scene.launch("BattleScene", {
      enemyType,
      playerHP: (this.player.getData("hp") as number) || PLAYER_HP,
      inventory: this.inventory,
      onWin: (remainingHP: number, loot?: boolean) => {
        this.player.setData("hp", remainingHP);
        this.enemiesDefeated++;

        // Loot drop: 40% potion on slime kill
        if (enemyType === "slime" && Math.random() < 0.4) {
          const added = this.inventory.addItem({ id: "potion", name: "Potion", type: "consumable", power: 15 });
          if (added) this.dialogue.show([{ text: "The slime dropped a Potion!" }]);
        }

        if (enemyType === "boss") {
          this.bossDefeated = true;
          this.quests.complete("main");
          this.npcs = this.npcs.filter((n) => { if (n.getData?.("isBoss")) { n.destroy(); return false; } return true; });
          this.dialogue.show([{ text: "The Dark Slime King is defeated!" }, { text: "Quest complete! Return to the Elder." }]);
        }
        this.updateHUD();
        this.autoSave();
      },
      onLose: () => this.gameOver(),
    });
  }

  // ============ VICTORY ============

  private showVictory() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;

    fadeOut(this, 400).then(() => {
      // Victory overlay
      this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.9).setScrollFactor(0).setDepth(300);

      const title = this.add.text(GAME_WIDTH / 2, 80, "VICTORY!", {
        fontSize: "40px", fontFamily: "monospace", color: "#6c8aff",
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
      this.tweens.add({ targets: title, scale: 1.1, duration: 600, yoyo: true, repeat: -1 });

      this.add.text(GAME_WIDTH / 2, 140, "The village is saved!", {
        fontSize: "16px", fontFamily: "monospace", color: "#e4e4ef",
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

      // Stats
      const stats = [
        `Time: ${mins}m ${secs}s`,
        `Steps: ${this.stepCount}`,
        `Enemies defeated: ${this.enemiesDefeated}`,
        `Potions remaining: ${this.inventory.countItem("potion")}`,
        `HP: ${(this.player.getData("hp") as number) || PLAYER_HP}/${PLAYER_HP}`,
      ];
      stats.forEach((s, i) => {
        this.add.text(GAME_WIDTH / 2, 200 + i * 28, s, {
          fontSize: "14px", fontFamily: "monospace", color: "#8888aa",
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
      });

      // Sparkle particles
      for (let i = 0; i < 20; i++) {
        const p = this.add.circle(
          Phaser.Math.Between(50, GAME_WIDTH - 50), Phaser.Math.Between(50, GAME_HEIGHT - 50),
          Phaser.Math.Between(1, 3), 0x6c8aff,
        ).setScrollFactor(0).setDepth(302).setAlpha(0);
        this.tweens.add({
          targets: p, alpha: 0.8, y: p.y - Phaser.Math.Between(30, 80),
          duration: Phaser.Math.Between(1000, 2000), delay: i * 100,
          yoyo: true, repeat: -1, ease: "Sine.easeInOut",
        });
      }

      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, "Press SPACE to return to title", {
        fontSize: "12px", fontFamily: "monospace", color: "#555566",
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

      this.input.keyboard!.once("keydown-SPACE", () => this.scene.start("TitleScene"));
    });
  }

  // ============ GAME OVER ============

  private gameOver() {
    this.scene.stop("BattleScene");
    fadeOut(this, 300).then(() => {
      this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.9).setScrollFactor(0).setDepth(300);

      const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, "GAME OVER", {
        fontSize: "36px", fontFamily: "monospace", color: "#cc3333",
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
      this.tweens.add({ targets: text, alpha: 0.5, duration: 800, yoyo: true, repeat: -1 });

      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, `Steps: ${this.stepCount}  Enemies: ${this.enemiesDefeated}`, {
        fontSize: "12px", fontFamily: "monospace", color: "#888888",
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, "SPACE: Retry  |  ENTER: Title", {
        fontSize: "14px", fontFamily: "monospace", color: "#aaaaaa",
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

      this.input.keyboard!.once("keydown-SPACE", () => this.scene.restart());
      this.input.keyboard!.once("keydown-ENTER", () => this.scene.start("TitleScene"));
    });
  }

  // ============ HUD ============

  private createHUD() {
    this.hud = this.add.text(8, 8, "", {
      fontSize: "13px", fontFamily: "monospace", color: "#e4e4ef",
      backgroundColor: "#00000099", padding: { x: 8, y: 4 },
    }).setScrollFactor(0).setDepth(100);
    this.updateHUD();
  }

  private updateHUD() {
    const hp = (this.player?.getData("hp") as number) || PLAYER_HP;
    const quest = this.quests.getState("main");
    const qText = quest === QuestState.ACTIVE ? " | Quest: Defeat Boss" : quest === QuestState.COMPLETE ? " | Quest: Done!" : "";
    this.hud.setText(`HP ${hp}/${PLAYER_HP} | Potions ${this.inventory.countItem("potion")} | Steps ${this.stepCount}${qText}`);
  }

  // ============ UPDATE ============

  update(_time: number, _delta: number) {
    if (!this.dialogue.isActive()) this.player.update();
    this.dialogue.update();
    this.updateHUD();
  }
}
