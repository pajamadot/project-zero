import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "../constants";

/**
 * Visual effects system — screen transitions, particles, damage numbers, camera shake.
 * All effects are non-blocking and auto-cleanup.
 */

// ============ SCREEN TRANSITIONS ============

export function fadeOut(scene: Phaser.Scene, duration = 400): Promise<void> {
  return new Promise((resolve) => {
    scene.cameras.main.fadeOut(duration, 0, 0, 0);
    scene.cameras.main.once("camerafadeoutcomplete", () => resolve());
  });
}

export function fadeIn(scene: Phaser.Scene, duration = 400): Promise<void> {
  return new Promise((resolve) => {
    scene.cameras.main.fadeIn(duration, 0, 0, 0);
    scene.cameras.main.once("camerafadeincomplete", () => resolve());
  });
}

// ============ BATTLE TRANSITION ============

export function battleTransition(scene: Phaser.Scene): Promise<void> {
  return new Promise((resolve) => {
    // Flash white
    scene.cameras.main.flash(200, 255, 255, 255);

    // Create spinning overlay
    const overlay = scene.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH * 2, GAME_HEIGHT * 2,
      0x000000, 0,
    ).setScrollFactor(0).setDepth(999);

    scene.tweens.add({
      targets: overlay,
      alpha: { from: 0, to: 1 },
      angle: { from: 0, to: 90 },
      scaleX: { from: 0.01, to: 3 },
      scaleY: { from: 0.01, to: 3 },
      duration: 500,
      ease: "Cubic.easeIn",
      onComplete: () => {
        overlay.destroy();
        resolve();
      },
    });
  });
}

// ============ DAMAGE NUMBERS ============

export function showDamageNumber(
  scene: Phaser.Scene,
  x: number, y: number,
  amount: number,
  isHeal = false,
): void {
  const color = isHeal ? "#44cc88" : "#ff4444";
  const prefix = isHeal ? "+" : "-";
  const text = scene.add.text(x, y, `${prefix}${amount}`, {
    fontSize: "18px",
    fontFamily: "monospace",
    color,
    stroke: "#000000",
    strokeThickness: 3,
  }).setOrigin(0.5).setDepth(500);

  scene.tweens.add({
    targets: text,
    y: y - 40,
    alpha: { from: 1, to: 0 },
    duration: 800,
    ease: "Cubic.easeOut",
    onComplete: () => text.destroy(),
  });
}

// ============ PARTICLES ============

export function healSparkle(scene: Phaser.Scene, x: number, y: number): void {
  for (let i = 0; i < 8; i++) {
    const particle = scene.add.circle(
      x + Phaser.Math.Between(-20, 20),
      y + Phaser.Math.Between(-20, 20),
      Phaser.Math.Between(2, 4),
      0x44cc88,
    ).setDepth(500).setAlpha(0.8);

    scene.tweens.add({
      targets: particle,
      y: particle.y - Phaser.Math.Between(20, 50),
      alpha: 0,
      scale: 0,
      duration: Phaser.Math.Between(400, 800),
      ease: "Cubic.easeOut",
      delay: i * 50,
      onComplete: () => particle.destroy(),
    });
  }
}

export function hitFlash(scene: Phaser.Scene, target: Phaser.GameObjects.Sprite): void {
  scene.tweens.add({
    targets: target,
    alpha: 0.2,
    duration: 60,
    yoyo: true,
    repeat: 2,
  });
}

// ============ CAMERA EFFECTS ============

export function cameraShake(scene: Phaser.Scene, intensity = 0.01, duration = 150): void {
  scene.cameras.main.shake(duration, intensity);
}

// ============ UI TWEENS ============

export function menuBounce(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject): void {
  scene.tweens.add({
    targets: target,
    scaleX: 1.05,
    scaleY: 1.05,
    duration: 80,
    yoyo: true,
    ease: "Back.easeOut",
  });
}
