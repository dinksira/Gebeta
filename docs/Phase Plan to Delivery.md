# Gebeta Online: Phase Plan to Delivery

This plan takes the project from an empty repo to a live Play Store release and the first round of updates. It follows `TECHNICAL_GUIDE.md` for the how, and `CODING_STANDARDS.md` for the style.

## 1. The shape of the plan

Eleven phases, grouped into four milestones. The order is built so that you always have something playable, and so the slow parts (store approval, tester time) start running early.

| Milestone | Phases | What you have at the end |
| :--- | :--- | :--- |
| M1: Offline game | 0 to 3 | A full Gebeta game against the AI, on a phone |
| M2: Closed test live | 4 | Real testers using the offline build, Play clock running |
| M3: Online game | 5 to 7 | Friend rooms, accounts, ratings, leaderboard |
| M4: Launch | 8 to 10 | Hardened, polished app live on the Play Store |

After that, Phase 11 is the ongoing update cycle.

## 2. Effort and calendar

Effort is in working days of focused work. Ranges include the usual surprises, but not a full disaster.

| Phase | Name | Effort (days) |
| :--- | :--- | :--- |
| 0 | Foundations and decisions | 3 to 4 |
| 1 | Game engine | 6 to 8 |
| 2 | Board UI and local play | 8 to 10 |
| 3 | AI, audio, settings | 8 to 10 |
| 4 | Offline alpha and closed test | 2 to 3 |
| 5 | Server and rooms | 8 to 10 |
| 6 | Online play in the app | 8 to 10 |
| 7 | Accounts, rating, leaderboard | 6 to 8 |
| 8 | Hardening | 6 to 8 |
| 9 | Polish and store listing | 6 to 8 |
| 10 | Launch | 3 to 4 |
| | **Total** | **64 to 83 days** |

What that means on a calendar:

1. **Full time:** roughly 13 to 17 weeks, about 3 to 4 months.
2. **Around 15 hours a week alongside other work:** roughly 8 to 10 months.
3. Add a 20 percent buffer for life, sickness, and bugs that eat a week.

The earlier six week plan was the lean path to a playable online prototype. This plan is the full path to a release you are proud to put your name on.

### Rough timeline at full time pace

```
Week   1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
P0     #
P1        #  #
P2              #
P3                 #  #
P4                       #
P5                          #
P6                             #  #
P7                                   #
P8                                      #  #
P9                                            #
P10                                              #
Closed test clock           ==========
```

The closed test clock (see Phase 4) runs while you build the online features, so it costs you almost no extra calendar time.

## 3. Store rules that shape the plan

These two rules affect planning, so they come first. Check them again in Play Console before you rely on them, because Google changes policies.

1. **Closed testing for new personal accounts.** If your developer account is personal and was created after 13 November 2023, you need at least 12 testers opted in to a closed test for 14 continuous days before you can apply for production access. Organization accounts and older personal accounts are exempt. This is why Phase 4 exists and why it comes early.
2. **Ethiopia and payments.** Google Play lets developers in Ethiopia register, but at the time of writing does not support merchant registration there. Merchant registration is what paid apps and Play Billing purchases depend on. For v1 this does not matter because the game is free. It matters in Phase 11 when you think about money.

Also worth knowing: the Play Console registration fee is a one time $25, and the production access decision after the closed test can take several days.

## 4. Phase details

### Phase 0: Foundations and decisions (3 to 4 days)

**Goal:** remove every blocker before writing game code.

Tasks:

1. Talk to at least 3 or 4 people who actually play Gebeta. Record which rules they use: starting seeds, capture, extra turns, relay sowing, end of game sweep.
2. Write the v1 rules spec as a one page document and get one or two players to confirm it.
3. Create the repo with the three packages: `engine`, `app`, `server`.
4. Set up TypeScript strict mode, ESLint, Prettier, Husky, and Jest.
5. Set up continuous integration to run lint, type check, and tests on every push.
6. Register the Google Play developer account now. Check whether it falls under the closed testing rule. Registration and verification can take days, so do not leave it for later.
7. Decide the app name, package id, and a rough visual direction (wood, colors, seed style).
8. Create a simple project board with the phases in this document as columns or milestones.

Deliverables: rules spec, working repo, green CI, developer account registered.

Exit criteria: `pnpm test` runs and passes on an empty test, CI is green, rules spec is written and approved by at least one real player.

### Phase 1: Game engine (6 to 8 days)

**Goal:** a fully tested, pure TypeScript Gebeta engine.

Tasks:

1. Implement types, `Rules`, and the ring helpers (`pitToSlot`, `oppositeSlot`, and so on).
2. Implement `createGame`, `legalMoves`, `isLegal`, and `applyMove` with the step trace.
3. Implement game over detection, sweep, winner, and draw.
4. Write tests for every rule and every edge case in the technical guide.
5. Write invariant tests (seed count conserved, no negative numbers, no input mutation).
6. Build the replay test: thousands of random games, then replay each move log and compare final states.
7. Write a small terminal script so you can play a game by hand and feel the rules.
8. Prepare the rules config so variants can be added later without touching `applyMove`.

Deliverables: `engine` package with high test coverage and a playable terminal demo.

Exit criteria: all tests pass, the random game replay test passes, you have played a full game in the terminal and it feels like Gebeta.

Risks: wrong rules. Mitigation: have a real player try the terminal version and tell you what feels off.

### Phase 2: Board UI and local play (8 to 10 days)

**Goal:** two people can play a full game on one phone with a good looking, smooth board.

Tasks:

1. Create the Expo app, set up navigation, theme tokens (colors, spacing, fonts), and the i18n structure.
2. Build the board layout: 12 pits, 2 stores, seed rendering, turn indicator, score display.
3. Connect the board to the engine through a `gameStore`.
4. Implement tap handling with legal move highlighting and ignoring illegal taps.
5. Build the sowing animation from the engine step trace using Reanimated: lift, drop one by one, bounce, store drop.
6. Handle extra turns, captures, and game over visually (a clear capture effect, a clear result).
7. Build the Home screen, the Game screen, and the Result screen with a rematch button.
8. Test on a real low end Android phone from the first day, not at the end.

Deliverables: local two player game with polished board and animation.

Exit criteria: a full game plays start to finish with no visual glitches, animation stays smooth on a low end device, nobody can make an illegal move.

Risks: animation jank on weak phones. Mitigation: keep animation on the UI thread, keep the seed count of rendered objects low, profile early.

### Phase 3: AI, audio, settings (8 to 10 days)

**Goal:** a complete offline game that is fun alone.

Tasks:

1. Implement the AI levels: easy (weighted random), medium (one move lookahead), hard (minimax with alpha beta pruning, move ordering, iterative deepening with a time limit).
2. Add the think delay in the app so the AI feels natural.
3. Test the AI: always legal, hard beats easy over many simulated games, hard stays within the time budget on a low end phone.
4. Add sound effects (seed drop, capture, extra turn, win, lose) and haptics.
5. Build Settings: sound, haptics, language, board theme, rule variant (even if only one exists yet).
6. Add the Amharic and English translations for every screen so far.
7. Add undo for AI games, and a resign option.
8. Save simple local stats (games played, wins against each level).
9. Add a short how to play screen that explains the rules.

Deliverables: complete offline Gebeta game with three AI levels.

Exit criteria: you can hand the phone to a friend with no explanation beyond the how to play screen, and they enjoy a full game against the AI.

### Phase 4: Offline alpha and closed test (2 to 3 days)

**Goal:** get real testers using the app and start the Play Store clock.

Tasks:

1. Set up app signing, the release build pipeline (EAS build or your own), and versioning.
2. Add crash reporting and basic analytics (for example sessions, games started, games finished, where people quit).
3. Create the minimal store listing needed for a test track: name, short description, icon, screenshots, privacy policy page.
4. Upload the build to the internal test track first and check it installs and runs.
5. Create a closed test track and recruit at least 12 testers with Android phones. Aim for 15 to 20 so a few dropouts do not hurt. Friends, family, classmates from Dilla, coworkers, and local developer groups are all fair game.
6. Tell testers they must stay opted in for 14 days and should actually open and play the app a few times, not just install it.
7. Write a simple feedback form: what felt wrong, what rules differ from how they play, what crashed.
8. Keep an eye on the tester count in Play Console every few days.

Deliverables: closed test running with 12 or more opted in testers, crash and analytics reporting live.

Exit criteria: the 14 day clock has started with the required number of testers.

Notes: you can keep uploading new builds to the closed track while the test runs, so the online features can arrive in later builds. Do not pause or halt the track, because that can break the continuous period.

### Phase 5: Server and rooms (8 to 10 days)

**Goal:** a working authoritative game server, tested without the app.

Tasks:

1. Create the Node server with config parsing, logging, and the `/health` endpoint.
2. Implement the `RoomStore` interface with an in memory version first.
3. Implement room code generation, `create_room`, `join_room`, and room expiry.
4. Implement `make_move` with payload validation, turn and seat checks, `seq` checks, and engine validation.
5. Implement `state_update` and `game_over` broadcasts.
6. Implement move timers, timeout strikes, and resign.
7. Implement disconnect handling: hold the room, `opponent_status`, `resume_room`, and the abandoned outcome.
8. Add rate limiting and structured error responses using the error codes in the guide.
9. Write a Node test client and an integration test where two clients play a full game against the real server.
10. Write a small script that plays hundreds of bot games against the server to find crashes and desyncs.

