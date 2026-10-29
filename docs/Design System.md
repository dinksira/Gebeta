# Gebeta Online: Design System

This is the visual and interaction rulebook for the app. It keeps every screen consistent, keeps design and code speaking the same language (token names match in Figma and in code), and keeps the app light enough for cheap Android phones.

Related files: `TECHNICAL_GUIDE.md`, `CODING_STANDARDS.md`, `PHASE_PLAN.md`.

## 1. Design direction

**One line:** a warm, tactile wooden board game that feels like it belongs in Ethiopia, not a generic mobile game.

### Principles

1. **The board is the hero.** Everything else stays quiet so the pits, seeds, and sowing animation get the attention.
2. **Tactile, not flashy.** Wood, stone, soft shadows, small bounces. No neon, no glossy casino effects.
3. **Readable in one second.** Whose turn, how many seeds, what just happened. Never make the player hunt for it.
4. **Fast and light.** Simple shapes, few images, short animations. Must run smoothly on a low end phone.
5. **Respect the culture, do not decorate it to death.** Ethiopian patterns appear in small, deliberate places, not everywhere.
6. **Works in Amharic and English from day one.** Layouts are built for both.

### Mood words

Warm, handmade, calm, confident, friendly, a little playful.

## 2. Color

All colors are tokens. Never use a raw hex value in a component.

### 2.1 Brand and board palette

| Token | Hex | Use |
| :--- | :--- | :--- |
| `woodDark` | `#3B2417` | Board frame, deep shadows |
| `woodMid` | `#6B4228` | Board surface |
| `woodLight` | `#A06A3C` | Board highlights, rim light |
| `woodGlow` | `#C98F56` | Selected pit glow, accents on wood |
| `pitDeep` | `#2A180F` | Inside of carved pits |
| `pitInner` | `#4A2C1A` | Pit gradient end |
| `saffron` | `#E3A21A` | Primary brand color, main buttons, highlights |
| `saffronPressed` | `#C48712` | Pressed state for primary |
| `forest` | `#2F6B4F` | Secondary brand, success, player one |
| `terracotta` | `#B8442F` | Danger, opponent, player two |

### 2.2 Neutrals (light theme)

| Token | Hex | Use |
| :--- | :--- | :--- |
| `bg` | `#F7EFE3` | App background (parchment) |
| `surface` | `#FFFFFF` | Cards, sheets |
| `surfaceAlt` | `#EFE3D0` | Secondary surfaces, inputs |
| `border` | `#D9C8AE` | Dividers, outlines |
| `textPrimary` | `#2A1B12` | Main text |
| `textSecondary` | `#6E5A4B` | Supporting text |
| `textOnWood` | `#F7EFE3` | Text placed on the board |
| `textOnBrand` | `#2A1B12` | Text on saffron (dark text, not white) |

### 2.3 Neutrals (dark theme)

| Token | Hex | Use |
| :--- | :--- | :--- |
| `bg` | `#1C120C` | App background |
| `surface` | `#2A1B12` | Cards, sheets |
| `surfaceAlt` | `#36241A` | Secondary surfaces, inputs |
| `border` | `#4A3426` | Dividers, outlines |
| `textPrimary` | `#F3E7D6` | Main text |
| `textSecondary` | `#B9A692` | Supporting text |

The board itself looks the same in both themes. Only the app chrome around it changes.

### 2.4 Status colors

| Token | Hex | Use |
| :--- | :--- | :--- |
| `success` | `#2F6B4F` | Win, connected, confirmed |
| `warning` | `#D98A0B` | Low timer, weak connection |
| `danger` | `#B8442F` | Loss, errors, resign, timer critical |
| `info` | `#3E6E8E` | Neutral notices |

### 2.5 Seeds

Seeds look like river stones or smooth beads. Each seed gets a color from this set, picked by its index so it stays stable between renders and never flickers.

| Token | Hex |
| :--- | :--- |
| `seedIvory` | `#EADBC0` |
| `seedSand` | `#D2B48C` |
| `seedClay` | `#B5573A` |
| `seedOlive` | `#7A7A3A` |
| `seedSlate` | `#5E6B6B` |

