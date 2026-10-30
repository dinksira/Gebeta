# Phase 2: Board UI and Local Play — Master Implementation Specification & Execution Prompt

> **Document Type:** Master Implementation Specification & Autonomous Execution Prompt  
> **Target Package:** `@gebeta/app` (`d:\Projects\Gebeta\app`)  
> **Status:** Ready for Immediate Execution  
> **Prerequisites:** Phase 0 (Foundations) — **Verified** | Phase 1 (Game Engine) — **Verified & Tested** (49/49 tests pass, 10,000 soak replay pass)  
> **Delivery Milestone:** Milestone 1 (Offline Game) — Phase 2 of 11  

---

## 1. Executive Summary & Phase 2 Objectives

### 1.1 Context & Current Milestone
The Gebeta project has completed:
* **Phase 0:** Workspace configuration, continuous integration, TypeScript strictness, and game rules consensus.
* **Phase 1:** Pure, deterministic game engine in `@gebeta/engine` with circular 14-slot math, state transitions (`applyMove`), step traces (`SowStep[]`), captures, laps, sweeps, invariants, and a 10,000-game soak/replay test suite.

**Phase 2 is the bridge from pure TypeScript logic to a living, tactile mobile application.**

### 1.2 Core Goal of Phase 2
Deliver a **polished, 60fps, tactile wooden Gebeta board UI** running on React Native / Expo with **Pass and Play local two-player mode**, allowing two players to play a complete game of Gebeta on a single phone from start to finish without visual glitches or animation lag.

### 1.3 Key Deliverables
1. **Expo & React Native Foundation:** Modern Expo app setup with navigation, TypeScript strict mode, and full workspace linkage to `@gebeta/engine`.
2. **Design Tokens & Theme System:** Pixel-accurate implementation of colors (`woodMid`, `woodGlow`, `saffron`, `forest`, `terracotta`), typography, spacing, and elevation matching `docs/Design System.md`.
3. **Bilingual Internationalization (`i18n`):** Full English and Amharic dictionaries with automatic interpolation and zero hardcoded strings.
4. **State Management (`gameStore` & `sessionStore`):** Zustand-powered stores coordinating engine moves, animation playback queues, and user preferences.
5. **Tactile Board Component Architecture:**
   * Dynamic responsive layout deriving pit and store sizes from screen width.
   * 12 carved pits with glowing legal highlights, press feedback, and count badges.
   * 2 flanking stores with roll-up counters and extra-turn pulse animations.
   * Deterministic seed cluster layout (1 to 12 river stones that never flicker between renders).
6. **Hardware-Accelerated Sowing Animation (Reanimated):**
   * UI-thread execution of seed lifts, sequential counterclockwise drops, bounces, captures, and store drops driven directly by `MoveResult.steps`.
   * Input lockout during animation to prevent race conditions or illegal moves.
7. **Screen Flow:**
   * **Splash Screen (`S01`):** Warm parchment background, carved cultural band, smooth transition.
   * **Home Screen (`S03`):** Header, game mode selection cards with Pass and Play active.
   * **Game Screen (`S04`):** Local two-player board, turn badges, status banner ("Your turn", "Captured 6!"), menu.
   * **Result Screen (`S08`):** Win/Loss/Draw fanfare, final store tally, Rematch button (swapping starter per rules).
   * **Dialogs (`S13`):** "Leave Game?" confirmation dialog honoring the Android hardware back button.

---

## 2. Architecture & File Structure

The `@gebeta/app` package will be structured into modular, single-responsibility layers:

```
app/
├── package.json                   # Expo, React Native, Reanimated, Zustand, Lucide icons
├── tsconfig.json                  # Extends ../tsconfig.base.json with JSX react-native
├── app.json                       # Expo application manifest
├── App.tsx                        # Root entry point with providers and font loading
├── src/
│   ├── theme/                     # Design System tokens
│   │   ├── colors.ts              # Wood palette, neutrals, player colors, seed colors
│   │   ├── typography.ts          # Inter & Noto Sans Ethiopic scales, tabular numbers
│   │   ├── spacing.ts             # 4pt grid, border radiuses, elevations
│   │   ├── motion.ts              # Duration tokens (motionFast, sowStep, captureEffect)
│   │   └── index.ts               # Theme barrel export
│   │
│   ├── i18n/                      # Internationalization
│   │   ├── en.ts                  # English translations
│   │   ├── am.ts                  # Amharic translations (Ethiopic Fidel script)
│   │   └── index.ts               # useTranslation hook and t() formatter
│   │
│   ├── store/                     # Global client state (Zustand)
│   │   ├── gameStore.ts           # Game state, sowing animation queue, move execution
│   │   ├── sessionStore.ts        # Language, theme, sound/haptics toggles
│   │   └── index.ts
│   │
│   ├── services/                  # Hardware & audio abstraction layer
│   │   ├── audio.ts               # Sound effect player (safe stub/native wrapper)
│   │   └── haptics.ts             # Haptic feedback wrapper with platform safety
│   │
│   ├── components/
│   │   ├── common/                # Shared UI elements
│   │   │   ├── Button.tsx         # Primary, secondary, danger, icon button variants
│   │   │   ├── Card.tsx           # Elevated wooden/surface cards
│   │   │   ├── CulturalBand.tsx   # Ethiopian carved geometric border pattern
│   │   │   ├── Dialog.tsx         # Modal confirmation dialogs (Leave Game, Resign)
│   │   │   └── StatusBanner.tsx   # Top slim banner for game announcements
│   │   │
│   │   └── board/                 # Board anatomy components
│   │       ├── Board.tsx          # Master board container, responsive layout math
│   │       ├── Pit.tsx            # Carved wooden cup, legal glow ring, tap handler
│   │       ├── Store.tsx          # End store cup, score counter, extra-turn pulse
│   │       ├── SeedCluster.tsx    # Deterministic stone layout (1..12 stones)
│   │       ├── SeedStone.tsx      # Individual river stone with top-left highlight
│   │       ├── FlyingSeed.tsx     # Animated seed traveling along sowing steps
│   │       ├── ScoreBoard.tsx     # Player header cards, avatars, and turn markers
│   │       └── TurnMarker.tsx     # High-contrast turn arrow and label
│   │
│   ├── screens/                   # Top-level screen components
│   │   ├── SplashScreen.tsx       # S01: Splash screen
│   │   ├── HomeScreen.tsx         # S03: Home screen & game mode picker
│   │   ├── GameScreen.tsx         # S04: Main Game screen (Pass & Play)
│   │   └── ResultScreen.tsx       # S08: Game Over & Rematch screen
│   │
│   └── navigation/
│       └── RootNavigator.tsx      # Stack navigator managing screen transitions
│
└── tests/
    ├── gameStore.test.ts          # State transition and animation queue unit tests
    ├── boardMath.test.ts          # Responsive sizing calculation tests
    └── i18n.test.ts               # Translation key completeness tests
```

---

## 3. Design Tokens & Theme Specification

All styles must reference tokens from `src/theme/`. **Never hardcode raw hex values or arbitrary numbers in UI components.**

### 3.1 Colors (`src/theme/colors.ts`)

