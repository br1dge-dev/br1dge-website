# br1dge-ws

An immersive, interactive web experience featuring real-time audio synthesis, particle physics, and haptics.

## What It Is

A single-page canvas application where users interact with a central logo (∩) by:

- **Collecting energy** — Guide cursor to absorb floating particles and charge the core
- **Progressing through phases** — Tutorial → Orange → Brown → Green particle waves
- **Fending off enemies** — Spiral entities that consume energy and attack the core
- **Unlocking achievements** — Level up with visual effects and sound design

Features include chromatic aberration, shockwaves, haptic feedback (Gamepad API), and mobile touch support.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Astro v5 (static output) |
| **Styling** | TailwindCSS v4 |
| **Language** | TypeScript |
| **Audio** | Tone.js (synthesis, loops, SFX) |
| **Rendering** | HTML5 Canvas 2D |
| **Haptics** | Gamepad Vibration API |
| **Deployment** | Vercel |

## Project Structure

```
src/
├── lib/
│   ├── audio/tone/         # Tone.js engine: ambient, SFX, loops, effects
│   ├── canvas/             # Canvas utilities
│   ├── game/               # Game logic, phases, constants, types
│   ├── haptics/            # Gamepad vibration manager
│   ├── input/              # Keyboard, mouse, touch handlers
│   ├── particles/          # Particle system (ambient, effects)
│   ├── ui/                 # UI components (sound toggle)
│   └── utils/              # Color helpers, math utilities
├── pages/
│   └── index.astro         # Main entry (1300+ lines of game loop)
└── styles/                 # Global styles
```

## Core Systems

### Audio (Tone.js)
- **MusicLoopSystem** — Dynamic loops with level-based progression
- **SFXEngine** — Reactive sound effects (collect, level up, modal events, enemy interactions)

### Haptics
- `HapticManager` — Unified Gamepad API wrapper for vibration feedback on controllers

### Game Loop
- Canvas-based render loop at 60fps
- Phase-based progression (Tutorial → Colored → Complete)
- Enemy spawn system with spiral AI
- Shockwave physics on enemy kill

### Input
- Mouse cursor with custom rendering (hidden system cursor)
- Touch support with vertical offset for visibility
- Keyboard shortcuts

## Commands

| Command | Action |
|---------|--------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build production bundle to `./dist/` |
| `npm run preview` | Preview build locally |

## Links

- **Live:** https://br1dge-website-wl3.vercel.app
- **GitHub:** https://github.com/br1dge-dev/br1dge-website
- **Twitter/X:** @br1dge_eth
- **Farcaster:** @br1dge

## Related Projects

From the br1dge ecosystem:
- [Birth](https://birth.br1dge.xyz/) — Minimalist info card
- [GR1FTSWORD](https://sword-gamma.vercel.app/) — ASCII music crypto art
- [Word of Choice](https://wocl.br1dge.xyz/) — On-chain expression