Seeds have a tiny highlight at the top left and a soft shadow below. That is the whole effect.

### 2.6 Player identity

Never use color alone to tell players apart.

1. **You** are always at the bottom of the screen, with a forest green marker and the label "You".
2. **Opponent** is always at the top, with a terracotta marker and their username.
3. The side whose turn it is gets a glow, an arrow marker, and a text label ("Your turn"). That is three signals, so color blindness is never an issue.

### 2.7 Contrast rules

1. Body text needs at least 4.5 to 1 against its background. Large text needs at least 3 to 1.
2. Primary buttons use dark text on saffron. White on saffron fails contrast.
3. Verify every new color pair with a contrast checker before it joins the system.

## 3. Typography

### 3.1 Font choices

| Role | Latin | Amharic (Ethiopic script) |
| :--- | :--- | :--- |
| UI and body | Inter | Noto Sans Ethiopic |
| Display (titles, scores) | Inter, bold weights | Noto Sans Ethiopic, bold |

Notes:

1. Bundle only the weights you use (regular, semibold, bold). Fonts add to APK size.
2. Fidel characters are visually heavier and need more vertical room, so Amharic line heights run about 10 to 15 percent taller than Latin.
3. Always set a fallback stack so a missing glyph never shows an empty box.
4. Use tabular numerals for scores and timers so digits do not jump around as they change.

### 3.2 Type scale

| Token | Size | Line height (Latin / Amharic) | Weight | Use |
| :--- | :--- | :--- | :--- | :--- |
| `display` | 36 | 42 / 48 | Bold | Result screen, big moments |
| `title` | 24 | 30 / 34 | Bold | Screen titles |
| `heading` | 20 | 26 / 30 | Semibold | Section titles |
| `bodyLarge` | 17 | 24 / 28 | Regular | Important body text |
| `body` | 15 | 22 / 26 | Regular | Default text |
| `caption` | 13 | 18 / 22 | Regular | Hints, labels |
| `score` | 32 | 36 / 36 | Bold, tabular | Store counts, ratings |
| `seedCount` | 14 | 16 / 16 | Semibold, tabular | Count badge on pits |

Rules:

1. Never go below 13 for text a player must read.
2. Respect the system font size setting, but cap the scaling on the board screen (about 130 percent) so the layout does not break.
3. Maximum two weights per screen.
4. Left align text. Center only short labels and titles.

## 4. Spacing, sizing, and shape

### 4.1 Spacing scale (4 point base)

| Token | Value |
| :--- | :--- |
| `space1` | 4 |
| `space2` | 8 |
| `space3` | 12 |
| `space4` | 16 |
| `space5` | 20 |
| `space6` | 24 |
| `space8` | 32 |
| `space12` | 48 |
| `space16` | 64 |

Screen side padding is `space4` (16). Space between sections is `space6` or `space8`.

### 4.2 Radius

| Token | Value | Use |
| :--- | :--- | :--- |
| `radiusSm` | 8 | Chips, small tags |
| `radiusMd` | 12 | Buttons, inputs, cards |
| `radiusLg` | 20 | Sheets, big cards, board frame |
| `radiusFull` | 999 | Pits, avatars, pills |

### 4.3 Elevation

| Token | Use | Look |
| :--- | :--- | :--- |
| `elev0` | Flat | No shadow |
| `elev1` | Cards | Soft, small, low opacity |
| `elev2` | Sheets, menus | Medium blur |
| `elev3` | Modals | Larger blur |
| `boardInset` | Carved pits | Inner shadow on the top edge, light rim on the bottom edge |

Keep shadows cheap. On Android, use native elevation where possible rather than stacking many blurred layers.

### 4.4 Touch targets

1. Minimum 48 by 48 for anything tappable.
2. Pits are far bigger than that by design.
3. At least 8 of space between tappable items that sit close together.

### 4.5 Icons

