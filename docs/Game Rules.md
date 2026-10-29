# Gebeta Online: Game Rules

**Status:** Draft v1. The rules below are a complete, playable ruleset, but they must be confirmed by real Gebeta players before the engine is locked (see section 13).

**Purpose:** this is the single source of truth for how the game works. The engine, the tests, the AI, the in app "How to play" screen, and the store listing all come from this file. If the code and this file disagree, one of them is wrong, so fix it the same day.

Related files: `TECHNICAL_GUIDE.md` (engine design), `SCREENS.md` (how to play screen), `PHASE_PLAN.md`.

## 1. The game in 60 seconds

1. Two players face each other across a board with two rows of six pits, and a store at each end.
2. Every pit starts with 4 seeds.
3. On your turn, pick one of your pits, lift all its seeds, and drop them one by one around the board, counterclockwise.
4. If your last seed lands in your own store, you play again.
5. If your last seed lands in an empty pit on your side, you capture that seed and everything in the pit opposite.
6. When one side runs out of seeds, the game ends. The player with the most seeds in their store wins.

## 2. Terms

| Term | Meaning |
| :--- | :--- |
| Pit | One of the 12 small cups on the board, 6 per player |
| Store | The big cup at the end of the board. Each player owns one. Seeds in a store are safe and count as score |
| Seed | A playing piece (a stone or bead) |
| Side | The 6 pits belonging to one player |
| Sowing | Lifting seeds from a pit and dropping them one at a time into the following slots |
| Slot | Any place a seed can land: a pit or a store |
| Opposite pit | The pit directly across the board from a given pit |
| Extra turn | Playing again immediately after your move |
| Capture | Taking seeds from the opposite pit into your store |
| Sweep | Moving all remaining seeds on a side into its owner's store at the end of the game |

## 3. Setup

### 3.1 Equipment

1. 12 pits, arranged in two rows of 6.
2. 2 stores, one at each end.
3. 48 seeds in total (6 pits per side times 2 sides times 4 seeds).

### 3.2 Starting position

```
            Player 1 side
   [S1]  [4] [4] [4] [4] [4] [4]
         [4] [4] [4] [4] [4] [4]  [S0]
            Player 0 side
```

Every pit holds 4 seeds. Both stores are empty.

### 3.3 Pit numbering (used by the engine and the tests)

Pits are numbered in the order seeds travel.

```
            Player 1 side
   [S1]  [11] [10] [ 9] [ 8] [ 7] [ 6]
         [ 0] [ 1] [ 2] [ 3] [ 4] [ 5]  [S0]
            Player 0 side
```

1. Player 0 owns pits 0 to 5 and the store on the right.
2. Player 1 owns pits 6 to 11 and the store on the left.
3. The opposite of pit `i` is pit `11 minus i`. So pit 0 faces pit 11, and pit 5 faces pit 6.
4. In the app, the board is shown flipped when needed so that **you are always at the bottom**. The numbering above never changes in the engine.

### 3.4 Who goes first

| Mode | Rule (proposed) |
| :--- | :--- |
| Play vs computer | The player chooses: You, Computer, or Random. Default is You |
| Play a friend online | Random, decided by the server |
| Pass and play | Player 0 (bottom) goes first, and the loser starts the next game |

This is an open decision (see section 13, item 7).

## 4. Taking a turn

1. Choose one of **your own** pits that has at least one seed. Empty pits and the opponent's pits cannot be chosen.
2. Lift all the seeds from that pit.
3. Move counterclockwise, starting with the next slot, and drop one seed in each slot until your hand is empty.
4. Resolve what happened with the last seed (sections 6 and 7).
5. Check whether the game is over (section 8).
6. If not over, the turn passes to the other player, unless you earned an extra turn.

## 5. Sowing

### 5.1 Direction and path

Seeds travel counterclockwise. For Player 0 the path is:

pit 0, 1, 2, 3, 4, 5, then **your store**, then the opponent's pits 6, 7, 8, 9, 10, 11, then back to pit 0.

For Player 1 the path is:

pit 6, 7, 8, 9, 10, 11, then **your store**, then the opponent's pits 0, 1, 2, 3, 4, 5, then back to pit 6.

### 5.2 The opponent's store is skipped

You drop seeds into your own store when you pass it, but you never drop a seed into the opponent's store. If your path reaches it, jump over it without dropping anything.

### 5.3 Long moves (laps)

If you have 13 or more seeds, you will go all the way around and pass the starting pit again.

1. The starting pit is **not skipped**. It receives seeds like any other pit.
2. The opponent's store is skipped on every lap.
3. There are 13 slots a seed can land in (6 own pits, own store, 6 opponent pits). A move with exactly 13 seeds therefore ends in the starting pit.

