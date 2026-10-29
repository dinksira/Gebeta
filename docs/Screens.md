# Gebeta Online: Screens

This file describes every screen in the app: what it is for, what is on it, every state it can be in, where it leads, and the exact text shown in English and Amharic. It is the bridge between `DESIGN_SYSTEM.md` (how things look) and the code (what gets built).

**Amharic note:** all Amharic text below is a working draft. Every string must be reviewed by a native speaker before release. Long text marked "To translate" is left for that review.

Related files: `DESIGN_SYSTEM.md`, `GAME_RULES.md`, `TECHNICAL_GUIDE.md`, `PHASE_PLAN.md`.

## 1. Screen inventory

| Id | Screen | Route | Built in phase |
| :--- | :--- | :--- | :--- |
| S01 | Splash | `/` | 2 |
| S02 | Onboarding (username) | `/onboarding` | 3 |
| S03 | Home | `/home` | 2 |
| S04 | Game | `/game` | 2 |
| S05 | Difficulty sheet | modal over Home | 3 |
| S06 | Play a friend | `/room` | 6 |
| S07 | Waiting room | `/room/[code]` | 6 |
| S08 | Result | `/result` | 2 |
| S09 | Profile | `/profile` | 7 |
| S10 | Leaderboard | `/leaderboard` | 7 |
| S11 | Settings | `/settings` | 3 |
| S12 | How to play | `/howToPlay` | 3 |
| S13 | Shared dialogs, banners, and toasts | overlays | 2 to 6 |

## 2. Navigation map

```
Splash
  ↓
Onboarding (first launch only)
  ↓
Home ──→ Difficulty sheet ──→ Game (vs computer) ──→ Result ──→ Home or Game
  │
  ├────→ Game (pass and play) ──→ Result
  │
  ├────→ Play a friend ──→ Waiting room ──→ Game (online) ──→ Result
  │              └──────→ Join with code ──→ Game (online)
  │
  ├────→ Profile ──→ Edit name
  ├────→ Leaderboard
  └────→ Settings ──→ How to play
```

Rules for navigation:

1. The Android back button on Home exits the app. On Game it opens the "Leave game?" dialog. Everywhere else it goes back one screen.
2. After Result, back goes to Home, never back into the finished game.
3. Onboarding is shown once. After that the app opens straight to Home.

## 3. Copy conventions

1. Every string has a key like `home.playAi`, stored in `app/src/i18n/en.ts` and `am.ts`.
2. Placeholders use curly braces, for example `{name}` or `{n}`.
3. Buttons are short verbs. Messages are one sentence. No jargon.
4. Numbers always use Arabic digits (0 to 9) in both languages.
5. Never put text inside images.

### 3.1 Common strings

| Key | English | Amharic (draft) |
| :--- | :--- | :--- |
| `common.continue` | Continue | ቀጥል |
| `common.cancel` | Cancel | ሰርዝ |
| `common.back` | Back | ተመለስ |
| `common.close` | Close | ዝጋ |
| `common.retry` | Try again | እንደገና ሞክር |
| `common.ok` | OK | እሺ |
| `common.save` | Save | አስቀምጥ |
| `common.copy` | Copy | ቅዳ |
| `common.copied` | Copied | ተቀድቷል |
| `common.share` | Share | አጋራ |
| `common.leave` | Leave | ውጣ |
| `common.loading` | Loading... | በመጫን ላይ... |
| `common.you` | You | እርስዎ |
| `common.opponent` | Opponent | ተቃዋሚ |
| `common.computer` | Computer | ኮምፒውተር |

## 4. Screens

---

### S01 Splash

**Purpose:** show the brand while the app loads fonts, sounds, and the saved session.

**Layout**

1. Centered logo and the app name.
2. Small carved pattern band under the logo (see the cultural touches in `DESIGN_SYSTEM.md`).
3. Tagline at the bottom.

**States**

1. Loading: logo with a calm seed drop animation, 1 to 2 seconds at most.
2. Loaded: fade to Onboarding (first launch) or Home.
3. Failed to load assets: stay on the splash and show a retry button.

**Copy**

| Key | English | Amharic (draft) |
| :--- | :--- | :--- |
| `splash.title` | Gebeta | ገበጣ |
| `splash.tagline` | The classic board game, on your phone. | ታዋቂው የቦርድ ጨዋታ፣ በስልክዎ። |

**Notes:** keep it under 2 seconds on a low end phone. Do not make players wait on the network here.