1. One outline icon set at 24 px with a 2 px stroke (for example Lucide).
2. Custom icons for the seed, the board, and the tier badges.
3. Icons always come with a text label in menus, and use a tooltip or accessibility label elsewhere.

## 5. Board anatomy

The board is the most important component, so it gets its own rules.

### 5.1 Layout

```
        Opponent name, rating, timer
   +------------------------------------+
   | [S]  ( )  ( )  ( )  ( )  ( )  ( )  [S] |
   |      ( )  ( )  ( )  ( )  ( )  ( )      |
   +------------------------------------+
        You, rating, timer
```

Simplified view:

1. Opponent pits are the top row, your pits are the bottom row, so your thumb reaches your side.
2. Stores sit at the left and right ends as tall rounded shapes.
3. In online games the board flips for the second seat so **you are always at the bottom**. The engine indexes never change, the UI maps them.
4. Portrait only for v1.

### 5.2 Sizes

All sizes derive from the screen width so the board fits any phone.

```
boardWidth  = screenWidth minus (2 times space4)
storeWidth  = boardWidth times 0.14
pitSize     = (boardWidth minus (2 times storeWidth) minus padding) divided by 6
seedSize    = pitSize times 0.22
```

### 5.3 Pit states

| State | Look |
| :--- | :--- |
| Idle | Carved dark pit, seeds inside, count badge |
| Legal (your turn) | Soft `woodGlow` ring, gentle pulse |
| Pressed | Scale to 0.96, ring brightens |
| Selected and sowing | Seeds lift out, pit dims briefly |
| Last seed landed | Quick light flash |
| Capture target | Warm red tint and a small shake before the capture |
| Disabled (not your turn) | No glow, taps ignored, no error sound |

### 5.4 Seeds

1. Up to 12 seeds in a pit are drawn individually, laid out in a stable pattern (not random on every render).
2. More than 12 seeds draw as a packed cluster, and the count badge carries the exact number.
3. The count badge is on by default and can be turned off in Settings for players who like a cleaner look.
4. Seeds in flight draw above everything else and cast a small shadow.

### 5.5 Stores

1. Larger carved slot with a bigger count in the `score` style.
2. Counter animates with a quick roll up when seeds arrive.
3. A subtle pulse when the last seed lands in your store, to signal an extra turn.

### 5.6 Turn and timer

1. A turn indicator sits beside the player name: arrow marker plus a text label.
2. The move timer is a slim bar under the player name that shrinks across 30 seconds.
3. Timer colors: `success` above 10 seconds, `warning` from 10 to 5 seconds, `danger` below 5 seconds with a light haptic tick each second.
4. Timers come from the server `deadlineAt` so both players see the same countdown.

## 6. Motion

Motion explains what happened. It never exists only to decorate.

### 6.1 Duration tokens

| Token | Value | Use |
| :--- | :--- | :--- |
| `motionFast` | 120 ms | Press feedback, small fades |
| `motionBase` | 220 ms | Most transitions |
| `motionSlow` | 360 ms | Sheets, result screen |
| `sowStep` | 200 ms | One seed drop during sowing |
| `sowStepFast` | 120 ms | Sowing with the fast animation setting |
| `captureEffect` | 450 ms | Capture flourish |

### 6.2 Sowing sequence

1. Lift: all seeds leave the pit together and hover for about 150 ms.
2. Drop: seeds fall one at a time into each slot, each with a small bounce and a click sound and haptic.
3. Land: the final pit flashes lightly.
4. Resolve: if there is a capture, play the capture effect. If the last seed hit your store, play the extra turn pulse.
5. Hand over: switch the turn indicator, unless it is an extra turn.

The sequence comes from the engine's `steps` list. Do not recompute it in the UI.

### 6.3 Rules

1. Animate only position, scale, and opacity. They are cheap on the UI thread.
2. Use spring or ease out curves. Avoid linear motion for anything that moves a seed.
3. Block new taps while the board is animating. Queue incoming server updates.
4. Respect the system reduce motion setting: replace movement with short fades and show the result immediately.
5. Never animate more than the board needs to. Menus and screens use `motionBase` fades and small slides.

## 7. Components

