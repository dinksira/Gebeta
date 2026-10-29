# Gebeta Online: Technical Guide

This is the working reference for building the game. It explains what we are building, how the pieces fit, and the exact contracts between them. When code and this document disagree, fix one of them the same day.

Related files: `SYSTEM_OVERVIEW.md` (the big picture) and `CODING_STANDARDS.md` (how we write code).

## 1. Requirements

### Functional

1. Play Gebeta against an AI at three difficulty levels, fully offline.
2. Play a friend live through a private room code.
3. Show a profile with wins, losses, and rating.
4. Show a ranked leaderboard (after the first release).
5. Support English and Amharic UI, with Oromiffa later.
6. Support rule variants through configuration.

### Non functional targets

These are targets to design toward, not promises. Measure them on a low end Android phone.

| Area | Target |
| :--- | :--- |
| Cold start to home screen | under 3 seconds |
| Board animation | steady 60 fps while sowing |
| Move message size | under 200 bytes |
| Data per full online match | under 50 KB |
| APK size | under 30 MB |
| Move round trip on 3G | feels instant because the client animates first |
| AI move time (hard) | under 500 ms on a low end phone |

## 2. Architecture

```
+----------------------+   WebSocket + REST   +-----------------------+
|      Mobile App      | <------------------> |        Server         |
|  React Native/Expo   |                      |  Node, Socket.IO, TS  |
+----------+-----------+                      +-----------+-----------+
           |                                              |
           v                                    +---------+---------+
+----------------------+                        v                   v
|     Game Engine      |                  +-----------+       +-----------+
|   pure TypeScript    | <--- shared ---> |   Redis   |       | Postgres  |
+----------------------+                  | live rooms|       | permanent |
                                          +-----------+       +-----------+
```

Three rules hold the whole design together:

1. **One engine.** All game logic lives in `engine`. The app and server import it. Nobody reimplements a rule.
2. **The server is the authority.** In online games the client proposes a move and the server decides.
3. **The client animates first.** The client runs the move locally for instant feedback, then reconciles with the server state.

## 3. Repository and tooling

```
gebeta/
  package.json            workspaces: engine, app, server
  tsconfig.base.json      strict settings shared by all packages
  engine/
    src/
      types.ts            State, Rules, Move, MoveResult
      rules.ts            DEFAULT_RULES and rule presets
      ring.ts             board indexing helpers
      applyMove.ts        the move function
      legalMoves.ts
      status.ts           game over and winner
      ai/
        evaluate.ts
        minimax.ts
        levels.ts
      protocol.ts         socket event names and payload types
      index.ts            public exports only
    tests/
  app/
    src/
      screens/ components/ hooks/ store/ services/ theme/ i18n/
  server/
    src/
      index.ts            boot
      http/               REST routes
      sockets/            event handlers
      services/           roomService, matchService, ratingService
      db/                 queries and migrations
      config.ts           env parsing
```

Tooling: pnpm workspaces, TypeScript strict, Jest, ESLint, Prettier, Husky. Node 20 or newer.

## 4. Game engine specification

The engine is a set of pure functions. No I/O, no clock, no randomness, no mutation of inputs.

### 4.1 Data types

```ts
export type Player = 0 | 1;

export interface GameState {
  readonly pits: readonly number[];                 // length 12
  readonly stores: readonly [number, number];
  readonly turn: Player;
  readonly over: boolean;
}

export interface Rules {
  readonly pitsPerSide: number;          // 6 in v1
  readonly seedsPerPit: number;          // 4 in v1
  readonly extraTurnOnStore: boolean;    // true in v1
  readonly capture: boolean;             // true in v1
  readonly relaySowing: boolean;         // false in v1, reserved for variants
}

export interface SowStep {
  readonly slot: number;                 // ring slot that received a seed
  readonly kind: 'drop' | 'store';
}

export interface MoveResult {
  readonly state: GameState;
  readonly steps: readonly SowStep[];    // drives the animation
  readonly captured: number;             // seeds captured, 0 if none
  readonly extraTurn: boolean;
}
```

`steps` is returned by the engine so the UI never has to guess how seeds travelled.

### 4.2 Board layout

Players sit on opposite sides. Pits are numbered in the order seeds travel.

```
            Player 1 side (pits 11 down to 6)
   [S1]  [11] [10] [ 9] [ 8] [ 7] [ 6]
         [ 0] [ 1] [ 2] [ 3] [ 4] [ 5]  [S0]
            Player 0 side (pits 0 to 5)
```

Internally the engine uses a ring of 14 slots, which makes sowing a simple loop.

