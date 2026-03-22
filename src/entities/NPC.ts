import Phaser from "phaser";
import { TILE_SIZE, SCALE } from "../constants";

const CELL = TILE_SIZE * SCALE;

export class NPC extends Phaser.GameObjects.Sprite {
  gridX: number;
  gridY: number;
  npcName: string;

  constructor(scene: Phaser.Scene, gridX: number, gridY: number, texture: string, name: string) {
    super(scene, gridX * CELL + CELL / 2, gridY * CELL + CELL / 2, texture);
    this.gridX = gridX;
    this.gridY = gridY;
    this.npcName = name;
    this.setDepth(5);
    scene.add.existing(this);
  }
}
