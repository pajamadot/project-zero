# Game Design Document: Project Zero

## Overview

A tiny JRPG built with Phaser 3. The player explores a small village,
talks to NPCs, accepts a quest, ventures into a dungeon, fights
turn-based battles, defeats a boss, and returns to the village.
Total playtime: 5-10 minutes. Think: the first 10 minutes of a
classic SNES RPG.

## Player Fantasy

The player should feel like they're on a miniature adventure —
exploring, discovering, making choices in dialogue, and feeling
the satisfaction of defeating enemies and completing a quest.
Nostalgia for 16-bit JRPGs.

## Core Mechanics

- [ ] Grid-based player movement (arrow keys, 16px grid)
- [ ] Tilemap world with collision (village + dungeon areas)
- [ ] NPC interaction (walk up, press Space to talk)
- [ ] Dialogue system (text box, typewriter effect, choices)
- [ ] Turn-based battle system (attack, defend, use item, flee)
- [ ] Simple inventory (potions, key items)
- [ ] Quest system (accept quest, track progress, complete)
- [ ] Boss battle (final encounter with special mechanics)
- [ ] Victory screen (quest complete, return to village)

## Formulas

```
Damage = attacker.atk - defender.def + random(-2, 2)
  Example: 12 atk - 5 def + 1 = 8 damage
  Minimum damage: 1

Heal = potion.power + random(0, 3)
  Example: 20 + 2 = 22 HP restored

Enemy encounter rate: 1 in 8 steps (12.5%) in dungeon
Boss HP: 50
Player HP: 30, ATK: 10, DEF: 5
Slime HP: 8, ATK: 4, DEF: 2
Potion heals: 15 HP
```

## Edge Cases

- Player dies in battle → game over screen → restart from village
- Player talks to NPC twice → different dialogue (already accepted quest)
- Player tries to enter dungeon without quest → NPC blocks path
- Inventory full (max 5 items) → "Can't carry more" message
- Boss defeated → flag set, dungeon enemies stop spawning

## Dependencies

- Tilemap system must be built before world exploration
- NPC system depends on dialogue system
- Battle system is independent of world (separate scene)
- Quest system depends on NPC dialogue (quest giver)
- Boss battle depends on battle system + quest system

## Tuning Knobs

| Knob | Default | Min | Max | Effect |
|------|---------|-----|-----|--------|
| GRID_SIZE | 16 | 8 | 32 | Movement grid resolution |
| PLAYER_SPEED | 160 | 80 | 320 | Walk speed (px/sec) |
| TEXT_SPEED | 30 | 10 | 60 | Typewriter chars/sec |
| ENCOUNTER_RATE | 0.125 | 0.05 | 0.25 | Battle chance per step |
| PLAYER_HP | 30 | 20 | 50 | Starting health |
| PLAYER_ATK | 10 | 5 | 15 | Base attack |
| BOSS_HP | 50 | 30 | 100 | Boss health |
| POTION_HEAL | 15 | 10 | 25 | HP restored per potion |

## Acceptance Criteria

- [ ] Player can move on a grid in 4 directions
- [ ] World has at least 2 areas (village + dungeon) with transitions
- [ ] At least 2 NPCs with unique dialogue
- [ ] Battle system works: attack, defend, item, flee
- [ ] At least 1 enemy type + 1 boss
- [ ] Quest: accept → complete objective → return → victory
- [ ] Game over on death, victory on quest complete
- [ ] Runs at 60fps, no visual glitches
- [ ] Playable in browser, deployable to Cloudflare Pages