| Ring slot | Meaning |
| :--- | :--- |
| 0 to 5 | Player 0 pits (pit 0 to 5) |
| 6 | Player 0 store |
| 7 to 12 | Player 1 pits (pit 6 to 11) |
| 13 | Player 1 store |

Helpers in `ring.ts`:

```ts
pitToSlot(pit)   // pit 0..5 maps to slot 0..5, pit 6..11 maps to slot 7..12
slotToPit(slot)
oppositeSlot(s)  // 12 minus s, valid for pit slots only
storeSlot(p)     // 6 for player 0, 13 for player 1
ownsSlot(p, s)   // is this slot one of p's pits
```

### 4.3 v1 rules (Kalah style)

1. A move picks one non empty pit on the current player's side.
2. All seeds are lifted and dropped one at a time, counterclockwise, starting at the next slot.
3. Seeds go into the player's own store but skip the opponent's store.
4. If the last seed lands in the player's own store, that player moves again.
5. If the last seed lands in an empty pit on the player's own side and the opposite pit has seeds, both pits go into the player's store.
6. After every move, if either side has no seeds, the game ends. The other side's remaining seeds go to that side's owner. Most seeds in the store wins, equal stores is a draw.
7. Laps are allowed. With 13 or more seeds the sowing passes the starting pit and keeps going. The starting pit is not skipped in v1.

Confirm the exact variant with real players before locking it. Everything above is controlled by `Rules`, so changing it should never require rewriting the engine.

### 4.4 Reference implementation

```ts
export function applyMove(
  state: GameState,
  pit: number,
  rules: Rules = DEFAULT_RULES,
): MoveResult {
  if (!isLegal(state, pit)) {
    throw new IllegalMoveError(pit, state.turn);
  }

  const ring = toRing(state);                 // fresh array, never mutate input
  const me = state.turn;
  const myStore = storeSlot(me);
  const oppStore = storeSlot(me === 0 ? 1 : 0);

  const start = pitToSlot(pit);
  let seeds = ring[start];
  ring[start] = 0;

  const steps: SowStep[] = [];
  let pos = start;

  while (seeds > 0) {
    pos = (pos + 1) % 14;
    if (pos === oppStore) continue;           // never feed the opponent store
    ring[pos] += 1;
    seeds -= 1;
    steps.push({ slot: pos, kind: pos === myStore ? 'store' : 'drop' });
  }

  let captured = 0;
  const landedInOwnEmptyPit =
    rules.capture &&
    ownsSlot(me, pos) &&
    pos !== myStore &&
    ring[pos] === 1 &&
    ring[oppositeSlot(pos)] > 0;

  if (landedInOwnEmptyPit) {
    captured = ring[oppositeSlot(pos)] + 1;
    ring[myStore] += captured;
    ring[pos] = 0;
    ring[oppositeSlot(pos)] = 0;
  }

  const extraTurn = rules.extraTurnOnStore && pos === myStore;
  return finishMove(ring, me, extraTurn, steps, captured);
}
```

`finishMove` checks for game over, sweeps leftover seeds, picks the next player, and converts the ring back to `GameState`.

### 4.5 Public functions

```ts
createGame(rules?: Rules, firstPlayer?: Player): GameState
legalMoves(state: GameState): number[]
isLegal(state: GameState, pit: number): boolean
applyMove(state, pit, rules?): MoveResult
getWinner(state): Player | 'draw' | null
```

### 4.6 Invariants (turn these into tests)

1. Total seeds on the board plus both stores always equals `pitsPerSide * 2 * seedsPerPit`.
2. No pit or store ever holds a negative number.
3. `applyMove` never changes the input state.
4. The opponent store never receives a seed from the mover.
5. A finished game has no legal moves.
6. The same state and move always produce the same result.

### 4.7 Edge cases to cover

1. Moving from an empty pit throws an illegal move error.
2. Moving on someone else's turn throws.
3. A lap of 13 or more seeds skips the opponent store every time around.
4. Last seed in own store grants an extra turn, and an extra turn that empties the side still ends the game.
5. Capture when the opposite pit is empty does nothing.
6. Capture only triggers on the mover's own side.
7. Game ends the moment either side is empty, even mid extra turn.
8. Sweep gives leftovers to the correct owner.
9. Draw when both stores are equal.

## 5. The AI

All AI code lives in `engine/src/ai` and runs on the device.

### 5.1 Levels

| Level | Strategy |
| :--- | :--- |
| Easy | Random legal move, with extra weight on moves that end in the store |
| Medium | One move lookahead, maximize store difference |
| Hard | Minimax with alpha beta pruning, depth 6 to 8 |

### 5.2 Search notes

