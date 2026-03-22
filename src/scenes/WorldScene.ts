import Phaser from "phaser";
import { TILE_SIZE, SCALE, GAME_WIDTH, GAME_HEIGHT, ENCOUNTER_RATE, COLORS } from "../constants";
import { Player, Direction } from "../entities/Player";
import { NPC } from "../entities/NPC";
import { DialogueSystem } from "../systems/DialogueSystem";
import { InventorySystem } from "../systems/InventorySystem";
import { QuestSystem, QuestState } from "../systems/QuestSystem";
import {
  VILLAGE_MAP, DUNGEON_MAP, SOLID_TILES, TILE_TEXTURES,
  TRANSITIONS, BOSS_POSITION,
} from "../data/maps";
import { NPC_DATA } from "../data/npcs";

const CELL = TILE_SIZE * SCALE;
const MAP_W = 25;
const MAP_H = 19;

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
  private hud!: Phaser.GameObjects.Text;

  constructor() {
    super("WorldScene");
  }

  create() {
    this.dialogue = new DialogueSystem(this);
    this.inventory = new InventorySystem();
    this.quests = new QuestSystem();

    // Add 3 starting potions
    this.inventory.addItem({ id: "potion", name: "Potion", type: "consumable", power: 15 });
    this.inventory.addItem({ id: "potion", name: "Potion", type: "consumable", power: 15 });
    this.inventory.addItem({ id: "potion", name: "Potion", type: "consumable", power: 15 });

    this.loadMap("village", 12, 8);
    this.createHUD();
  }

  private loadMap(mapName: string, spawnX: number, spawnY: number) {
    // Clear previous
    this.mapTiles.forEach((t) => t.destroy());
    this.mapTiles = [];
    this.npcs.forEach((n) => n.destroy());
    this.npcs = [];

    this.currentMap = mapName;
    const mapData = mapName === "village" ? VILLAGE_MAP : DUNGEON_MAP;

    // Render tiles
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const tileType = mapData[y]?.[x] ?? 0;
        const textureKey = TILE_TEXTURES[tileType];
        if (textureKey) {
          const tile = this.add.image(x * CELL + CELL / 2, y * CELL + CELL / 2, textureKey);
          tile.setDepth(0);
          this.mapTiles.push(tile);
        }
      }
    }

    // Create player
    if (this.player) this.player.destroy();
    this.player = new Player(this, spawnX, spawnY, (gx, gy) =>
      this.isSolid(gx, gy),
    );

    this.player.onStep((gx, gy) => this.onPlayerStep(gx, gy));
    this.player.onInteract((gx, gy, dir) => this.onPlayerInteract(gx, gy, dir));

    // Spawn NPCs
    if (mapName === "village") {
      this.spawnVillageNPCs();
    }

    // Spawn boss marker in dungeon
    if (mapName === "dungeon" && !this.bossDefeated) {
      const bossMarker = this.add.sprite(
        BOSS_POSITION.x * CELL + CELL / 2,
        BOSS_POSITION.y * CELL + CELL / 2,
        "boss",
      );
      bossMarker.setDepth(5);
      bossMarker.setData("isBoss", true);
      this.npcs.push(bossMarker as unknown as NPC);
    }

    // Camera
    this.cameras.main.setBounds(0, 0, MAP_W * CELL, MAP_H * CELL);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  private spawnVillageNPCs() {
    for (const data of NPC_DATA) {
      const npc = new NPC(this, data.gridX, data.gridY, data.texture, data.name);
      this.npcs.push(npc);
    }
  }

  private isSolid(gx: number, gy: number): boolean {
    // Out of bounds
    if (gx < 0 || gy < 0 || gx >= MAP_W || gy >= MAP_H) return true;

    const mapData = this.currentMap === "village" ? VILLAGE_MAP : DUNGEON_MAP;
    const tileType = mapData[gy]?.[gx] ?? 0;
    if (SOLID_TILES.has(tileType)) return true;

    // NPC collision
    for (const npc of this.npcs) {
      if (npc instanceof NPC && npc.gridX === gx && npc.gridY === gy) return true;
    }

    return false;
  }

  private onPlayerStep(gx: number, gy: number) {
    // Check map transitions
    for (const t of TRANSITIONS) {
      if (t.fromMap === this.currentMap && t.fromX === gx && t.fromY === gy) {
        // Guard: can't enter dungeon without quest
        if (t.toMap === "dungeon" && this.quests.getState("main") === QuestState.INACTIVE) {
          this.dialogue.show([
            { text: "The path is dark and dangerous. Maybe I should talk to someone in the village first..." },
          ]);
          // Push player back
          this.player.teleport(gx, gy - 1);
          return;
        }
        this.loadMap(t.toMap, t.toX, t.toY + 1);
        return;
      }
    }

    // Random encounter in dungeon
    if (this.currentMap === "dungeon" && !this.bossDefeated) {
      this.stepCount++;
      if (Math.random() < ENCOUNTER_RATE) {
        this.startBattle("slime");
      }
    }
  }

  private onPlayerInteract(gx: number, gy: number, dir: Direction) {
    if (this.dialogue.isActive()) return;

    // Check NPC at facing tile
    for (const npc of this.npcs) {
      const npcGx = npc instanceof NPC ? npc.gridX : Math.floor((npc.x - CELL / 2) / CELL);
      const npcGy = npc instanceof NPC ? npc.gridY : Math.floor((npc.y - CELL / 2) / CELL);

      if (npcGx === gx && npcGy === gy) {
        // Boss encounter
        if (npc.getData?.("isBoss")) {
          this.dialogue.show(
            [{ text: "A massive shadow blocks your path!\nThe Dark Slime King appears!" }],
            () => this.startBattle("boss"),
          );
          return;
        }

        // Regular NPC
        if (npc instanceof NPC) {
          this.handleNPCDialogue(npc);
        }
        return;
      }
    }
  }

  private handleNPCDialogue(npc: NPC) {
    const data = NPC_DATA.find((d) => d.name === npc.npcName);
    if (!data) return;

    const questState = this.quests.getState("main");

    if (data.name === "Elder" && questState === QuestState.INACTIVE) {
      // Quest giver
      this.dialogue.show(
        [
          { text: "Elder: Brave adventurer! A terrible evil lurks in the dungeon to the south." },
          { text: "Elder: The Dark Slime King threatens our village. Will you defeat it?" },
          {
            text: "Elder: Will you accept this quest?",
            choices: [
              { text: "Yes, I'll do it!", value: "accept" },
              { text: "Not yet...", value: "decline" },
            ],
          },
        ],
        (result) => {
          if (result === "accept") {
            this.quests.activate("main");
            this.dialogue.show([
              { text: "Elder: Thank you! Take this potion. The dungeon entrance is to the south." },
            ]);
            this.inventory.addItem({ id: "potion", name: "Potion", type: "consumable", power: 15 });
          }
        },
      );
    } else if (data.name === "Elder" && questState === QuestState.ACTIVE) {
      this.dialogue.show([
        { text: "Elder: Please hurry! Defeat the Dark Slime King in the dungeon!" },
      ]);
    } else if (data.name === "Elder" && questState === QuestState.COMPLETE) {
      this.dialogue.show([
        { text: "Elder: You are a true hero! The village is safe, thanks to you!" },
      ]);
    } else if (data.name === "Guard") {
      if (questState === QuestState.INACTIVE) {
        this.dialogue.show([
          { text: "Guard: The dungeon to the south is dangerous. Talk to the Elder first." },
        ]);
      } else {
        this.dialogue.show([
          { text: "Guard: Be careful in the dungeon! Use potions to heal." },
        ]);
      }
    } else if (data.name === "Merchant") {
      this.dialogue.show([
        { text: "Merchant: Welcome! Here, take a potion on the house." },
      ], () => {
        const added = this.inventory.addItem({ id: "potion", name: "Potion", type: "consumable", power: 15 });
        if (!added) {
          this.dialogue.show([{ text: "Your inventory is full!" }]);
        }
      });
    }
  }

  private startBattle(enemyType: string) {
    this.scene.launch("BattleScene", {
      enemyType,
      playerHP: this.player.getData("hp") as number || 30,
      inventory: this.inventory,
      onWin: (remainingHP: number) => {
        this.player.setData("hp", remainingHP);
        if (enemyType === "boss") {
          this.bossDefeated = true;
          this.quests.complete("main");
          // Remove boss sprite
          this.npcs = this.npcs.filter((n) => {
            if (n.getData?.("isBoss")) {
              n.destroy();
              return false;
            }
            return true;
          });
          this.dialogue.show([
            { text: "The Dark Slime King is defeated!" },
            { text: "Quest complete! Return to the Elder." },
          ]);
        }
        this.updateHUD();
      },
      onLose: () => {
        this.gameOver();
      },
    });
    this.scene.pause();
  }

  private createHUD() {
    this.hud = this.add
      .text(8, 8, "", {
        fontSize: "14px",
        fontFamily: "monospace",
        color: "#ffffff",
        backgroundColor: "#00000088",
        padding: { x: 6, y: 4 },
      })
      .setScrollFactor(0)
      .setDepth(100);
    this.updateHUD();
  }

  private updateHUD() {
    const hp = (this.player?.getData("hp") as number) || 30;
    const quest = this.quests.getState("main");
    const questText =
      quest === QuestState.ACTIVE ? "Quest: Defeat the Dark Slime King"
      : quest === QuestState.COMPLETE ? "Quest: Complete!"
      : "";
    this.hud.setText(`HP: ${hp}/30  Potions: ${this.inventory.countItem("potion")}  ${questText}`);
  }

  update(_time: number, _delta: number) {
    if (!this.dialogue.isActive()) {
      this.player.update();
    }
    this.dialogue.update();
    this.updateHUD();
  }

  private gameOver() {
    this.scene.stop("BattleScene");
    // Show game over then restart
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT,
      0x000000, 0.8,
    ).setScrollFactor(0).setDepth(200);

    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, "GAME OVER", {
      fontSize: "36px",
      fontFamily: "monospace",
      color: "#cc3333",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    const restart = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, "Press SPACE to restart", {
      fontSize: "16px",
      fontFamily: "monospace",
      color: "#aaaaaa",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    this.input.keyboard!.once("keydown-SPACE", () => {
      overlay.destroy();
      text.destroy();
      restart.destroy();
      this.scene.restart();
    });
  }
}