## 6. Extra turn

If your **last seed lands in your own store**, you play again.

1. There is no limit on the number of extra turns in a row.
2. If an extra turn leaves a side empty, the game ends immediately (section 8).

## 7. Capture

A capture happens when **all** of these are true:

1. Your last seed lands in a pit on **your own side**.
2. That pit was **empty** before the seed landed (so it now holds exactly 1 seed).
3. The **opposite pit has at least one seed**.

When it happens, take your single landing seed **and** every seed in the opposite pit, and put them all in your store.

If the opposite pit is empty, nothing is captured, and your seed stays in the pit.

Captures only work on your own side. Landing in an empty pit on the opponent's side does nothing.

## 8. End of game and scoring

### 8.1 When the game ends

After every move (including a move that earns an extra turn), check both sides. If **either side has no seeds in any pit**, the game is over.

### 8.2 Sweep

When the game ends, the player who still has seeds on their side moves all of them into their own store.

### 8.3 Winner

Compare the two stores. The player with more seeds wins. If both stores are equal (24 each), the game is a draw.

Seed count check: store 0 plus store 1 plus all pits always equals 48.

### 8.4 Other ways a game can end (online play)

| Reason | Result |
| :--- | :--- |
| A player resigns | The other player wins |
| A player runs out of time twice in a row | The other player wins |
| A player disconnects and does not return within 60 seconds | The other player wins |

These come from the server rules in `TECHNICAL_GUIDE.md`. They are not part of the physical game, only of the online version.

## 9. Worked examples

Starting position unless stated otherwise.

### Example 1: an extra turn

Player 0 plays pit 2, which has 4 seeds.

1. Seeds drop in pit 3, pit 4, pit 5, and then the store.
2. The last seed lands in Player 0's store, so Player 0 plays again.

Result: Player 0 pits are `[4, 4, 0, 5, 5, 5]`, store 0 holds 1, and it is still Player 0's turn.

### Example 2: a capture

Position: Player 0 has 1 seed in pit 0 and pit 1 is empty. Pit 10 (opposite pit 1) holds 5 seeds.

1. Player 0 plays pit 0 and drops its single seed in pit 1.
2. Pit 1 was empty and is on Player 0's side, and pit 10 has seeds.
3. Capture: the landing seed plus the 5 seeds from pit 10, 6 seeds in total, go to store 0.

Result: pit 0, pit 1, and pit 10 are empty, store 0 gains 6, and the turn passes to Player 1.

### Example 3: skipping the opponent's store

Player 1 plays pit 11 holding 4 seeds. Slots in order: Player 1's store, pit 0, pit 1, pit 2. One seed goes into Player 1's store (own store, not skipped), then three into Player 0's pits. If Player 1 had 9 seeds, the path would continue through pit 5, then **skip Player 0's store**, and carry on with pit 6.

### Example 4: a move with exactly 13 seeds

Player 0 plays pit 3 holding 13 seeds. Seeds go to pits 4, 5, store 0, pits 6 to 11 (skipping store 1), then pits 0, 1, 2, and the 13th seed lands back in pit 3. Pit 3 was emptied when lifted, so it counts as empty. If pit 8 (opposite pit 3) holds seeds, a capture happens.

### Example 5: end of game and sweep

After a capture, all six of Player 1's pits are empty. Player 0 still has 7 seeds on their side. The game ends, Player 0 sweeps the 7 seeds into their store, and the stores are compared.

## 10. Edge cases