1. Because of extra turns, the same player can move twice in a row. Decide who maximizes by `state.turn`, not by depth parity.
2. Order moves so extra turn moves and captures are tried first. Pruning gets much better.
3. Evaluation: store difference first, then a small bonus for seeds on your own side, and a small penalty for pits that can be captured.
4. Use iterative deepening with a time limit (for example 300 ms). Return the best move found so far when time runs out. This keeps low end phones responsive.
5. Add a small think delay (400 to 800 ms) in the UI so the AI feels human. That delay lives in the app, not the engine.

```ts
chooseMove(state: GameState, level: 'easy' | 'medium' | 'hard', rules: Rules): number
```

## 6. Server

### 6.1 Responsibilities

1. Authenticate players.
2. Create and manage rooms.
3. Validate every move with the engine.
4. Run move timers and handle disconnects.
5. Save finished matches and update ratings.
6. Serve the REST endpoints.

### 6.2 REST endpoints

| Method | Path | Purpose |
| :--- | :--- | :--- |
| POST | `/auth/guest` | Create or restore a guest account from a device id, returns a token |
| GET | `/me` | Current profile and rating |
| PATCH | `/me` | Change username |
| GET | `/leaderboard` | Top 50, cached for 60 seconds |
| GET | `/health` | For uptime checks |

Auth uses a signed token (JWT) sent as a bearer header on REST and in the socket handshake.

### 6.3 Socket events

All names and payload types live in `engine/src/protocol.ts` so both sides compile against the same contract.

Client to server:

```ts
create_room   { rulesId?: string }
join_room     { code: string }
make_move     { code: string; pit: number; seq: number }
resign        { code: string }
resume_room   { code: string }
```

Server to client:

```ts
room_created      { code: string }
room_joined       { code: string; you: Player; opponent: PublicProfile;
                    state: GameState; seq: number; deadlineAt: number }
state_update      { seq: number; move: { by: Player; pit: number };
                    state: GameState; deadlineAt: number }
opponent_status   { connected: boolean }
game_over         { winner: Player | 'draw'; state: GameState;
                    reason: 'finished' | 'resign' | 'timeout' | 'abandoned';
                    ratingDelta?: number }
error             { code: ErrorCode; message: string }
```

`seq` is a counter that increases by one for every accepted move. The server rejects any move whose `seq` is not the expected next value. This blocks duplicates and out of order messages. `deadlineAt` is a server timestamp so both clients show the same countdown.

### 6.4 Error codes

| Code | When |
| :--- | :--- |
| `ROOM_NOT_FOUND` | Bad or expired room code |
| `ROOM_FULL` | Third player tries to join |
| `NOT_YOUR_TURN` | Move sent out of turn |
| `ILLEGAL_MOVE` | Engine rejected the pit |
| `STALE_SEQ` | Move seq does not match |
| `INVALID_PAYLOAD` | Failed validation |
| `RATE_LIMITED` | Too many events |
| `UNAUTHORIZED` | Missing or bad token |

### 6.5 Room lifecycle

```
waiting  ->  playing  ->  finished
   |            |
   +-- expires  +-- paused when a player drops, resumes on reconnect
```

1. `create_room` generates a 5 character code from an alphabet without lookalikes (no 0, O, 1, I). A waiting room expires after 10 minutes.
2. `join_room` fills the second seat, picks the first player, and sends `room_joined` to both.
3. `make_move` flow on the server: validate payload, check seat and turn, check `seq`, run `applyMove`, store the new state, increment `seq`, broadcast `state_update`.
4. If the move ends the game, send `game_over`, write the match to Postgres, update ratings, and delete the room from Redis.

### 6.6 Timers and disconnects

1. Move timer: 30 seconds per move. On timeout the server skips nothing, it counts a timeout strike. Two strikes in a row means the player loses.
2. On socket disconnect, mark the player offline, send `opponent_status`, and hold the room for 60 seconds.
3. On `resume_room` within the window, send the current state and restore the seat.
4. If the window expires, end the game as `abandoned`. The player who stayed wins.
5. Timers live on the server only. Clients just display `deadlineAt`.

### 6.7 Live room state (Redis)

Key `room:{code}` holds JSON:

```ts
interface RoomState {
  code: string;
  status: 'waiting' | 'playing' | 'finished';
  rulesId: string;
  seats: [SeatInfo | null, SeatInfo | null];
  state: GameState;
  seq: number;
  moveLog: number[];          // pits played, in order
  deadlineAt: number;
  strikes: [number, number];
  createdAt: number;
}
```