---

### S02 Onboarding (username)

**Purpose:** get a username and start playing. No signup wall.

**Layout**

1. Title and short helper text.
2. One text input for the username.
3. Primary button at the bottom.

**Elements and actions**

1. Input with a live length counter.
2. Primary button "Start playing", disabled until the name is valid.
3. After saving, create the guest account (when the server is available) and go to Home.

**States**

1. Empty: button disabled.
2. Typing: validation messages appear under the field as needed.
3. Invalid: field border turns `danger` with a message.
4. Saving: button shows a spinner.
5. Offline: still allowed. The account is created later when the player first goes online.

**Rules:** 3 to 16 characters, letters (English or Amharic) and numbers only, no spaces at the ends, basic word filter.

**Copy**

| Key | English | Amharic (draft) |
| :--- | :--- | :--- |
| `onboarding.title` | Pick a username | የተጠቃሚ ስም ይምረጡ |
| `onboarding.helper` | 3 to 16 letters or numbers. Other players will see it. | ከ3 እስከ 16 ፊደላት ወይም ቁጥሮች። ሌሎች ተጫዋቾች ያዩታል። |
| `onboarding.placeholder` | Your name | ስምዎ |
| `onboarding.start` | Start playing | መጫወት ጀምር |
| `onboarding.errorShort` | Use at least 3 characters. | ቢያንስ 3 ፊደላት ይጠቀሙ። |
| `onboarding.errorLong` | Use 16 characters or fewer. | ከ16 ፊደላት አይበልጥ። |
| `onboarding.errorChars` | Use only letters and numbers. | ፊደላትና ቁጥሮች ብቻ ይጠቀሙ። |
| `onboarding.errorBlocked` | That name is not allowed. | ይህ ስም አይፈቀድም። |

**Decision:** Usernames are non-unique display names (3 to 16 characters). Players are uniquely identified by their device ID and internal UUID, removing the need for an availability check endpoint during guest onboarding.

---

### S03 Home

**Purpose:** the starting point. Get into any game mode in one tap.

**Layout (top to bottom)**

1. Top bar: greeting on the left, profile and settings icons on the right.
2. Game mode cards, stacked:
   1. Play vs computer
   2. Play a friend
   3. Pass and play
   4. Ranked (locked until ready)
3. Small links row: Leaderboard and How to play.
4. Decorative pattern band at the very bottom.

**Actions**

| Tap | Goes to |
| :--- | :--- |
| Play vs computer | S05 Difficulty sheet |
| Play a friend | S06 Play a friend |
| Pass and play | S04 Game in local mode |
| Ranked | Shows a "Coming soon" message, does nothing else |
| Profile icon | S09 Profile |
| Settings icon | S11 Settings |
| Leaderboard | S10 Leaderboard |
| How to play | S12 How to play |

**States**

1. Default: all cards enabled.
2. Offline: Play a friend and Leaderboard show a small offline marker and a message when tapped. Computer and pass and play stay fully usable.
3. Server unreachable: same as offline, with a retry option.
4. Ranked locked: dimmed card with a "Coming soon" label.

**Copy**

| Key | English | Amharic (draft) |
| :--- | :--- | :--- |
| `home.greeting` | Hello, {name} | ሰላም፣ {name} |
| `home.playAi` | Play vs computer | ከኮምፒውተር ጋር ተጫወት |
| `home.playAiSub` | Practice anytime, even offline | በማንኛውም ጊዜ ተለማመዱ፣ ያለ በይነመረብም |
| `home.playFriend` | Play a friend | ከጓደኛ ጋር ተጫወት |
| `home.playFriendSub` | Share a room code | የክፍል ኮድ ያጋሩ |
| `home.passPlay` | Pass and play | በተራ ተጫወቱ |
| `home.passPlaySub` | Two players, one phone | ሁለት ተጫዋቾች፣ አንድ ስልክ |
| `home.ranked` | Ranked | የደረጃ ጨዋታ |
| `home.comingSoon` | Coming soon | በቅርብ ቀን |
| `home.leaderboard` | Leaderboard | የደረጃ ሰንጠረዥ |
| `home.howToPlay` | How to play | እንዴት እንደሚጫወቱ |
| `home.offlineNote` | You are offline. Computer and pass and play still work. | ከመስመር ውጪ ነዎት። ከኮምፒውተር ጋር እና በተራ መጫወት ይቻላል። |