| Situation | Ruling |
| :--- | :--- |
| Choosing an empty pit | Not allowed. The app does not accept the tap |
| Choosing a pit on the opponent's side | Not allowed |
| Last seed lands in a pit that already had seeds (own or opponent's) | Nothing special. The turn passes |
| Last seed lands in an empty pit on your side, opposite pit is empty | No capture. The seed stays. The turn passes |
| Last seed lands in an empty pit on the opponent's side | Nothing special. The turn passes |
| Extra turn, but your side is now empty | The game ends at once. The other player sweeps |
| Extra turn, but the opponent's side is empty | The game ends at once. You sweep |
| Both stores equal at the end | Draw |
| A player has no legal move at the start of their turn | Cannot happen. The game would already have ended |
| Resigning in a game against the computer | Counts as a loss against that difficulty |
| Undo in a game against the computer | Allowed, returns to your previous decision point. Not available online |

## 11. Rules as configuration

The engine reads a `Rules` object so variants never need new code paths for the basics.

```ts
interface Rules {
  pitsPerSide: number;         // 6
  seedsPerPit: number;         // 4
  extraTurnOnStore: boolean;   // true
  capture: boolean;            // true
  relaySowing: boolean;        // false
}
```

| Setting | v1 value | What changing it does |
| :--- | :--- | :--- |
| `pitsPerSide` | 6 | Board size. Other sizes need new board art |
| `seedsPerPit` | 4 | Starting seeds. Total seeds follow automatically |
| `extraTurnOnStore` | true | Turns the extra turn rule on or off |
| `capture` | true | Turns capture on or off |
| `relaySowing` | false | If true, when the last seed lands in a pit that already had seeds, lift them all and keep sowing |

The ruleset id (for example `kalah6x4`) is saved with every match so old games can always be replayed with the right rules.

## 12. Variants backlog

Gebeta is played differently in different regions and even in different families. Do not guess. Collect real variants from players, then add each as a named preset.

| Candidate variant | What differs | Status |
| :--- | :--- | :--- |
| Relay sowing | Keep sowing from the last pit if it was not empty | Planned for a later release |
| Different starting seeds | 3, 5, or 6 seeds per pit | Cheap to add through config |
| Capture rule changes | Capture only above a certain count, or capture from both sides | Needs player input |
| End of game sweep | Leftover seeds go to the side owner instead of the player with seeds | Needs player input |
| Local names and house rules | Anything your testers describe | Collect during the closed test |

## 13. Open questions to confirm with real players

Ask 3 or 4 people who actually play. Record answers in the table, then mark each item confirmed or changed before the engine is locked.

| # | Question | Proposed default | Answer from players | Final decision |
| :--- | :--- | :--- | :--- | :--- |
| 1 | How many pits per row and how many starting seeds per pit? | 6 pits, 4 seeds | | |
| 2 | Which direction do seeds travel? | Counterclockwise | | |
| 3 | Is the opponent's store skipped, and are there stores at all? | Stores exist, opponent's is skipped | | |
| 4 | Do you play again when the last seed lands in your store? | Yes | | |
| 5 | Is there a capture, and what exactly triggers it? | Last seed in your empty pit, opposite pit has seeds | | |
| 6 | Do you keep sowing when the last seed lands in a full pit (relay)? | No in v1, add as a variant | | |
| 7 | Who starts, and who starts the next game? | Variable by mode, see 3.4 | | |
| 8 | When does the game end, and where do leftover seeds go? | Either side empty, owner of remaining seeds takes them | | |
| 9 | Is the starting pit skipped on a long move? | No | | |
| 10 | Are there any local rules or names people expect? | None | | |

### Interview tips

1. Ask them to **show** you two or three turns on a real or drawn board. People describe rules badly but demonstrate them well.
2. Record a short video or photos of the board after each move.
3. Ask what they argue about when they play. Those arguments are your rule variants.
4. Ask what they call the pits, the seeds, and the captures, in Amharic and other languages. Use their words in the app.

## 14. Test mapping

Every rule above becomes at least one test in the engine package. Use these ids in test names so a failing test points back to this file.

| Id | Rule | Section |
| :--- | :--- | :--- |
| R1 | Starting position has 48 seeds, 4 per pit | 3.2 |
| R2 | Opposite pit is `11 minus i` | 3.3 |
| R3 | Seeds travel counterclockwise from the next slot | 5.1 |
| R4 | Opponent's store is never fed | 5.2 |
| R5 | Laps work and skip the opponent's store every time | 5.3 |
| R6 | 13 seed move ends in the starting pit | 5.3 |
| R7 | Last seed in own store gives an extra turn | 6 |
| R8 | Capture happens only in an empty own pit with a loaded opposite pit | 7 |
| R9 | No capture when the opposite pit is empty | 7 |
| R10 | No capture on the opponent's side | 7 |
| R11 | Game ends when either side is empty, including after an extra turn | 8.1 |
| R12 | Sweep gives leftovers to the correct owner | 8.2 |
| R13 | Equal stores give a draw | 8.3 |
| R14 | Illegal moves throw an error and change nothing | 10 |
| R15 | Total seeds always equals 48 | 8.3 |

## 15. Text for the in app How to play screen

Short version, to be shown in the app (translate to Amharic with a native speaker):

1. **Goal:** collect more seeds in your store than your opponent.
2. **Your move:** tap one of your pits. Its seeds are dropped one by one, counterclockwise.
3. **Go again:** if your last seed lands in your store, you play again.
4. **Capture:** if your last seed lands in an empty pit on your side, you take it and all the seeds in the pit across from it.
5. **The end:** when one side is empty, the game ends and the player with the most seeds in their store wins.

## 16. Change log

| Version | Date | Change |
| :--- | :--- | :--- |
| 0.1 | 29 Oct 2026 | First draft from the technical guide, waiting for player confirmation |