Start with an in memory `Map` behind a small `RoomStore` interface. Swap in Redis when you need more than one server process. The interface is the same, so nothing else changes.

### 6.8 Input validation

Validate every incoming payload with a schema library (zod) before it touches any logic. Reject unknown fields. Never trust `pit`, `code`, or `seq` from the client without checking them.

## 7. Data model

### 7.1 Postgres schema

```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id   TEXT UNIQUE NOT NULL,
  username    TEXT NOT NULL,
  rating      INTEGER NOT NULL DEFAULT 1000,
  wins        INTEGER NOT NULL DEFAULT 0,
  losses      INTEGER NOT NULL DEFAULT 0,
  draws       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE matches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_a      UUID NOT NULL REFERENCES users(id),
  player_b      UUID NOT NULL REFERENCES users(id),
  winner        SMALLINT,              -- 0, 1, or NULL for a draw
  reason        TEXT NOT NULL,
  rules_id      TEXT NOT NULL,
  move_log      SMALLINT[] NOT NULL,
  rating_delta  INTEGER,
  started_at    TIMESTAMPTZ NOT NULL,
  ended_at      TIMESTAMPTZ NOT NULL
);

CREATE INDEX users_rating_idx ON users (rating DESC);
CREATE INDEX matches_player_a_idx ON matches (player_a);
CREATE INDEX matches_player_b_idx ON matches (player_b);
```

Storing `move_log` means any match can be replayed later through the engine. That also helps with debugging disputes.

### 7.2 Rating (Elo)

```ts
const K = 32;

function expectedScore(mine: number, theirs: number): number {
  return 1 / (1 + Math.pow(10, (theirs - mine) / 400));
}

function newRating(mine: number, theirs: number, score: 0 | 0.5 | 1): number {
  return Math.round(mine + K * (score - expectedScore(mine, theirs)));
}
```

1. Everyone starts at 1000.
2. Only completed online matches count. Games ended by `abandoned` count as a win for the player who stayed.
3. Tier labels (for example Bronze, Silver, Gold) are computed from rating in the app, not stored.

## 8. Mobile app

### 8.1 Screens and navigation

Use Expo Router or React Navigation with a simple stack.

1. Onboarding (username)
2. Home
3. Game (AI and online share this screen)
4. Create or Join Room
5. Result
6. Profile and Leaderboard
7. Settings

### 8.2 State

Use Zustand with small stores:

| Store | Holds |
| :--- | :--- |
| `sessionStore` | token, profile, language, settings |
| `gameStore` | current GameState, mode, my seat, seq, animation queue |
| `roomStore` | room code, opponent info, connection status |

Persist `sessionStore` locally (MMKV or AsyncStorage). Never persist `gameStore` for online games, the server is the source of truth.

### 8.3 Services

1. `api.ts`: REST client with the auth header.
2. `socket.ts`: one Socket.IO connection, typed events from `protocol.ts`, auto reconnect.
3. `audio.ts` and `haptics.ts`: thin wrappers so screens never call native APIs directly.

### 8.4 Board and animation

1. Render pits and stores as components that read their seed count from state.
2. When a move happens, call `applyMove` locally and play the returned `steps` one by one: lift seeds, then drop each with a short delay, a small bounce, a click sound, and a haptic tap.
3. Drive animation with Reanimated shared values so it runs on the UI thread.
4. While a move is animating, ignore new taps and queue incoming `state_update` messages.
5. After the animation, compare the local result with the server state. If they differ, snap to the server state and log it, because that means a bug.
6. Highlight legal pits, show whose turn it is, and show the move timer from `deadlineAt`.

### 8.5 Online flow on the client

1. User taps a pit.
2. Client checks `isLegal` locally, plays the animation, and sends `make_move` with the next `seq`.
3. Server replies with `state_update`. Client reconciles.
4. If the server returns `ILLEGAL_MOVE` or `STALE_SEQ`, the client rolls back to the last confirmed state and asks for a resync with `resume_room`.

### 8.6 Offline AI flow

No network calls at all. The game store runs `applyMove` for the player, then `chooseMove` for the AI after a short delay. Only the result (win or loss versus AI) is stored locally.

### 8.7 Internationalization

1. All text goes through a translation function. No hardcoded strings in components.
2. Language files live in `app/src/i18n/` (`en`, `am`).
3. Test Amharic text early. Fidel glyphs need a font that renders cleanly on cheap Android devices, and line heights are often larger than Latin text.

## 9. Testing strategy