---

### S04 Game

**Purpose:** the main screen. One screen for all three modes (computer, pass and play, online).

**Layout**

1. Top area: opponent name, avatar, rating (online only), move timer (online only), turn marker.
2. Center: the board, 12 pits and 2 stores, with seed counts.
3. Bottom area: your name, avatar, rating (online only), move timer, turn marker.
4. Status line between the board and the player areas for short messages ("Your turn", "Captured 5!").
5. Menu button (top corner) for Resign, Undo (computer mode), How to play, Settings.

Details of the board (sizes, pit states, seeds) are in `DESIGN_SYSTEM.md`, section 5.

**Mode differences**

| Element | Computer | Pass and play | Online |
| :--- | :--- | :--- | :--- |
| Opponent name | Computer and level | Player 2 | Opponent's username |
| Ratings | Hidden | Hidden | Shown |
| Move timer | Hidden | Hidden | Shown, 30 seconds |
| Undo | Available | Hidden | Hidden |
| Board flips for second player | No | The top player's side is rotated so they can read it | Yes, you are always at the bottom |
| Connection banner | Hidden | Hidden | Shown when needed |

**States**

1. Your turn: legal pits glow, status line says "Your turn".
2. Opponent's turn: no glow, taps ignored, status line shows whose turn it is.
3. Computer thinking: short delay, status line shows "Computer is thinking...".
4. Animating: taps blocked, incoming updates queued.
5. Extra turn: status line flashes "Go again!".
6. Capture: capture effect plays and the status line shows the count.
7. Low timer: bar turns `warning` at 10 seconds and `danger` at 5, with a tick each second.
8. Opponent disconnected (online): banner with a countdown.
9. Reconnecting (you, online): banner "Reconnecting...".
10. Game over: short pause, then go to Result.

**Actions**

1. Tap a legal pit: play the move.
2. Tap an illegal pit: gentle shake, no error sound.
3. Menu, Resign: confirmation dialog (see S13), then Result.
4. Menu, Undo (computer only): go back to your previous decision point.
5. Android back: opens the Leave game dialog.

**Copy**

| Key | English | Amharic (draft) |
| :--- | :--- | :--- |
| `game.yourTurn` | Your turn | የእርስዎ ተራ |
| `game.theirTurn` | {name}'s turn | የ{name} ተራ |
| `game.computerThinking` | Computer is thinking... | ኮምፒውተሩ እያሰበ ነው... |
| `game.goAgain` | Go again! | እንደገና ይጫወቱ! |
| `game.captured` | Captured {n}! | {n} ዘር ወስደዋል! |
| `game.timeLeft` | {s}s left | {s} ሰከንድ ቀርቷል |
| `game.timeUp` | You ran out of time | ጊዜዎ አልቋል |
| `game.menu` | Menu | ምናሌ |
| `game.resign` | Resign | እጅ ስጥ |
| `game.undo` | Undo | ቀልብስ |
| `game.player1` | Player 1 | ተጫዋች 1 |
| `game.player2` | Player 2 | ተጫዋች 2 |
| `game.level.easy` | Computer (Easy) | ኮምፒውተር (ቀላል) |
| `game.level.medium` | Computer (Medium) | ኮምፒውተር (መካከለኛ) |
| `game.level.hard` | Computer (Hard) | ኮምፒውተር (ከባድ) |
| `game.opponentLeft` | {name} disconnected. Waiting {s}s... | {name} ተቋርጧል። {s} ሰከንድ በመጠበቅ ላይ... |
| `game.opponentBack` | {name} is back | {name} ተመልሷል |
| `game.reconnecting` | Reconnecting... | እንደገና በመገናኘት ላይ... |
| `game.connectionLost` | Connection lost. Trying to get you back in the game. | ግንኙነት ተቋርጧል። ወደ ጨዋታው ለመመለስ በመሞከር ላይ። |

**Accessibility announcements (screen reader)**

| Event | Announcement |
| :--- | :--- |
| Pit focus | "Pit {n}, {count} seeds, your side, tap to play" |
| Opponent move | "{name} played pit {n}" |
| Capture | "{name} captured {count} seeds" |
| Extra turn | "Go again" |
| Turn change | "Your turn" |

---

### S05 Difficulty sheet

**Purpose:** pick a computer difficulty and who moves first.

**Layout:** a bottom sheet over Home with a drag handle.

