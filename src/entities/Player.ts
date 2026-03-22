import Phaser from "phaser";
import { TILE_SIZE, SCALE, MOVE_DURATION } from "../constants";

const CELL = TILE_SIZE * SCALE; // 32px per grid cell

export type Direction = "up" | "down" | "left" | "right";

export class Player extends Phaser.GameObjects.Sprite {
  // Grid position (in tile coordinates)
  gridX: number;
  gridY: number;

  // Movement state
  private isMoving = false;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private collisionCheck!: (gx: number, gy: number) => boolean;
  private onStepCallback?: (gx: number, gy: number) => void;
  private onInteractCallback?: (gx: number, gy: number, dir: Direction) => void;
  private interactKey!: Phaser.Input.Keyboard.Key;
  facing: Direction = "down";

  constructor(
    scene: Phaser.Scene,
    gridX: number,
    gridY: number,
    collisionCheck: (gx: number, gy: number) => boolean,
  ) {
    super(scene, gridX * CELL + CELL / 2, gridY * CELL + CELL / 2, "player");
    this.gridX = gridX;
    this.gridY = gridY;
    this.collisionCheck = collisionCheck;

    scene.add.existing(this);
    this.setDepth(10);

    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.interactKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  onStep(cb: (gx: number, gy: number) => void) {
    this.onStepCallback = cb;
  }

  onInteract(cb: (gx: number, gy: number, dir: Direction) => void) {
    this.onInteractCallback = cb;
  }

  update() {
    // Handle interact (Space)
    if (Phaser.Input.Keyboard.JustDown(this.interactKey) && !this.isMoving) {
      const facingTile = this.getFacingTile();
      this.onInteractCallback?.(facingTile.x, facingTile.y, this.facing);
      return;
    }

    if (this.isMoving) return;

    // Read directional input
    let dx = 0;
    let dy = 0;
    let dir: Direction = this.facing;

    if (this.cursors.up.isDown) {
      dy = -1;
      dir = "up";
    } else if (this.cursors.down.isDown) {
      dy = 1;
      dir = "down";
    } else if (this.cursors.left.isDown) {
      dx = -1;
      dir = "left";
    } else if (this.cursors.right.isDown) {
      dx = 1;
      dir = "right";
    }

    if (dx === 0 && dy === 0) return;

    this.facing = dir;
    const targetX = this.gridX + dx;
    const targetY = this.gridY + dy;

    // Collision check
    if (this.collisionCheck(targetX, targetY)) return;

    // Move with tween (smooth grid movement)
    this.isMoving = true;
    this.gridX = targetX;
    this.gridY = targetY;

    this.scene.tweens.add({
      targets: this,
      x: targetX * CELL + CELL / 2,
      y: targetY * CELL + CELL / 2,
      duration: MOVE_DURATION,
      ease: "Linear",
      onComplete: () => {
        this.isMoving = false;
        this.onStepCallback?.(this.gridX, this.gridY);
      },
    });
  }

  getFacingTile(): { x: number; y: number } {
    const offsets: Record<Direction, { x: number; y: number }> = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    };
    const off = offsets[this.facing];
    return { x: this.gridX + off.x, y: this.gridY + off.y };
  }

  teleport(gx: number, gy: number) {
    this.gridX = gx;
    this.gridY = gy;
    this.x = gx * CELL + CELL / 2;
    this.y = gy * CELL + CELL / 2;
  }
}
