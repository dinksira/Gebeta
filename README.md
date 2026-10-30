<div align="center">

# 𓃲 GEBETA ONLINE
### *The Ancient Ethiopian Board Game, Reimagined for the Modern Era.*

[![CI Status](https://github.com/dinksira/Gebeta/actions/workflows/ci.yml/badge.svg)](https://github.com/dinksira/Gebeta/actions)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React Native & Expo](https://img.shields.io/badge/Expo-SDK%2058-black?logo=expo)](https://expo.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

<img src="docs/assets/banner.png" width="100%" alt="Gebeta Banner" onerror="this.style.display='none'" />

</div>

---

## ✨ Overview

**Gebeta** (ገበጣ) is one of the world's oldest mancala-type board games, deeply rooted in Ethiopian culture, strategy, and social gathering. **Gebeta Online** brings this timeless masterpiece to mobile and web platforms with a meticulous blend of authentic cultural aesthetics, buttery-smooth 60fps Reanimated animations, and a bulletproof, deterministic TypeScript game engine.

Designed for high tactile immersion, aged Ethiopian parchment tones, rich carved wooden textures, and multi-language support (English and Amharic Fidel script).

---

## 🏛️ Architecture & Monorepo Structure

Gebeta is engineered as a strict monorepo managed via `pnpm workspaces`:

```
Gebeta/
├── 📦 engine/       # Pure, deterministic TypeScript game rules engine & AI core
├── 📱 app/          # Cross-platform Expo / React Native mobile client
├── 🖥️ server/       # Real-time WebSocket matchmaking & game server
└── 📚 docs/         # Architectural guides, design systems, and phase plans
```

---

## 💎 Core Features

- **Bulletproof Game Engine (`@gebeta/engine`)**: Circular 14-slot mathematical ring, immutable state transitions, step-by-step sowing traces (`SowStep[]`), automatic captures, laps, sweeps, and invariant validation backed by 10,000+ automated soak replay tests.
- **Tactile Wooden Board UI (`@gebeta/app`)**: Dynamic responsive layout, carved pits with legal move glowing rings, river stone seed clusters (`1..12` deterministic placement), and score stores.
- **Pass & Play Local Mode**: Two players on a single device with rotated store scorecards so both players can read scores naturally across the table.
- **Bilingual Internationalization**: Seamless switching between English and Amharic (`Noto Sans Ethiopic`).
- **Strict Code Quality**: Zero-tolerance TypeScript strict mode, ESLint, Prettier, and comprehensive Jest test suites.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- `pnpm` (v9+)

### Installation & Setup
```bash
# Clone the repository
git clone https://github.com/dinksira/Gebeta.git
cd Gebeta

# Install dependencies across all workspace packages
pnpm install
```

### Running Tests
Execute test suites across the entire monorepo:
```bash
pnpm test
```

### Running the Mobile App
Start the Expo development server:
```bash
pnpm --filter @gebeta/app start
```
Scan the generated QR code using **Expo Go** on your Android or iOS device.

---

## 📊 Phase Roadmap

| Milestone | Phase | Description | Status |
| :--- | :--- | :--- | :--- |
| **M1: Offline Game** | Phase 0 | Foundations, Git Workflow, CI/CD | ✅ **Complete** |
| | Phase 1 | Pure TypeScript Game Engine & Soak Tests | ✅ **Complete** |
| | Phase 2 | Board UI, Design Tokens, & Pass and Play | ✅ **Complete** |
| | Phase 3 | AI Minimax Bot, Audio, & Settings | ⏳ **In Progress** |
| **M2: Closed Test** | Phase 4 | Alpha release & 14-day Play Console testing | 📅 Planned |
| **M3: Online Game** | Phase 5-7 | WebSocket Rooms, Matchmaking & Leaderboard | 📅 Planned |
| **M4: Launch** | Phase 8-10| Hardening, Store Polish & Production Release | 📅 Planned |

---

## 📜 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.

<div align="center">
  <br/>
  <p><i>Built with passion for Ethiopian heritage and software craftsmanship.</i></p>
</div>