Each component has a token driven style and defined states. States for every interactive component: default, pressed, disabled, and loading where it applies.

### 7.1 Buttons

| Variant | Look | Use |
| :--- | :--- | :--- |
| Primary | `saffron` fill, `textOnBrand` text, height 52 | One main action per screen |
| Secondary | Transparent, 2 px `woodMid` outline, height 48 | Supporting actions |
| Tertiary | Text only, `forest` color | Low emphasis |
| Danger | `terracotta` fill, light text | Resign, delete |
| Icon button | 48 by 48 round, icon only | Settings, back, share |

States: pressed scales to 0.97 and darkens, disabled drops to 40 percent opacity, loading replaces the label with a small spinner and keeps the button width the same.

Rules: one primary button per screen, buttons are full width on phones unless paired, labels are short verbs ("Play", "Create room", "Rematch").

### 7.2 Cards and list rows

1. `surface` background, `radiusMd`, `elev1`, `space4` padding.
2. List rows are at least 56 tall.
3. Leaderboard row: rank, avatar, username, tier badge, rating. The current player's row is highlighted with a `saffron` edge.

### 7.3 Inputs

1. Height 52, `surfaceAlt` fill, 1 px `border`, `radiusMd`.
2. Focus state: 2 px `saffron` border.
3. Error state: `danger` border plus a clear message under the field.
4. **Room code input:** 5 separate boxes, large type, auto advance, paste support, uppercase only, uses the same safe alphabet as the server.
5. **Username input:** live length counter, clear rules shown before the player types.

### 7.4 Room code display

1. Large letters with wide spacing in the `score` style, inside a `surfaceAlt` card.
2. Two actions beside it: Copy and Share (Telegram, WhatsApp, system share sheet).
3. Show a "Waiting for opponent" state with a calm looping animation.

### 7.5 Avatars

1. Circle with the player's first letter on a color picked from the username, so it is stable.
2. A thin ring in the tier color.
3. Sizes: 32 (lists), 48 (profile row), 72 (profile header).

### 7.6 Tier badges

Proposed tiers (tune after real data):

| Tier | Rating | Color |
| :--- | :--- | :--- |
| Bronze | under 1100 | `#A9713C` |
| Silver | 1100 to 1299 | `#B8C0C8` |
| Gold | 1300 to 1499 | `#E3A21A` |
| Master | 1500 and above | `#2F6B4F` |

Badges are a small shield or ring shape with the tier name in text, never color only.

### 7.7 Bottom sheets and dialogs

1. Sheets: `radiusLg` top corners, drag handle, `elev2`, used for settings choices and room actions.
2. Dialogs: only for confirmations that matter (resign, leave match). Two buttons, the safe choice on the left, the risky choice styled as Danger.
3. Dim background at about 50 percent.

### 7.8 Toasts and banners

1. Toasts: short, bottom of screen above the safe area, auto dismiss after 3 seconds, one at a time.
2. Connection banner: slim bar at the top ("Reconnecting...") in `warning`, turns `success` briefly when restored.
3. Never use toasts for errors the player must act on. Use inline messages or dialogs.

### 7.9 Empty, loading, and error states

1. Loading: skeleton blocks for lists, a spinner only for short actions.
2. Empty: a small illustration, one sentence, one action.
3. Error: plain language, what happened, what to do next, a retry button.

## 8. Screen guidelines

| Screen | Key layout rules |
| :--- | :--- |
| Onboarding | One question only (username), big input, one primary button, no signup wall |
| Home | Large "Play vs AI" and "Play a friend" cards, Ranked card shown but locked until it is ready, profile and settings in the top bar |
| Game | Board centered, opponent info at top, your info at bottom, resign and settings tucked in a menu so they cannot be hit by accident |
| Create or Join Room | Create is a single tap, Join is a code input plus a button, share options after creating |
| Result | Big `display` headline (win, loss, draw), final score, rating change with a small animation, Rematch as the primary button, Home as tertiary |
| Profile | Avatar, username, tier badge, rating, win and loss stats, recent matches |
| Leaderboard | Top 50 list, own rank pinned at the bottom if outside the top list |
| Settings | Grouped list: Sound, Haptics, Language, Animation speed, Show seed counts, Board theme, How to play, About |