```ts
export const colors = {
  // Wood & Board Palette
  woodDark: '#3B2417',        // Board frame, deep shadows, carved borders
  woodMid: '#6B4228',         // Board surface
  woodLight: '#A06A3C',       // Board highlights, rim light
  woodGlow: '#C98F56',        // Legal pit glow, active player accents
  pitDeep: '#2A180F',         // Inside hollow of carved pits
  pitInner: '#4A2C1A',        // Pit inner gradient highlight

  // Brand & Accents
  saffron: '#E3A21A',         // Primary action buttons, highlights
  saffronPressed: '#C48712',  // Pressed button state
  forest: '#2F6B4F',          // Player 0 marker, success, secondary brand
  terracotta: '#B8442F',      // Player 1 marker, danger, captures, loss

  // Neutrals (Light Theme / Parchment)
  bg: '#F7EFE3',              // App background (aged Ethiopian parchment)
  surface: '#FFFFFF',         // Cards, sheets, dialog surfaces
  surfaceAlt: '#EFE3D0',      // Secondary surface, input fields
  border: '#D9C8AE',          // Subtle dividers, outlines
  textPrimary: '#2A1B12',     // Dark coffee brown main text (high contrast)
  textSecondary: '#6E5A4B',   // Muted supporting text
  textOnWood: '#F7EFE3',      // Text rendered on wooden boards
  textOnBrand: '#2A1B12',     // Dark text on saffron (never white on saffron!)

  // Status & Feedback
  success: '#2F6B4F',
  warning: '#D98A0B',
  danger: '#B8442F',
  info: '#3E6E8E',

  // River Stone Seed Palette (Stable determinism by seed index)
  seedIvory: '#EADBC0',
  seedSand: '#D2B48C',
  seedClay: '#B5573A',
  seedOlive: '#7A7A3A',
  seedSlate: '#5E6B6B',
} as const;

export const SEED_COLORS = [
  colors.seedIvory,
  colors.seedSand,
  colors.seedClay,
  colors.seedOlive,
  colors.seedSlate,
] as const;
```

### 3.2 Sizing, Spacing & Elevations (`src/theme/spacing.ts`)

```ts
export const spacing = {
  space1: 4,
  space2: 8,
  space3: 12,
  space4: 16,
  space5: 20,
  space6: 24,
  space8: 32,
  space12: 48,
  space16: 64,
} as const;

export const radius = {
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 20,
  radiusFull: 999,
} as const;

export const elevations = {
  card: {
    shadowColor: '#3B2417',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  board: {
    shadowColor: '#1C120C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 8,
  },
} as const;
```

### 3.3 Motion & Durations (`src/theme/motion.ts`)

```ts
export const motion = {
  motionFast: 120,      // Button press, small tap feedback
  motionBase: 220,      // Screen transitions, fades
  motionSlow: 360,      // Sheets, dialogs, result reveal
  sowStep: 200,         // Normal single seed drop delay
  sowStepFast: 120,     // Fast animation setting
  captureEffect: 450,   // Flash and sweep duration for captures
  extraTurnPulse: 400,  // Pulse glow on store for extra turn
} as const;
```

---

## 4. Board Layout Mathematics & Component Specs

### 4.1 Responsive Board Geometry
The board must automatically calculate all dimensions from the device viewport width so that it never clips or overlaps on small 320px screens or large tablets:

```ts
// Derivation Formula:
const screenWidth = Dimensions.get('window').width;
const boardWidth = Math.min(screenWidth - (spacing.space4 * 2), 480);
const storeWidth = Math.floor(boardWidth * 0.14);
const boardPadding = spacing.space3; // 12px
const pitRowWidth = boardWidth - (storeWidth * 2) - (boardPadding * 2);
const pitSize = Math.floor(pitRowWidth / 6);
const seedSize = Math.max(Math.floor(pitSize * 0.22), 10);
```

### 4.2 Seed Cluster Rendering (No Flickering or Jitter)
In traditional Mancala/Gebeta games, rendering seeds randomly creates visual instability and re-render lag. The app must render up to 12 seeds using a **fixed geometric arrangement table**:

```ts
/**
 * Normalized (x, y) coordinates (-1.0 to 1.0) for up to 12 seeds in a pit.
 */
export const SEED_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25],  // Seeds 1-4
  [0.0, 0.0],     [-0.45, 0.0],  [0.45, 0.0],   [0.0, -0.45],  // Seeds 5-8
  [0.0, 0.45],    [-0.35, -0.35],[0.35, -0.35], [-0.35, 0.35], // Seeds 9-12
];
```

* **For 1 to 12 seeds:** Render individual `SeedStone` components placed at `pitCenter + offset * radius`.
* **Color Assignment:** Seed color is deterministically picked using `SEED_COLORS[seedIndex % 5]`.
* **Above 12 seeds:** Render a tight 12-seed cluster with a prominent numeric pill badge in the center (`seedCount` typography).
* **Count Badge:** By default, every pit displays a small count badge at the bottom rim for instant readability.