1. Title.
2. Three difficulty options as large selectable rows, each with a one line description.
3. "First move" choice: You, Computer, Random.
4. Primary button "Start".

**States:** last used choices are remembered. Start is always enabled.

**Copy**

| Key | English | Amharic (draft) |
| :--- | :--- | :--- |
| `ai.title` | Choose difficulty | ደረጃ ይምረጡ |
| `ai.easy` | Easy | ቀላል |
| `ai.easyDesc` | Relaxed. Good for learning. | ዘና ያለ። ለመማር ጥሩ። |
| `ai.medium` | Medium | መካከለኛ |
| `ai.mediumDesc` | A fair challenge. | ተመጣጣኝ ፈተና። |
| `ai.hard` | Hard | ከባድ |
| `ai.hardDesc` | Plays to win. | ለማሸነፍ ይጫወታል። |
| `ai.firstMove` | First move | የመጀመሪያ ተራ |
| `ai.firstYou` | You | እርስዎ |
| `ai.firstComputer` | Computer | ኮምፒውተር |
| `ai.firstRandom` | Random | በዕጣ |
| `ai.start` | Start | ጀምር |

---

### S06 Play a friend

**Purpose:** create a room, or join one with a code.

**Layout**

1. Title.
2. Primary card: "Create a room" button.
3. Divider with "or".
4. Join card: 5 box code input and a Join button.

**Actions**

| Tap | Result |
| :--- | :--- |
| Create a room | Request a room from the server, go to S07 Waiting room |
| Join | Send the code, go to S04 Game when the room is ready |

**Code input rules:** 5 boxes, uppercase only, auto advance, paste support, accepts only the safe alphabet (no 0, O, 1, I), Join stays disabled until all 5 boxes are filled.

**States**

1. Default.
2. Creating: Create button shows a spinner.
3. Joining: Join button shows a spinner.
4. Error: inline message under the code input (see the error table in section 6).
5. Offline: both actions disabled with an offline message.

**Copy**

| Key | English | Amharic (draft) |
| :--- | :--- | :--- |
| `room.title` | Play a friend | ከጓደኛ ጋር ተጫወት |
| `room.create` | Create a room | ክፍል ፍጠር |
| `room.or` | or | ወይም |
| `room.joinTitle` | Join with a code | በኮድ ግባ |
| `room.codeLabel` | Room code | የክፍል ኮድ |
| `room.join` | Join | ግባ |

---

### S07 Waiting room

**Purpose:** show the room code and wait for the friend to join.

**Layout**

1. Title.
2. Large room code in a card.
3. Copy and Share buttons beside the code.
4. "Waiting for opponent" with a calm looping animation.
5. Small expiry note.
6. Cancel room button.

**Actions**

1. Copy: copies the code and shows the "Copied" toast.
2. Share: opens the system share sheet with a ready message, Telegram and WhatsApp work through it.
3. Cancel room: closes the room and returns to S06.
4. When the friend joins: go straight to S04 Game.

**States**

1. Waiting.
2. Friend joined: brief "Opponent joined" moment, then Game.
3. Room expired (10 minutes): message with a button to create a new room.
4. Connection lost: banner, with automatic retry.

**Copy**

| Key | English | Amharic (draft) |
| :--- | :--- | :--- |
| `wait.title` | Your room code | የክፍልዎ ኮድ |
| `wait.hint` | Share this code with your friend. | ይህን ኮድ ለጓደኛዎ ያጋሩ። |
| `wait.waiting` | Waiting for opponent... | ተቃዋሚ በመጠበቅ ላይ... |
| `wait.expires` | The room closes in {m} min | ክፍሉ በ{m} ደቂቃ ውስጥ ይዘጋል |
| `wait.cancel` | Cancel room | ክፍሉን ሰርዝ |
| `wait.joined` | Opponent joined | ተቃዋሚ ገብቷል |
| `wait.expired` | This room has closed. | ይህ ክፍል ተዘግቷል። |
| `wait.newRoom` | Create a new room | አዲስ ክፍል ፍጠር |
| `wait.shareMessage` | Play Gebeta with me! Room code: {code} | ገበጣ እንጫወት! የክፍል ኮድ፦ {code} |

---

### S08 Result

**Purpose:** show the outcome clearly and make the next game one tap away.

**Layout**

1. Big headline: win, loss, or draw.
2. Final score, your store against theirs.
3. Reason line when the game did not end normally (resign, timeout, left).
4. Rating change (online games only), with a small count up animation.
5. Primary button: Rematch.
6. Tertiary button: Home.