Deliverables: server that passes a full two client game test, including disconnect and timeout cases.

Exit criteria: bot games run for an hour without errors, illegal and out of order moves are rejected, timers and reconnect behave as specified.

### Phase 6: Online play in the app (8 to 10 days)

**Goal:** two phones play each other through a room code.

Tasks:

1. Build the typed socket service on the shared protocol, with automatic reconnect.
2. Build the Create Room and Join Room screens, with the share button for Telegram and WhatsApp.
3. Build the waiting room view (code, share, cancel).
4. Connect the game screen to online mode: local animation first, then reconcile with the server state.
5. Show the move timer from `deadlineAt`, the opponent connection status, and clear messages for errors.
6. Implement rollback and resync when the server rejects a move or the states differ.
7. Handle app background and foreground, screen lock, and network changes during a match.
8. Add rematch and leave room flows.
9. Deploy the server to a staging host and test over a real mobile network, not just Wi Fi.
10. Test on throttled and unstable connections on purpose.

Deliverables: playable online friend matches on real devices.

Exit criteria: ten full matches between two phones on mobile data with no stuck games, and a dropped connection recovers within the hold window.

Risks: desync between client and server. Mitigation: the server state always wins, and the app logs every mismatch so you can find the bug.

### Phase 7: Accounts, rating, leaderboard (6 to 8 days)

**Goal:** progress, identity, and competition.

Tasks:

1. Set up Postgres and the migrations for `users` and `matches`.
2. Implement guest login with a device id and token, and `/me` for profile.
3. Attach the token to REST calls and the socket handshake.
4. Save every finished online match with its move log.
5. Implement Elo updates and store the rating change.
6. Build the Profile screen: username, rating, tier label, wins and losses.
7. Implement `/leaderboard` with a 60 second cache and build the leaderboard screen.
8. Add username editing with validation and a basic word filter.
9. Plan for account recovery (phone or Google login) and decide whether it ships in v1 or v1.1.
10. Add a match history list if time allows (a replay screen can come later, since move logs are already stored).

Deliverables: ratings change after online matches, leaderboard works.

Exit criteria: finishing a match updates both players correctly, a reinstall with the same device keeps the account, rating math matches the unit tests.

### Phase 8: Hardening (6 to 8 days)

**Goal:** make it reliable, safe, and fast before real users arrive.

Tasks:

1. Run a security pass: token handling, input validation on every endpoint and event, rate limits, no secrets in logs, secrets only in environment variables.
2. Load test the server with many bot matches at once and see where it breaks. Fix the first bottleneck.
3. Move live room state to Redis if you expect more than one server process, otherwise leave a note on when to do it.
4. Add database backups and test restoring one.
5. Add uptime monitoring and alerts for the server.
6. Test on at least 4 or 5 real devices, including the cheapest Android phone you can find and an older Android version.
7. Test poor network scenarios: airplane mode mid match, switching Wi Fi and mobile data, very slow connection.
8. Measure against the targets in the technical guide (startup time, APK size, data per match, fps) and fix what misses.
9. Review crash reports and analytics from the closed test and fix the top issues.
10. Add a report and feedback option in the app.

Deliverables: stable build, monitoring, backups, a list of measured numbers.

Exit criteria: no known crashes, the server survives your load test, performance targets are met or consciously adjusted.

### Phase 9: Polish and store listing (6 to 8 days)

**Goal:** the app feels finished and the listing sells it.

Tasks:

1. Visual polish pass: board texture, seed look, pit shadows, fonts, spacing, empty and error states.
2. Sound polish pass: levels, timing, no clipping.
3. Smooth the onboarding: username screen, quick tutorial, first game against an easy AI.
4. Review all Amharic text with a native speaker, and fix layout issues with Fidel text.
5. Add accessibility basics: touch target sizes, readable contrast, scalable text where possible.
6. Write the final store listing: title, short and full description, feature list, category, content rating questionnaire, data safety form.
7. Produce screenshots, an icon, and a feature graphic. A 20 to 30 second gameplay video is a big help.
8. Finish the privacy policy and make sure the data safety answers match what the app really collects.
9. Run a final round of playtests with fresh people who have never seen the game, and fix the top friction points.
10. Freeze features. Only bug fixes from this point.

Deliverables: release candidate build and a complete store listing.

Exit criteria: new players understand the game without help, the listing is complete, there are no blocking bugs.

### Phase 10: Launch (3 to 4 days of work, plus waiting)

**Goal:** go live safely.

Tasks:

1. Confirm the closed test has completed its 14 days with the required testers, then apply for production access in Play Console.
2. While waiting for the decision, prepare the production server environment (separate database, secrets, monitoring) and run a final smoke test.
3. Upload the release candidate to production.
4. Use a staged rollout: start at a small percentage, watch crash rates and server health, then increase.
5. Prepare launch posts and a short demo video for Telegram groups, local developer communities, universities, and social media.
6. Watch the first 48 hours closely: crashes, server load, reviews, and feedback messages.
7. Reply to every early review. It builds trust and gives you free product feedback.
8. Keep a hotfix path ready: a way to ship a patch within a day.

Deliverables: app live on the Play Store.

Exit criteria: public release at 100 percent rollout with stable crash and server numbers for a few days.

### Phase 11: After launch (ongoing)

**Goal:** keep the game alive and growing.

Rough update cadence: a small update every 2 to 4 weeks, and a bigger feature release every 2 to 3 months.

Candidates for the first updates, roughly in priority order:

1. Fixes and tuning from real player feedback and analytics.
2. Regional rule variants (relay sowing and local versions), chosen by what players ask for.
3. Ranked matchmaking with a queue and a bot fallback when nobody is waiting.
4. Phone or Google login so progress survives a lost phone.
5. Oromiffa and other languages.
6. Cosmetics: board and seed skins, themes.
7. Tournaments and daily challenges.
8. Match replays and sharing.
9. An iOS version (the code is already cross platform, so the work is mostly store setup and testing).
10. Money. Keep it fair: cosmetics and optional ads, nothing that gives paying players an advantage. Verify what payment and payout options your Play account can actually use from Ethiopia before designing around Play Billing.

Things to measure from day one: day 1, day 7, and day 30 retention, games per user per day, share of players using AI versus friend rooms, how often matches end by timeout or abandonment, crash free sessions.

## 5. Critical path

The chain that decides your release date:

1. Rules confirmed (Phase 0)
2. Engine (Phase 1)
3. Board UI (Phase 2)
4. AI and audio (Phase 3)
5. Closed test starts (Phase 4), which needs 14 days
6. Server (Phase 5) and online play (Phase 6) can overlap with the closed test
7. Hardening and polish (Phases 8 and 9)
8. Production access and rollout (Phase 10)

Anything that delays the first closed test build delays launch. This is why Phase 4 is small and sits right after the offline game works.

## 6. Cutting scope if time gets tight

If the calendar slips, cut in this order. Do not cut tests or the hardening phase.

1. Match history and replay screen
2. Leaderboard (keep ratings, ship the board in an update)
3. Rating entirely (ship friend rooms without ranking)
4. Board themes and extra sounds
5. Oromiffa and any language beyond English and Amharic
6. Redis (keep rooms in memory on a single server)

A strong minimum release is: offline AI game, friend rooms, guest profile, polish, and a clean store listing.

## 7. Risks across the whole project

| Risk | Impact | What to do |
| :--- | :--- | :--- |
| Rules disagree between players | Bad reviews, confusion | Settle in Phase 0, add variant toggle, include a how to play screen |
| Cannot find 12 committed testers | Launch delayed | Start recruiting in Phase 0, ask for 15 to 20, keep them engaged |
| Animation lag on cheap phones | Game feels bad | Test on a weak device from Phase 2 |
| Desync between client and server | Stuck or broken matches | Server authority, `seq` numbers, resync flow, bot soak tests |
| Empty online lobby | Feels dead | AI mode and friend rooms carry the game, add a bot fallback later |
| Scope creep | Never ships | Feature freeze in Phase 9, keep an ideas list for updates |
| Solo burnout | Project stalls | Ship small milestones, demo to friends often, take real breaks |
| Server costs or downtime | Bad experience | Single cheap server, monitoring, alerts, tested backups |

## 8. Working rhythm

1. Work in vertical slices. Finish one thing completely (code, tests, device check) before starting the next.
2. End every phase with a build on a real phone. If you cannot show it, it is not done.
3. Keep a short weekly review: what shipped, what slipped, what changes in the plan.
4. Update `TECHNICAL_GUIDE.md` whenever a decision changes, so it stays true.
5. Keep a running list of bugs and ideas. Bugs go to the current phase, ideas go to Phase 11.

## 9. Definition of done for version 1.0

1. A complete Gebeta game against three AI levels works offline.
2. Two players can play live through a room code, including reconnect after a dropped connection.
3. Players have a profile, a rating, and can see a leaderboard (or this is explicitly deferred).
4. English and Amharic are fully supported and checked by a native speaker.
5. Engine tests pass, server integration tests pass, bot soak tests run clean.
6. Performance targets are met on a low end Android device.
7. Crash reporting, analytics, uptime monitoring, and database backups are all running.
8. The store listing, privacy policy, and data safety form are complete and accurate.
9. The app is live on the Play Store with a staged rollout completed.