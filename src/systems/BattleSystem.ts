import { DAMAGE_VARIANCE, PLAYER_ATK, PLAYER_DEF, POTION_HEAL, PLAYER_HP } from "../constants";
import { EnemyDef } from "../data/enemies";

export interface BattleState {
  playerHP: number;
  playerMaxHP: number;
  playerATK: number;
  playerDEF: number;
  enemyHP: number;
  enemyMaxHP: number;
  enemy: EnemyDef;
  defending: boolean;
  log: string[];
}

export function createBattleState(enemy: EnemyDef, playerHP: number): BattleState {
  return {
    playerHP,
    playerMaxHP: PLAYER_HP,
    playerATK: PLAYER_ATK,
    playerDEF: PLAYER_DEF,
    enemyHP: enemy.hp,
    enemyMaxHP: enemy.hp,
    enemy,
    defending: false,
    log: [`A wild ${enemy.name} appears!`],
  };
}

function calcDamage(atk: number, def: number): number {
  const variance = Math.floor(Math.random() * (DAMAGE_VARIANCE * 2 + 1)) - DAMAGE_VARIANCE;
  return Math.max(1, atk - def + variance);
}

export function playerAttack(state: BattleState): string {
  state.defending = false;
  const dmg = calcDamage(state.playerATK, state.enemy.def);
  state.enemyHP = Math.max(0, state.enemyHP - dmg);
  const msg = `You attack for ${dmg} damage!`;
  state.log.push(msg);
  return msg;
}

export function playerDefend(state: BattleState): string {
  state.defending = true;
  const msg = "You brace yourself! Defense doubled this turn.";
  state.log.push(msg);
  return msg;
}

export function playerUsePotion(state: BattleState): string {
  state.defending = false;
  const heal = POTION_HEAL + Math.floor(Math.random() * 4);
  state.playerHP = Math.min(state.playerMaxHP, state.playerHP + heal);
  const msg = `You use a Potion and heal ${heal} HP!`;
  state.log.push(msg);
  return msg;
}

export function playerFlee(): { success: boolean; msg: string } {
  const success = Math.random() < 0.5;
  const msg = success ? "You fled successfully!" : "Couldn't escape!";
  return { success, msg };
}

export function enemyTurn(state: BattleState): string {
  const def = state.defending ? state.playerDEF * 2 : state.playerDEF;
  const dmg = calcDamage(state.enemy.atk, def);
  state.playerHP = Math.max(0, state.playerHP - dmg);
  state.defending = false;
  const msg = `${state.enemy.name} attacks for ${dmg} damage!`;
  state.log.push(msg);
  return msg;
}
