# Gebeta Coding Standards

The goal is simple: anyone opening this code (including you in 6 months) should understand it in one read, change it without fear, and enjoy doing it.

If a rule here makes the code harder to read, break the rule and leave a short comment explaining why.

## 1. Core principles

1. **Readable beats clever.** Write code for the next person, not to show off.
2. **Small and focused.** One function does one thing. One file has one job.
3. **Names do the explaining.** If you need a comment to explain a name, rename it.
4. **Make illegal states impossible.** Let TypeScript catch mistakes before runtime does.
5. **Leave it cleaner than you found it.** Small cleanups are always welcome.

## 2. Project structure

One repo, three packages. The engine is shared, and it never imports from the other two.

```
gebeta/
  package.json            workspaces: engine, app, server
  tsconfig.base.json      strict settings shared by all packages
  engine/        pure game logic, no UI, no network
    src/
      types.ts            State, Rules, Move, MoveResult
      rules.ts            DEFAULT_RULES and presets
      ring.ts             board indexing helpers
      applyMove.ts        the move function
      legalMoves.ts
      status.ts           game over and winner
      ai/
      protocol.ts         socket event names and payload types
      index.ts
    tests/
  app/           React Native (Expo)
    src/
      screens/
      components/
      hooks/
      store/
      services/
      theme/
      i18n/
  server/        Node + Socket.IO
    src/
      index.ts
      http/               REST routes
      sockets/            event handlers
      services/           roomService, matchService, ratingService
      db/                 queries and migrations
      config.ts
```

Dependency direction: `app` and `server` can import `engine`. `engine` imports nothing from either.

## 3. Naming

| Thing | Style | Example |
| :--- | :--- | :--- |
| Variables and functions | camelCase | `legalMoves`, `currentTurn` |
| Types, interfaces, components | PascalCase | `GameState`, `BoardPit` |
| Constants | UPPER_SNAKE_CASE | `PITS_PER_SIDE`, `MOVE_TIMEOUT_MS` |
| Component files | PascalCase | `BoardPit.tsx` |
| Everything else | camelCase | `applyMove.ts`, `useGame.ts` |
| Booleans | start with is, has, can, should | `isGameOver`, `canMove` |
| Event handlers | handle prefix | `handlePitPress` |
| Hooks | use prefix | `useRoom` |

Rules of thumb:

* Functions are verbs (`calculateScore`), values are nouns (`score`).
* No single letter names except short loop counters (`i`) and tiny lambdas.
* No abbreviations nobody would guess. `idx` is fine, `pLstSz` is not.
* Include units when it matters: `timeoutMs`, `delaySeconds`.

## 4. TypeScript

1. `strict: true` is always on.
2. No `any`. If you truly do not know the type, use `unknown` and narrow it.
3. Prefer `type` for data shapes and unions, `interface` only when something needs to be extended.
4. Use union types instead of loose strings or booleans for state:

```ts
type RoomStatus = 'waiting' | 'playing' | 'finished';
```

5. Mark data that should not change as `readonly`.
6. Export types from the place they belong. Shared message types live in `engine`.
7. Avoid non null assertions (`!`). Handle the missing case properly.

## 5. Functions

1. Keep them short. If it will not fit on one screen, split it.
2. Maximum 3 parameters. After that, pass an object.
3. Use early returns to avoid deep nesting.

```ts
// Hard to read
function move(state: GameState, pit: number) {
  if (!state.over) {
    if (state.pits[pit] > 0) {
      // ...lots of code
    }
  }
}

// Easy to read
function move(state: GameState, pit: number) {
  if (state.over) return state;
  if (state.pits[pit] === 0) return state;
  // ...main logic, one level deep
}
```

4. No magic numbers. Name them:

```ts
const SEEDS_PER_PIT = 4;
const PITS_PER_SIDE = 6;
```

5. Prefer pure functions. If a function has a side effect, its name should make that obvious.