**Actions**

| Tap | Result |
| :--- | :--- |
| Rematch (computer or pass and play) | New game, same settings, loser or opponent moves first as set in `GAME_RULES.md` |
| Rematch (online) | Sends a rematch request. The button waits for the opponent's answer |
| Home | S03 Home |

**States**

1. Win: warm headline, small flourish, win sound.
2. Loss: gentle headline, soft sound, no negative language.
3. Draw: neutral headline.
4. Saving result (online): rating row shows a spinner until the server confirms.
5. Rematch pending, declined, or opponent left: button updates and a message explains.

**Copy**

| Key | English | Amharic (draft) |
| :--- | :--- | :--- |
| `result.win` | You won! | አሸንፈዋል! |
| `result.loss` | You lost | ተሸንፈዋል |
| `result.draw` | It is a draw | አቻ ወጥተዋል |
| `result.score` | Final score {a} to {b} | የመጨረሻ ውጤት {a} ለ{b} |
| `result.rating` | Rating {n} ({delta}) | ደረጃ {n} ({delta}) |
| `result.reasonResign` | Your opponent resigned | ተቃዋሚዎ እጅ ሰጥቷል |
| `result.reasonTimeout` | Your opponent ran out of time | የተቃዋሚዎ ጊዜ አልቋል |
| `result.reasonAbandoned` | Your opponent left the game | ተቃዋሚዎ ጨዋታውን ለቋል |
| `result.reasonYouResign` | You resigned | እጅ ሰጥተዋል |
| `result.reasonYouTimeout` | You ran out of time | ጊዜዎ አልቋል |
| `result.rematch` | Rematch | ድጋሚ ተጫወት |
| `result.rematchWaiting` | Waiting for opponent... | ተቃዋሚ በመጠበቅ ላይ... |
| `result.home` | Home | መነሻ |

---

### S09 Profile

**Purpose:** show who you are and how you are doing.

**Layout**

1. Header: large avatar, username, tier badge, edit button.
2. Rating card with the current rating.
3. Stats row: wins, losses, draws, games played.
4. Recent matches list (optional in v1, can arrive in an update).

**Actions:** Edit name opens a sheet with the same input and rules as onboarding.

**States**

1. Default.
2. No online games yet: rating shows the starting rating, stats show zero, and an empty message explains how to get ranked.
3. Offline: shows saved data with a small offline marker, editing waits until online.
4. Loading: skeleton blocks.
5. Error: retry message.

**Copy**

| Key | English | Amharic (draft) |
| :--- | :--- | :--- |
| `profile.title` | Profile | መገለጫ |
| `profile.rating` | Rating | ደረጃ |
| `profile.wins` | Wins | ድሎች |
| `profile.losses` | Losses | ሽንፈቶች |
| `profile.draws` | Draws | አቻዎች |
| `profile.played` | Games played | የተጫወቱ ጨዋታዎች |
| `profile.editName` | Edit name | ስም ቀይር |
| `profile.recent` | Recent matches | የቅርብ ጊዜ ጨዋታዎች |
| `profile.empty` | No online matches yet. Play a friend to get a rating. | እስካሁን የመስመር ላይ ጨዋታ የለም። ደረጃ ለማግኘት ከጓደኛ ጋር ይጫወቱ። |
| `tier.bronze` | Bronze | ነሐስ |
| `tier.silver` | Silver | ብር |
| `tier.gold` | Gold | ወርቅ |
| `tier.master` | Master | ማስተር |

---

### S10 Leaderboard

**Purpose:** show the top players and where you stand.

**Layout**

1. Title.
2. List of the top 50: rank, avatar, username, tier badge, rating.
3. Your row highlighted. If you are outside the top 50, your row is pinned at the bottom.

**States**

1. Loading: skeleton rows.
2. Loaded: list.
3. Empty: no ranked players yet.
4. Offline or error: retry message, with the last cached list if there is one.

**Notes:** the server caches the list for 60 seconds, so pull to refresh does not need to hit the server more often than that.

**Copy**

| Key | English | Amharic (draft) |
| :--- | :--- | :--- |
| `board.title` | Leaderboard | የደረጃ ሰንጠረዥ |
| `board.yourRank` | Your rank: #{n} | የእርስዎ ደረጃ፦ #{n} |
| `board.empty` | No ranked players yet. | እስካሁን ደረጃ ያለው ተጫዋች የለም። |

