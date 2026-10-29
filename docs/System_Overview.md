# Gebeta Online: System Overview

## What it is

A mobile game that brings Gebeta, the Ethiopian mancala board game, to your phone. Players can practice against an AI without internet, play friends live through a room code, and climb a ranking.

## Goals

1. Feel like a real Gebeta board: smooth seed sowing, sound, and touch feedback.
2. Work on cheap Android phones and weak connections.
3. Keep the rules correct and flexible, since Gebeta varies by region.
4. Stay small enough for one developer to build, ship, and maintain.

## Main parts

```
+---------------------+          +---------------------+
|      Mobile App     |  <---->  |       Server        |
|   (React Native)    | WebSocket|   (Node, Socket.IO) |
+---------------------+   + REST +---------------------+
          |                                |
          |                       +--------+--------+
          v                       v                 v
+---------------------+     +-----------+     +-----------+
|    Game Engine      |     |   Redis   |     | Postgres  |
|  (shared, pure TS)  |     | live rooms|     | users,    |
+---------------------+     +-----------+     | matches   |
   used by app and server                     +-----------+
```

**Game engine.** Pure TypeScript with no UI and no network. It holds the rules, move logic, win checks, and the AI. The same code runs on the phone and on the server, so both always agree on what a legal move is.

**Mobile app.** Screens, board animation, sounds, and local state. It runs AI games fully on the device and talks to the server only for online play, profiles, and the leaderboard.

**Server.** Hosts live matches over WebSockets and simple REST endpoints for login, profile, and leaderboard. It is the authority in every online game: clients ask to make a move, and the server validates it with the engine and broadcasts the result.

**Data stores.** Redis keeps live room state while a game is running. Postgres stores users, finished matches, and ratings.

## How an online match works

1. Player A creates a room and gets a 5 character code.
2. Player B enters the code and joins.
3. Server sends the starting state and says who moves first.
4. A player sends a move, the server checks it, updates the state, and sends it to both players.
5. If someone disconnects, the room is held for 60 seconds so they can return.
6. When the game ends, the server saves the result and updates both ratings.

## Game modes

1. **Play vs AI:** three difficulty levels, fully offline.
2. **Play a friend:** private room with a share code.
3. **Ranked:** Elo rating and leaderboard, added after the first release.

## Key decisions

1. **Shared engine.** One source of truth for rules, tested once, used everywhere.
2. **The server decides.** Prevents cheating and keeps players in sync.
3. **Rules as config.** Regional variants become options, not rewrites.
4. **Offline first for AI mode.** No internet needed to play and enjoy the game.
5. **Tiny messages.** Only moves and new state are sent, to save data.
6. **Anonymous start.** Pick a username and play, with optional login later to keep progress.

## Tech stack

1. TypeScript across the whole project
2. React Native with Expo for the app, Reanimated for animation
3. Node with Socket.IO for live play
4. Postgres for permanent data, Redis for live rooms
5. Jest for tests, ESLint and Prettier for code quality

## Scope

**Version 1:** engine, AI, local play, private rooms, profiles, and basic ranking.

**Later:** regional rule variants, tournaments, board and seed skins, Oromiffa language support, and phone login.

**Not planned for now:** payments that affect gameplay, large scale infrastructure, and chat.

## Risks

1. Players disagree on rules, so variants and a clear rules screen are needed.
2. Low end devices and slow networks, so test early and keep the app light.
3. An empty online lobby feels dead, so AI and friend rooms carry the game until players arrive.