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
| **Framework** | Astro v7 (static output) |
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
│   ├── game/               # Client runtime, pause-aware clock, balance, phases
│   ├── haptics/            # Gamepad vibration manager
│   ├── input/              # Keyboard, mouse, touch handlers
│   ├── particles/          # Particle system (ambient, effects)
│   ├── ui/                 # UI components (sound toggle)
│   └── utils/              # Color helpers, math utilities
├── pages/
│   └── index.astro         # Page shell, controls, styles
└── styles/                 # Global styles
```

## Core Systems

### Audio (Tone.js)
- **MusicLoopSystem** — Dynamic loops with level-based progression
- **SFXEngine** — Reactive sound effects (collect, level up, modal events, enemy interactions)

### Haptics
- `HapticManager` — Unified Gamepad API wrapper for vibration feedback on controllers

### Game Loop
- Original per-animation-frame movement and cursor response; pause-aware elapsed-time timers
- Pause button and P / Escape; hidden tabs and completion dialogs pause simulation
- Restart clears pending gameplay timers and restores the full tutorial
- Enemy speed caps grow with progression (2× / 3× / 4×; 8× after credits)
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
| `npm ci` | Install locked dependencies (Node 22.12+; `.nvmrc` selects 22) |
| `npm run check` | Strict Astro / TypeScript checks |
| `npm test` | Timing, balance, restart and collision regression tests |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build production bundle to `./dist/` |
| `npm run preview` | Preview build locally |

## Deployment and verification

This is a static site. Vercel's Astro preset builds with `npm run build` and serves
`dist/`; no server adapter is required. See the
[official deployment guide](https://docs.astro.build/en/guides/deploy/vercel/).
Use Node 22.12 or newer on the host. Deployment settings have not been changed remotely.

CI runs type checks, regression tests, production build, and the dependency audit.
See [the audit](docs/AUDIT-2026-09-27.md) for findings and remaining work.

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

## Next Codex session

Read [the handoff](docs/NEXT-SESSION.md) first. The last tested original-based
version is preserved at `/playtest`; the rejected Flow redesign was removed.