Rules for all screens:

1. One clear primary action.
2. Reachable by thumb: key actions in the lower half of the screen.
3. Respect safe areas (notch, gesture bar).
4. Text and layout must survive both languages and larger font sizes.

## 9. Sound and haptics

Sound is half the feel of this game.

### 9.1 Sound set

| Event | Character |
| :--- | :--- |
| Seed drop | Short dry wood or stone click, 3 pitch variants picked in rotation so it never sounds robotic |
| Store drop | Deeper tock with a faint warm chime |
| Capture | Low thud plus a short sweep |
| Extra turn | Quick rising two note |
| Win | Warm, short, uplifting phrase |
| Loss | Soft and gentle, never harsh or mocking |
| Timer tick | Quiet tick for the last 5 seconds |
| Button tap | Very soft tick, optional |

Rules: each file under about 50 KB, preload everything at app start, mix levels so no sound is louder than the win phrase, allow a master mute and respect the device silent mode.

### 9.2 Haptics

| Event | Haptic |
| :--- | :--- |
| Seed drop | Light tap |
| Capture | Medium tap |
| Extra turn | Double light tap |
| Win | Success pattern |
| Timer last 5 seconds | Light tick each second |
| Error or timeout | Warning pattern |

Haptics are off by default on devices that report weak motors, and always user switchable.

## 10. Cultural touches

Use sparingly. They should feel like a signature, not a costume.

1. **Board frame:** a thin carved border pattern inspired by traditional Ethiopian weaving or cross motifs, kept subtle and low contrast.
2. **Splash and home header:** one small decorative band using the same pattern.
3. **Result screen:** a small flourish for wins using the pattern, not confetti.
4. **Language:** Amharic is a first class language. Never ship a screen with missing Amharic strings.
5. **Check with people.** Show pattern and color choices to Ethiopian players and designers before locking them, so nothing reads as a cliché or accidentally off.

## 11. Accessibility

1. Contrast targets from section 2.7 apply to every screen.
2. Every tappable element is at least 48 by 48.
3. Screen reader labels describe the situation, for example "Pit 3, 5 seeds, your side, tap to play", and the app announces moves ("Opponent played pit 4, captured 3 seeds").
4. Color is never the only signal. Turn, player, and tier all have text or shape signals too.
5. Reduce motion and sound and haptic toggles are supported and respected.
6. Text scales with the system setting, with a sensible cap on the board screen.
7. No time pressure beyond the move timer, and a longer timer option can come in a later version.

## 12. Localization

1. All text goes through the translation function. No text baked into images.
2. Design with 30 percent extra room for longer translations.
3. Use Arabic digits (0 to 9) in both English and Amharic UI for scores, ratings, and timers.
4. Keep strings short. Short verbs for buttons, one sentence for messages.
5. Test every screen in Amharic and English before approving it.
6. Do not rely on punctuation or word order jokes that only work in one language.

## 13. Performance rules for design

Design choices affect speed, so these are part of the system.

1. Prefer vector shapes and gradients over large images.
2. If a wood texture is used, keep it a small tileable image under about 60 KB.
3. Limit blurred shadows and overlapping transparent layers on the board.
4. Limit the number of seeds drawn individually (see section 5.4).
5. Reuse sprites and assets. Do not create new objects during an animation.
6. Test every new visual effect on the weakest phone you own.

## 14. Tokens in code

The same names live in Figma variables and in `app/src/theme/`.