---

### S11 Settings

**Purpose:** let players tune sound, language, and looks.

**Layout:** a grouped list.

| Group | Item | Control |
| :--- | :--- | :--- |
| Game | Rules | Choose a ruleset (one option in v1, more later) |
| Game | Show seed numbers | Switch, on by default |
| Game | Animation speed | Normal or Fast |
| Sound | Sound | Switch |
| Sound | Vibration | Switch |
| Look | Language | English or Amharic |
| Look | Appearance | System, Light, or Dark |
| Look | Board theme | Choose (one in v1) |
| Help | How to play | Opens S12 |
| About | Version and credits | Static text |

**States:** changes apply immediately and are saved on the device. Changing the language switches all text right away.

**Copy**

| Key | English | Amharic (draft) |
| :--- | :--- | :--- |
| `settings.title` | Settings | ቅንብሮች |
| `settings.rules` | Rules | ደንቦች |
| `settings.seedNumbers` | Show seed numbers | የዘር ቁጥር አሳይ |
| `settings.animSpeed` | Animation speed | የእንቅስቃሴ ፍጥነት |
| `settings.speedNormal` | Normal | መደበኛ |
| `settings.speedFast` | Fast | ፈጣን |
| `settings.sound` | Sound | ድምፅ |
| `settings.vibration` | Vibration | ንዝረት |
| `settings.language` | Language | ቋንቋ |
| `settings.appearance` | Appearance | ገጽታ |
| `settings.themeSystem` | System | እንደ ስልኩ |
| `settings.themeLight` | Light | ብሩህ |
| `settings.themeDark` | Dark | ጨለማ |
| `settings.boardTheme` | Board theme | የቦርድ ገጽታ |
| `settings.howToPlay` | How to play | እንዴት እንደሚጫወቱ |
| `settings.about` | About | ስለ ጨዋታው |
| `settings.version` | Version {v} | ስሪት {v} |

---

### S12 How to play

**Purpose:** teach the rules in under a minute.

**Layout:** a short, swipeable walkthrough of 5 cards, each with a small board illustration and 1 or 2 sentences. A final card has a "Play a practice game" button that opens the difficulty sheet.

**Cards** (text from `GAME_RULES.md`, section 15)

| Card | English | Amharic |
| :--- | :--- | :--- |
| 1. Goal | Collect more seeds in your store than your opponent. | To translate |
| 2. Your move | Tap one of your pits. Its seeds are dropped one by one, counterclockwise. | To translate |
| 3. Go again | If your last seed lands in your store, you play again. | To translate |
| 4. Capture | If your last seed lands in an empty pit on your side, you take it and all the seeds in the pit across from it. | To translate |
| 5. The end | When one side is empty, the game ends and the player with the most seeds in their store wins. | To translate |

**Copy**

| Key | English | Amharic (draft) |
| :--- | :--- | :--- |
| `how.title` | How to play | እንዴት እንደሚጫወቱ |
| `how.next` | Next | ቀጣይ |
| `how.practice` | Play a practice game | የልምምድ ጨዋታ ተጫወት |
| `how.skip` | Skip | ዝለል |

**Notes:** show it automatically once before the first game, and always reachable from Home and Settings.

---

### S13 Shared dialogs, banners, and toasts

#### Dialogs

| Dialog | When | Buttons |
| :--- | :--- | :--- |
| Resign | Menu then Resign during a game | Keep playing (safe, left), Resign (danger, right) |
| Leave game | Android back during a game | Stay (safe, left), Leave (danger, right). Online, leaving counts as resigning |
| Leave pass and play | Android back in local mode | Stay, Leave |

| Key | English | Amharic (draft) |
| :--- | :--- | :--- |
| `dialog.resignTitle` | Resign this game? | ጨዋታውን እጅ ይሰጣሉ? |
| `dialog.resignBody` | You will lose this game. | ይህን ጨዋታ ይሸነፋሉ። |
| `dialog.resignKeep` | Keep playing | መጫወት ቀጥል |
| `dialog.resignConfirm` | Resign | እጅ ስጥ |
| `dialog.leaveTitle` | Leave this game? | ከጨዋታው ይወጣሉ? |
| `dialog.leaveBodyOnline` | Leaving counts as a resignation. | መውጣት እጅ እንደመስጠት ይቆጠራል። |
| `dialog.leaveBodyLocal` | Your game will not be saved. | ጨዋታዎ አይቀመጥም። |
| `dialog.stay` | Stay | ቆይ |

