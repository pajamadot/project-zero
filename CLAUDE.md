# Project Zero — RPG Maker Style Game

Dogfooding game for Pajama Game Studio. Built entirely through the system
to stress-test every subsystem and fix broken tools.

## Game Concept

A simple RPG where the player explores a small world, talks to NPCs,
fights turn-based battles, and completes a quest. Think: a tiny JRPG
built with Phaser 3.

## Project Structure

```
src/
  main.ts              Game config + entry
  scenes/
    BootScene.ts       Asset loading
    TitleScene.ts      Title screen
    WorldScene.ts      Overworld with tilemap + NPCs
    BattleScene.ts     Turn-based combat
    DialogueScene.ts   NPC dialogue overlay
  entities/
    Player.ts          Player with grid movement
    NPC.ts             NPCs with dialogue
    Enemy.ts           Battle enemies
  systems/
    DialogueSystem.ts  Text display + choices
    BattleSystem.ts    Turn-based combat logic
    InventorySystem.ts Items and equipment
    QuestSystem.ts     Quest tracking
  data/
    maps.json          Tilemap data
    npcs.json          NPC definitions + dialogue
    enemies.json       Enemy stats
    quests.json        Quest definitions
assets/
  sprites/             Character + NPC sprites
  tiles/               Tilemap tiles
  ui/                  Menu, dialogue box, battle UI
  audio/               Music + SFX
```

## Dev Process

This game is built using the /dogfood skill. Every action goes through
the Pajama Game Studio API. See DEV-JOURNAL.md for the full log.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm preview      # Preview build
```

## Coordination

API: https://studio-api.pajamadot.com/api/v1
Game ID: [will be set after registration]
Workspace: [will be set after login]
