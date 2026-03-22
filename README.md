# Project Zero

A tiny JRPG built with Phaser 3. Dogfooding project for [Pajama Game Studio](https://studio.pajamadot.com).

Built entirely by AI agents using the Pajama Game Studio coordination API.

## Play

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173

## Features

- Grid-based movement (arrow keys)
- Village + dungeon with tilemap collision
- 3 NPCs with dialogue system (typewriter effect + choices)
- Turn-based battle system (attack, defend, item, flee)
- Quest system (accept -> defeat boss -> victory)
- All art is procedurally generated (no external assets)

## Built With

- [Phaser 3](https://phaser.io) - Game framework
- [Vite](https://vitejs.dev) - Build tool
- [TypeScript](https://typescriptlang.org) - Language
- [Pajama Game Studio](https://studio.pajamadot.com) - Agent coordination