```ts
// app/src/theme/tokens.ts

export const palette = {
  woodDark: '#3B2417',
  woodMid: '#6B4228',
  woodLight: '#A06A3C',
  woodGlow: '#C98F56',
  pitDeep: '#2A180F',
  pitInner: '#4A2C1A',
  saffron: '#E3A21A',
  saffronPressed: '#C48712',
  forest: '#2F6B4F',
  terracotta: '#B8442F',
} as const;

export const lightTheme = {
  bg: '#F7EFE3',
  surface: '#FFFFFF',
  surfaceAlt: '#EFE3D0',
  border: '#D9C8AE',
  textPrimary: '#2A1B12',
  textSecondary: '#6E5A4B',
  textOnWood: '#F7EFE3',
  textOnBrand: '#2A1B12',
} as const;

export const darkTheme = {
  bg: '#1C120C',
  surface: '#2A1B12',
  surfaceAlt: '#36241A',
  border: '#4A3426',
  textPrimary: '#F3E7D6',
  textSecondary: '#B9A692',
  textOnWood: '#F7EFE3',
  textOnBrand: '#2A1B12',
} as const;

export const seedColors = ['#EADBC0', '#D2B48C', '#B5573A', '#7A7A3A', '#5E6B6B'] as const;

export const space = { s1: 4, s2: 8, s3: 12, s4: 16, s5: 20, s6: 24, s8: 32, s12: 48, s16: 64 } as const;

export const radius = { sm: 8, md: 12, lg: 20, full: 999 } as const;

export const motion = {
  fast: 120,
  base: 220,
  slow: 360,
  sowStep: 200,
  sowStepFast: 120,
  captureEffect: 450,
} as const;

export const typeScale = {
  display: { size: 36, lineHeight: 42, weight: '700' },
  title: { size: 24, lineHeight: 30, weight: '700' },
  heading: { size: 20, lineHeight: 26, weight: '600' },
  bodyLarge: { size: 17, lineHeight: 24, weight: '400' },
  body: { size: 15, lineHeight: 22, weight: '400' },
  caption: { size: 13, lineHeight: 18, weight: '400' },
  score: { size: 32, lineHeight: 36, weight: '700' },
  seedCount: { size: 14, lineHeight: 16, weight: '600' },
} as const;
```

Usage rules:

1. Components read colors through a `useTheme()` hook so light and dark switch automatically.
2. No raw hex, no raw pixel numbers for spacing, radius, or type in components. Import tokens.
3. Amharic line heights are applied by the text component based on the active language, not by each screen.

## 15. Figma setup

1. Pages: Foundations, Components, Screens, Prototypes, Archive.
2. Figma variables mirror the tokens in this file, with matching names and both light and dark modes.
3. Every component has variants for state (default, pressed, disabled, loading) and for language (English, Amharic).
4. Use auto layout everywhere so text length changes do not break designs.
5. Name layers like code: `Button/Primary/Default`, `Board/Pit/Legal`.
6. Design every screen in English and Amharic, on a small phone (360 wide) and a larger one (412 wide).
7. Keep a flow prototype for the full game loop so animation timing can be reviewed before it is built.

## 16. Do and do not

| Do | Do not |
| :--- | :--- |
| Let the board dominate every game screen | Crowd the board with extra buttons and banners |
| Use tokens for every color, space, and type size | Paste raw hex values or magic numbers |
| Show turn with text, shape, and glow | Rely on color alone |
| Keep one primary action per screen | Put two saffron buttons side by side |
| Test in Amharic and on a cheap phone | Approve a screen after seeing only English on a flagship |
| Keep motion short and meaningful | Add effects just because they look cool |
| Keep dialogs for decisions that matter | Interrupt play with pop ups |

## 17. Changing the system

1. A new token or component needs a real use in at least two places, or a clear need on one important screen.
2. Add it to this document first, then to Figma, then to code.
3. Check it in light and dark mode, both languages, and on a low end phone.
4. Remove tokens that are no longer used. A small system is easier to keep consistent.

## 18. Review checklist for every new screen

* [ ] Uses only tokens (color, space, type, radius, motion)
* [ ] One clear primary action
* [ ] Works in light and dark theme
* [ ] Works in English and Amharic, with room for longer text
* [ ] All tap targets are at least 48 by 48
* [ ] Contrast checked, color never the only signal
* [ ] Loading, empty, and error states designed
* [ ] Reduce motion and screen reader behavior considered
* [ ] Tested on a low end Android phone