| Layer | Tool | What to cover |
| :--- | :--- | :--- |
| Engine | Jest | Every rule, every edge case in 4.7, the invariants in 4.6 |
| Engine property tests | fast check (optional) | Random games never break an invariant |
| AI | Jest | Always returns a legal move, hard beats easy over many games |
| Server services | Jest | Room lifecycle, timers (with fake timers), reconnect, rating math |
| Socket integration | Jest with a test client | Two clients play a full game through a real server |
| App components | React Native Testing Library | Board renders correct counts, taps call the right handlers |
| Manual | Real devices | Low end Android, bad network, background and resume |

Useful extra trick: a **replay test**. Play a few thousand random games through the engine, then replay each `move_log` and confirm the final state matches. This catches hidden state bugs quickly.

## 10. Security and abuse

1. Server authority prevents move cheating by design.
2. Rate limit socket events per connection and REST per IP.
3. Validate and sanitize usernames (length limit, no control characters, basic word filter).
4. Sign tokens with a secret from the environment. Rotate it if it ever leaks.
5. Never log tokens or full device ids.
6. Room codes are short lived and low value, but still use a limited alphabet and expire them.
7. Guest accounts are tied to a device id. Add phone or Google login later so progress survives a lost phone.

## 11. Performance and device notes

1. Keep the engine allocation light. A move creates one small array, that is fine.
2. Avoid re rendering the whole board each tick. Each pit subscribes only to its own count.
3. Preload and reuse sounds. Do not create audio objects during a move.
4. Keep images and board textures small. Prefer simple vector or compressed assets.
5. Test with a throttled connection and with the app sent to background mid match.
6. Watch APK size as you add assets and libraries.

## 12. Environments and deployment

| Environment | Purpose |
| :--- | :--- |
| Local | Server on your machine, app in Expo Go or a dev build |
| Staging | Small cloud server, used for friend testing |
| Production | Same setup, separate database and secrets |

Environment variables (server): `PORT`, `DATABASE_URL`, `REDIS_URL` (optional at first), `JWT_SECRET`, `NODE_ENV`.

Deployment notes:

1. A single small VPS or a platform like Railway or Render is enough to start.
2. Run the server behind HTTPS so sockets use `wss`.
3. Add a `/health` check and basic uptime monitoring.
4. Run database migrations on deploy.
5. Back up Postgres on a schedule.
6. Ship the app as an internal Play Store test track first, then open beta.

## 13. Build phases and acceptance criteria

The build follows the 11-phase plan detailed in `PHASE_PLAN.md`, organized into four delivery milestones:

| Milestone | Phases | What you have at the end |
| :--- | :--- | :--- |
| M1: Offline game | 0 to 3 | Complete Gebeta game with 3 AI levels, audio, haptics, and Amharic/English on phone |
| M2: Closed test live | 4 | Real testers playing offline build, Google Play 14-day clock running |
| M3: Online game | 5 to 7 | Authoritative server, friend rooms, accounts, Elo ratings, and leaderboard |
| M4: Launch | 8 to 10 | Hardened, polished app with store listing live on Google Play |
| M5: Ongoing | 11 | Regional variants, ranked matchmaking queue, and updates |

Phases 0 to 3 produce a complete, polished offline game. Launch the Google Play 14-day closed test immediately at Phase 4 so testing runs concurrently with server and online feature development (Phases 5–7).

## 14. Architecture and design decisions

Decisions resolved for v1:

1. **Workflow**: Use Expo Managed Workflow with Development Builds (`expo-dev-client`) and Continuous Native Generation (CNG). Native audio (`expo-av` / `expo-audio`) and haptics (`expo-haptics`) work directly without ejecting to bare Android/iOS folders.
2. **Usernames and identity**: Usernames are display names (non-unique, 3–16 characters, letters and numbers). Player accounts are uniquely anchored to `device_id` and internal UUID, eliminating username registration race conditions and availability check overhead for guest onboarding.
3. **Rating and ranked mode**: In v1, all completed online friend matches update the player's Elo rating and populate the leaderboard. The "Ranked" card on Home represents automated public matchmaking and is reserved for v1.1.
4. **Who moves first in online friend matches**: Decided randomly by the authoritative server upon room start. In pass-and-play, Player 0 (bottom) moves first, and loser starts rematch.
5. **AI game stats**: Kept strictly local in the device's local storage (`sessionStore` / MMKV); never affects online Elo rating or server leaderboard.
6. **Hosting provider**: Small VPS or container deployment (Railway, Render, or Hetzner) running behind HTTPS/WSS with low latency routing.
7. **v1 Ruleset**: Verified against real players in Phase 0 using Kalah 6x4 rules (6 pits/side, 4 seeds/pit, store extra turns, opposite-pit capture, either side empty ends game with sweep) configured via `DEFAULT_RULES`.