#### Banners (slim bar at the top)

| Banner | Color | Text key |
| :--- | :--- | :--- |
| Reconnecting | `warning` | `game.reconnecting` |
| Back online | `success`, shown for 2 seconds | `banner.online` |
| Offline | `warning` | `banner.offline` |

| Key | English | Amharic (draft) |
| :--- | :--- | :--- |
| `banner.online` | Back online | እንደገና ተገናኝተዋል |
| `banner.offline` | No internet connection | የበይነመረብ ግንኙነት የለም |

#### Toasts

Short, bottom of the screen above the safe area, 3 seconds, one at a time. Used for "Copied", "Name saved", and similar confirmations. Never used for errors the player must act on.

| Key | English | Amharic (draft) |
| :--- | :--- | :--- |
| `toast.nameSaved` | Name saved | ስም ተቀምጧል |
| `toast.settingsSaved` | Settings saved | ቅንብሮች ተቀምጠዋል |

## 5. State checklist for every screen

Before a screen is called done, confirm it has all of these (or a note saying why one does not apply):

1. Default state
2. Loading state
3. Empty state
4. Error state with a way to recover
5. Offline behavior
6. Light and dark themes
7. English and Amharic text, with room for longer text
8. Large system font sizes
9. Screen reader labels
10. Tested on a low end Android phone

## 6. Error messages

These map to the server error codes in `TECHNICAL_GUIDE.md`. Show messages inline next to the thing that failed whenever possible.

| Situation | Code | English | Amharic (draft) |
| :--- | :--- | :--- | :--- |
| Wrong or expired room code | `ROOM_NOT_FOUND` | We could not find that room. Check the code and try again. | ክፍሉን ማግኘት አልተቻለም። ኮዱን አረጋግጠው እንደገና ይሞክሩ። |
| Room already has two players | `ROOM_FULL` | That room already has two players. | ይህ ክፍል ሁለት ተጫዋቾች አሉት። |
| Move out of turn | `NOT_YOUR_TURN` | Not shown to the player. The app resyncs quietly | Not shown |
| Illegal move | `ILLEGAL_MOVE` | Not shown to the player. The app resyncs quietly | Not shown |
| Move out of order | `STALE_SEQ` | Not shown to the player. The app resyncs quietly | Not shown |
| Bad request | `INVALID_PAYLOAD` | Something went wrong. Please try again. | የሆነ ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ። |
| Too many requests | `RATE_LIMITED` | Slow down a little and try again. | ትንሽ ዝግ ይበሉና እንደገና ይሞክሩ። |
| Session problem | `UNAUTHORIZED` | Please open the app again to sign in. | እባክዎ መተግበሪያውን እንደገና ከፍተው ይግቡ። |
| No internet | none | No internet connection. You can still play against the computer. | የበይነመረብ ግንኙነት የለም። ከኮምፒውተር ጋር መጫወት ይችላሉ። |
| Server unreachable | none | We cannot reach the game server. Try again in a moment. | የጨዋታ አገልጋዩን ማግኘት አልተቻለም። ከትንሽ ቆይታ በኋላ ይሞክሩ። |

## 7. Open questions & decisions

| # | Question | Decision / Needed by |
| :--- | :--- | :--- |
| 1 | Are usernames unique? | **Resolved**: Non-unique display names tied to unique `device_id` and UUID. |
| 2 | Is Ranked a separate mode in v1.1, or are all online matches rated? | **Resolved**: All completed online friend matches update Elo ratings in v1. Matchmaking queue is the locked "Ranked" mode for v1.1. |
| 3 | Does the first launch show How to play automatically, or only offer it? | Automatically offer on first launch after onboarding; always accessible via Home & Settings. (Phase 3) |
| 4 | Is there an in-app rematch flow for pass and play, or always a fresh game? | In-app rematch supported on Result screen; loser moves first in next game. (Phase 2) |
| 5 | Do match history and replays ship in v1 or later? | Move logs are saved in DB in v1; replay screen UI ships in v1.1. (Phase 7) |
| 6 | Who translates and reviews the Amharic strings? | Native speaker review before closed testing. (Before Phase 4 / Phase 6) |

## 8. Change log

| Version | Date | Change |
| :--- | :--- | :--- |
| 0.1 | 29 Oct 2026 | First draft of all screens, states, and copy |