### 4.3 Pit Interaction & Visual States
Each `Pit` component handles the following visual states:
1. **Idle:** Dark hollow (`pitDeep`), inner shadow, rendered seeds, count badge.
2. **Legal (Active Player's Turn):** Subtle glowing ring (`woodGlow`) with a continuous soft pulse animation (`scale: 1.0 -> 1.04 -> 1.0`). Tappable.
3. **Pressed:** Instantly scales down to `0.96`, ring intensifies.
4. **Selected / Sowing Source:** Seeds lift out; pit background dims briefly.
5. **Drop Destination:** Light flash as a seed lands.
6. **Capture Target:** Pit border flashes warm terracotta with a rapid 3-cycle shake animation (`translateX: -4, 4, -2, 2, 0`).
7. **Disabled (Opponent side or Empty):** No glow ring, tap events trigger gentle horizontal vibration without error sounds.

---

## 5. Animation Architecture (Reanimated UI-Thread Execution)

### 5.1 Step-by-Step Sowing Animation Pipeline
When a player taps Pit `i`:
1. **Lock Input:** Set `isAnimating: true` in `gameStore`. Ignore any subsequent taps.
2. **Call Engine:** Execute `applyMove(state, pit, rules)` synchronously in the store. This generates the next `GameState` and `steps: SowStep[]`.
3. **Step Animation Playback:**
   * Step through `steps` sequentially using a timer or Reanimated worklet.
   * For each step:
     * Decrement mover's hand count.
     * Increment the target slot's seed count.
     * Trigger a subtle bounce animation on the target pit/store (`scale: 1.15 -> 1.0`).
     * Play click sound and light haptic tick via `services/audio.ts` and `services/haptics.ts`.
4. **Post-Sow Resolution:**
   * **Capture:** If `captured > 0`, highlight the opposite pit in `terracotta`, animate seeds sweeping into the player's store, and update the status banner ("Captured {n}!").
   * **Extra Turn:** If `extraTurn === true`, pulse the player's store in `saffron` and flash "Go again!".
   * **Game Over:** If `state.over === true`, animate the sweep of all remaining seeds on both sides into their stores, pause for 1200ms, and transition to the **Result Screen**.
5. **Unlock Input:** Set `isAnimating: false`. Next player's legal moves now glow.

---

## 6. State Management (`src/store/gameStore.ts`)

```ts
import { create } from 'zustand';
import {
  applyMove,
  createGame,
  isLegal,
  legalMoves,
  type GameState,
  type MoveResult,
  type Player,
} from '@gebeta/engine';

export type GameMode = 'pass_play' | 'ai' | 'online';

export interface GameStoreState {
  state: GameState;
  mode: GameMode;
  isAnimating: boolean;
  selectedPit: number | null;
  statusMessageKey: string | null;
  statusParams: Record<string, string | number>;
  history: MoveResult[];

  // Actions
  initLocalGame: (firstPlayer?: Player) => void;
  handlePitPress: (pit: number) => Promise<void>;
  resetGame: () => void;
  rematch: () => void;
  setStatusMessage: (key: string | null, params?: Record<string, string | number>) => void;
}
```

The store must:
* Maintain a deep-frozen reference to `GameState`.
* Enforce that `handlePitPress` only processes taps when `!isAnimating` and `isLegal(state, pit)`.
* Support swapping the starting player upon rematch (in accordance with `Game Rules.md` Section 3.4).

---

## 7. Screens Specification & Wireframes

### 7.1 S01: Splash Screen (`src/screens/SplashScreen.tsx`)
* **Visuals:** Warm parchment background (`colors.bg`), centered Gebeta logo, carved wood title, authentic geometric cultural band (`CulturalBand.tsx`), and subtitle `"The classic board game, on your phone."`.
* **Behavior:** Loads font assets (Inter, Noto Sans Ethiopic), performs a calm 1.5-second seed-drop intro animation, and fades smoothly into the **Home Screen**.

### 7.2 S03: Home Screen (`src/screens/HomeScreen.tsx`)
* **Top Header:** Greeting `"Hello, Player"`, language toggle button (English / Amharic), settings icon.
* **Game Cards Stack:**
  1. **Pass & Play (Active in Phase 2):** Primary card highlighted with wood accents. Title: `"Pass and play"`, subtitle: `"Two players, one phone"`. Tapping navigates immediately to `GameScreen`.
  2. **Play vs Computer (Phase 3 placeholder):** Title: `"Play vs computer"`, subtitle: `"Practice anytime, even offline"`. Shows `"Coming in Phase 3"`.
  3. **Play a Friend (Phase 6 placeholder):** Title: `"Play a friend"`, subtitle: `"Share a room code"`.
  4. **Ranked (Locked):** Dimmed card with `"Coming soon"` badge.
* **Bottom Footer:** Links for `"How to play"` and `"Leaderboard"`, bounded by a carved cultural band.

### 7.3 S04: Game Screen (`src/screens/GameScreen.tsx`)
* **Top Player Area (Player 1):**
  * Player 2 avatar, label `"Player 2"`.
  * Store S1 score badge (rotated 180° in Pass & Play mode so Player 2 can read it naturally across the table!).
  * Turn arrow indicator.
* **Center Board:**
  * Master `Board.tsx` displaying Store 1 (left), Pits 11-6 (top row), Pits 0-5 (bottom row), Store 0 (right).
  * Legal glow on the current player's pits.
* **Bottom Player Area (Player 0):**
  * Player 1 avatar, label `"Player 1"`.
  * Store S0 score badge.
  * Turn arrow indicator.
* **Status Line:** Dynamic banner between board and controls showing `"Player 1's turn"`, `"Go again!"`, or `"Captured {n}!"`.
* **Top Corner Menu Button:** Opens a modal sheet with options: `"Leave game"` and `"Restart"`.

### 7.4 S08: Result Screen (`src/screens/ResultScreen.tsx`)
* **Header Headline:**
  * `"Player 1 won!"` (if Store 0 > Store 1)
  * `"Player 2 won!"` (if Store 1 > Store 0)
  * `"It is a draw!"` (if Store 0 === Store 1)
* **Score Card:** Large tabular scores: `Store 0: {s0}  —  Store 1: {s1}`. Total seed verification note: `48/48 seeds counted`.
* **Actions:**
  * **Rematch Button (Primary Saffron):** Instantly starts a new local game with the loser moving first (or alternate starter).
  * **Home Button (Secondary Outline):** Returns to `HomeScreen`.

### 7.5 S13: Shared Dialogs (`src/components/common/Dialog.tsx`)
* **Leave Game Dialog:** Triggered by Android back button or menu button during an active game:
  * Title: `"Leave this game?"`
  * Body: `"Your game will not be saved."`
  * Buttons: `"Stay"` (safe, dismisses dialog) and `"Leave"` (danger terracotta, returns to Home).

---

## 8. Internationalization (`src/i18n/`)

Provide complete dictionaries for English and Amharic with zero missing keys:

### Key Mapping Matrix:
| String Key | English | Amharic (Ethiopic) |
| :--- | :--- | :--- |
| `splash.title` | Gebeta | ገበጣ |
| `splash.tagline` | The classic board game, on your phone. | ታዋቂው የቦርድ ጨዋታ፣ በስልክዎ። |
| `home.greeting` | Hello, {name} | ሰላም፣ {name} |
| `home.passPlay` | Pass and play | በተራ ተጫወቱ |
| `home.passPlaySub` | Two players, one phone | ሁለት ተጫዋቾች፣ አንድ ስልክ |
| `home.playAi` | Play vs computer | ከኮምፒውተር ጋር ተጫወት |
| `home.playAiSub` | Practice anytime, even offline | በማንኛውም ጊዜ ተለማመዱ፣ ያለ በይነመረብም |
| `home.playFriend` | Play a friend | ከጓደኛ ጋር ተጫወት |
| `home.playFriendSub` | Share a room code | የክፍል ኮድ ያጋሩ |
| `home.ranked` | Ranked | የደረጃ ጨዋታ |
| `home.comingSoon` | Coming soon | በቅርብ ቀን |
| `game.yourTurn` | Your turn | የእርስዎ ተራ |
| `game.theirTurn` | {name}'s turn | የ{name} ተራ |
| `game.goAgain` | Go again! | እንደገና ይጫወቱ! |
| `game.captured` | Captured {n}! | {n} ዘር ወስደዋል! |
| `game.player1` | Player 1 | ተጫዋች 1 |
| `game.player2` | Player 2 | ተጫዋች 2 |
| `result.win` | {name} won! | {name} አሸንፈዋል! |
| `result.draw` | It is a draw | አቻ ወጥተዋል |
| `result.score` | Final score {a} to {b} | የመጨረሻ ውጤት {a} ለ{b} |
| `result.rematch` | Rematch | ድጋሚ ተጫወት |
| `result.home` | Home | መነሻ |
| `dialog.leaveTitle` | Leave this game? | ከጨዋታው ይወጣሉ? |
| `dialog.leaveBodyLocal`| Your game will not be saved. | ጨዋታዎ አይቀመጥም። |
| `dialog.stay` | Stay | ቆይ |
| `common.leave` | Leave | ውጣ |
| `common.cancel` | Cancel | ሰርዝ |

---

## 9. Step-by-Step Implementation Roadmap

Execute the tasks in strict vertical slices:

### Step 1: Dependencies & Expo Foundation
1. Install essential React Native packages in `app/package.json`:
   * `expo`, `react`, `react-native`, `react-native-reanimated`, `react-native-gesture-handler`, `react-native-safe-area-context`
   * `zustand`
   * `lucide-react-native`
   * `@gebeta/engine: "workspace:*"`
2. Configure `app/tsconfig.json` to support JSX and paths.
3. Configure `app.json` with app name `"Gebeta"`, portrait orientation, and parchment splash background.

### Step 2: Design Tokens & Theme Engine
1. Implement `src/theme/colors.ts`, `spacing.ts`, `typography.ts`, `motion.ts`.
2. Implement `src/theme/index.ts` barrel.

### Step 3: Internationalization Engine
1. Implement `src/i18n/en.ts` and `src/i18n/am.ts`.
2. Implement `src/i18n/index.ts` with `useTranslation()` and parameter interpolation (`{name}`).

### Step 4: Hardware & Sound Wrappers
1. Implement `src/services/haptics.ts` (light/medium impact with web/desktop no-op guards).
2. Implement `src/services/audio.ts` (safe sound player abstraction).

### Step 5: State Stores
1. Implement `src/store/sessionStore.ts` (language and theme toggling).
2. Implement `src/store/gameStore.ts` (wrapping `@gebeta/engine`, handling moves, tracking animation state).
3. Write unit tests in `tests/gameStore.test.ts`.

### Step 6: Board Anatomy Components
1. Implement `src/components/board/SeedStone.tsx` (individual smooth stone).
2. Implement `src/components/board/SeedCluster.tsx` (12-offset deterministic layout + count badge).
3. Implement `src/components/board/Pit.tsx` (carved cup, glowing legal ring, Reanimated pulse, press scaling).
4. Implement `src/components/board/Store.tsx` (end store, score counter, extra-turn pulse).
5. Implement `src/components/board/ScoreBoard.tsx` and `TurnMarker.tsx`.
6. Implement `src/components/board/Board.tsx` (responsive container calculating sizes from screen width).

### Step 7: Shared Components & Screens
1. Implement `src/components/common/Button.tsx`, `Card.tsx`, `CulturalBand.tsx`, `Dialog.tsx`, `StatusBanner.tsx`.
2. Implement `src/screens/SplashScreen.tsx`.
3. Implement `src/screens/HomeScreen.tsx`.
4. Implement `src/screens/GameScreen.tsx`.
5. Implement `src/screens/ResultScreen.tsx`.

### Step 8: Navigation & App Entry
1. Implement `src/navigation/RootNavigator.tsx` (handling transitions between Splash, Home, Game, and Result).
2. Update `App.tsx` and `src/index.ts` to boot the application.

### Step 9: Verification & Monorepo Validation
1. Run `pnpm typecheck` to verify 100% strict TypeScript compliance.
2. Run `pnpm test` to verify engine and app store tests.
3. Run `pnpm format:check` to ensure clean Prettier code formatting.

---

## 10. Autonomous Execution Master Prompt

*(The following prompt is ready to be provided to an AI agent to build Phase 2 end-to-end.)*

```markdown
You are an expert React Native, Expo, and TypeScript engineer tasked with completing Phase 2 (Board UI and Local Play) of the Gebeta project.

Workspace Root: `d:\Projects\Gebeta`
Target Package: `@gebeta/app` (`d:\Projects\Gebeta\app`)
Core Dependency: `@gebeta/engine` (already built and verified in `d:\Projects\Gebeta\engine`)
Reference Documents:
- `docs/Phase_2_Board_UI_and_Local_Play_Prompt.md`
- `docs/Design System.md`
- `docs/Screens.md`
- `docs/Technical_Guide.md`
- `docs/Coding_Standard.md`

### MISSION:
Build the complete, tactile, hardware-accelerated Board UI and local Pass and Play two-player game in `@gebeta/app` according to `docs/Phase_2_Board_UI_and_Local_Play_Prompt.md`.

### MANDATORY REQUIREMENTS:
1. Setup Expo dependencies in `app/package.json` (`react`, `react-native`, `react-native-reanimated`, `react-native-safe-area-context`, `zustand`, `lucide-react-native`).
2. Implement Design Tokens in `src/theme/`:
   - `colors.ts` (woodDark, woodMid, woodLight, woodGlow, pitDeep, saffron, forest, terracotta, parchment bg, river stones)
   - `spacing.ts`, `typography.ts`, `motion.ts`
3. Implement `src/i18n/` with complete `en.ts` and `am.ts` (English and Amharic Fidel) dictionaries and `useTranslation()` hook.
4. Implement `src/store/gameStore.ts` using Zustand to manage `GameState`, `applyMove()`, `isLegal()`, and Reanimated step animation sequencing.
5. Implement Board Components in `src/components/board/`:
   - `Board.tsx`: Responsive width calculations (`pitSize`, `storeWidth`, `seedSize`)
   - `Pit.tsx`: Carved dark pit with glowing legal ring, touch feedback, and count badges
   - `Store.tsx`: End stores with roll-up score display and extra-turn pulse
   - `SeedCluster.tsx`: Deterministic, non-jittering seed layouts for 1 to 12 stones
   - `ScoreBoard.tsx` & `TurnMarker.tsx`
6. Implement Screens in `src/screens/`:
   - `SplashScreen.tsx`: S01 Splash screen with cultural band
   - `HomeScreen.tsx`: S03 Home screen with active Pass and Play mode card
   - `GameScreen.tsx`: S04 Game screen with local 2-player board, status banner, and Leave Game confirmation dialog
   - `ResultScreen.tsx`: S08 Result screen with score tally, winner declaration, and Rematch button
7. Implement Navigation in `src/navigation/RootNavigator.tsx`.
8. Ensure clean TypeScript typing (`tsc --noEmit`), passing tests, and Prettier formatting (`pnpm format`).
```

---

## 11. Definition of Done (DoD) for Phase 2

Phase 2 is complete when all of the following criteria are met:
1. [ ] `@gebeta/app` contains all theme tokens, i18n dictionaries, stores, board components, and screens.
2. [ ] Two players can play a complete, uninterrupted local Gebeta game on a single device from first move to sweep and result.
3. [ ] Pits highlight legally on the active player's turn; illegal taps are cleanly ignored.
4. [ ] Seed sowing animates step-by-step from engine `SowStep[]` traces without UI thread lag.
5. [ ] Captures and extra turns trigger distinct visual feedback and status messages.
6. [ ] English and Amharic strings render cleanly across all screens with zero missing translation warnings.
7. [ ] Rematch button properly starts a new game and swaps the starting player.
8. [ ] Android back button safely displays the "Leave game?" confirmation dialog.
9. [ ] `pnpm typecheck`, `pnpm test`, and `pnpm format:check` pass across all monorepo packages.