## 6. Comments

1. Explain **why**, not what. The code already says what.
2. Delete commented out code. Git remembers it.
3. Use `TODO:` with a short reason for known gaps, and clear them before release.
4. Every exported function in `engine` gets a one or two line doc comment, since other code depends on it.

```ts
/**
 * Applies one move and returns a new state.
 * Never mutates the input.
 */
```

## 7. Engine rules (the most important package)

1. Pure functions only. Same input always gives the same output.
2. Never mutate state. Always return a new object.
3. No `Date`, no `Math.random` inside rules. Pass them in if needed, so tests stay predictable.
4. Rules are config, not hardcoded. Variants plug in through a `Rules` object.
5. Every rule (capture, extra turn, game end) has at least one test.
6. The engine must run identically on the phone and on the server.

## 8. React Native

1. One component per file. Keep components small and focused.
2. Screens assemble things. Components display things. Hooks hold logic.
3. No business logic inside JSX. Move it to a hook or a function.
4. Styles go in `StyleSheet.create` at the bottom of the file, or in the theme.
5. Colors, spacing, and font sizes come from `theme/`, never hardcoded in components.
6. Animations use Reanimated and run on the UI thread. Do not animate with state updates.
7. Avoid inline functions and objects in lists. Memoize when a list re renders a lot.
8. Every screen should handle loading, empty, and error states.

## 9. Server and sockets

1. The server is the authority. Never trust the client about game state.
2. Validate every incoming event (shape and legality) before acting on it.
3. Event names are snake_case strings kept in one shared constants file:

```ts
export const EVENTS = {
  CREATE_ROOM: 'create_room',
  JOIN_ROOM: 'join_room',
  MAKE_MOVE: 'make_move',
  STATE_UPDATE: 'state_update',
  GAME_OVER: 'game_over',
} as const;
```

4. Keep socket handlers thin. They parse, call a service, and respond. Logic lives in services.
5. Send the smallest payload that works. This game is played on slow connections.
6. Log useful events (room created, player dropped, game finished), never secrets.

## 10. Error handling

1. Never swallow errors silently. Log them or handle them on purpose.
2. Use clear, specific error messages: `Room ABC12 not found`, not `Error`.
3. Expected failures (bad room code, illegal move) are normal results, not crashes. Return a clear response.
4. Show users friendly messages. Keep technical detail in logs.

## 11. Testing

1. Engine: thorough unit tests, aim for near full coverage on rules.
2. Name tests like sentences: `it('captures opposite pit when last seed lands in empty pit')`.
3. Follow Arrange, Act, Assert in every test.
4. Fix a bug by writing the failing test first.
5. Tests must be fast and independent. No test depends on another.

## 12. Formatting and tooling

Do not argue about style. Let the tools do it.

1. **Prettier** formats everything on save.
2. **ESLint** with the TypeScript rules catches problems.
3. **Husky and lint staged** run both before each commit.

Prettier settings:

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all",
  "printWidth": 90,
  "tabWidth": 2
}
```

Imports are ordered: external packages first, then shared packages, then local files, with a blank line between groups.

## 13. Git

1. Small commits that do one thing.
2. Commit messages use a short type prefix:

```
feat: add capture rule to engine
fix: stop double turn after capture
refactor: split room service
test: cover empty side game end
docs: update rules spec
chore: bump expo version
```

3. Branch names: `feat/captureRules`, `fix/reconnectBug`.
4. Never commit secrets. Use `.env` files and keep them out of git.
5. The main branch always builds and passes tests.

## 14. Before you call something done

* [ ] It works, and there is a test for the tricky parts
* [ ] No `any`, no leftover `console.log`, no commented out code
* [ ] Names read clearly without extra explanation
* [ ] No function or component bigger than it needs to be
* [ ] Lint and format pass
* [ ] Someone new could understand it in one read

If all of that is checked, ship it.