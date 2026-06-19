# BradyYourTutor — Play to Get Smarter · MVP Spec (`spec.md`)

> **App name:** **BradyYourTutor — Play to Get Smarter** (confirmed) — a *Magnet Games Production*
> **Game mode (MVP):** *Last One Standing* (the single mode at launch)
> **Status:** MVP / pitch demo (single game mode)
> **Owner:** Edgar Pineda (solo build, with Claude Code)
> **Last updated:** 2026-06-17
> **Purpose of this doc:** the single source of truth for the build. If a decision isn't written here, it's an open question — see §20. Names marked *(working title / placeholder)* are not final.

---

## 0. TL;DR (read this first)

**BradyYourTutor — Play to Get Smarter** is a **mobile-first trivia game** that recreates the format and feel of a **BradyYourTutor** YouTube episode: **5 players** (1 real human + 4 bots) line up against a **white background**, an **animated Brady** hosts and asks questions, and players are **eliminated round by round** until **one winner** remains. The app name doubles as the tagline — the hook is that it's *fun* and you *get smarter* playing it.

- **One game mode at launch:** *Last One Standing* — a 4-round elimination gauntlet (General Trivia → Flags & Geography → Numeric Estimate → Name-As-Many list battle).
- **Looks like multiplayer, is actually single-player vs. bots.** No real backend for the MVP — everything runs **on-device**. Bots have names, avatars, and believable answer timing so it reads as a live lobby.
- **Platform:** built in **Expo (React Native + TypeScript)**, shipped as **one codebase** that runs on **iOS, Android, and Web**. The **web build (deployed to Vercel)** is the **primary demo link** Brady taps — no install required.
- **Branded as Brady:** his vibe, his colors, an animated Brady host, his catchphrases on correct/wrong reveals. Co-branded "Magnet Games Production."
- **Definition of done:** Brady can open a link on his phone, create an avatar, play a full ~6–10 minute *Last One Standing* episode against 4 bots, win or lose, earn XP/badges, see a global leaderboard, and feel "this is my channel as a game." See §19.

---

## 1. Vision & Goals

### 1.1 Why this exists
A working prototype to pitch a **co-owned partnership** with Brady (BradyYourTutor — 3M+ YouTube, 5M+ TikTok). The demo must make Brady feel that someone has captured his format faithfully and that fans would play it. Secondary goal: the app is a **growth engine for his channels** — every session nudges players toward subscribing and sharing.

### 1.2 Success criteria for the pitch
The demo succeeds if Brady (or his team) reacts with some version of *"this feels like my show, and my audience would play this."* Concretely:
1. The **format is unmistakably his** (5-player lineup, white stage, elimination, his question styles).
2. It is **fun in the first 60 seconds** and a full episode is **short** (target 6–10 min).
3. It is **frictionless to try** (tap a link, no install, no signup).
4. It **points back to his channels** (subscribe + share hooks).
5. It is **visibly extensible** — Brady can see how more modes, real multiplayer, and monetization plug in later.

### 1.3 Non-goals for the MVP
Real multiplayer, accounts/auth, real backend, monetization, multiple game modes, anti-cheat, content moderation, and ranked/skill-based matchmaking are **explicitly out of scope** (see §17). They are addressed conceptually in the pitch, not built.

---

## 2. Target Users

- **Primary (pitch audience):** Brady and his team — evaluating fidelity, fun, and potential.
- **Eventual end users:** Brady's fanbase — mostly teens/college-age, mobile-native, competitive, short-session players who already watch the format and want to *be a contestant*.
- **Design implication:** instantly legible, thumb-friendly, fast, loud, celebratory. No tutorials longer than one screen. Optimize for the "one more game" loop and the shareable result.

---

## 3. Brand & Visual Identity

### 3.1 Direction
**"YouTube-thumbnail energy."** Bold, high-saturation, high-contrast, playful, a little loud — the visual language of his thumbnails and on-screen graphics. **Light mode** (white stage is core to the format). Big rounded typography, chunky buttons, punchy state changes, confetti, expressive Brady reactions.

### 3.2 Concrete brand tokens (initial, tune against real Brady assets later)
- **Stage background:** clean white (`#FFFFFF`) — the lineup stage, like his videos.
- **Primary / accent:** a bold energetic pair (e.g., electric blue + sunny yellow, or his actual brand colors once we have them). Define as design tokens so they swap in one place.
- **Correct:** green (`#2BD576`-ish). **Incorrect:** red (`#FF4D4D`-ish). **Pending/locked:** neutral gray.
- **Type:** a rounded, friendly, heavy display face for headers (e.g., a Poppins/Nunito-weight feel) + a clean readable body face. Big numbers for timers/scores.
- **Motion:** snappy spring animations, countdown pulse, avatar "step forward" when answering, confetti on win.

> **Asset rule:** all brand colors, fonts, the Brady host art, and the logo lockup live behind a small **theme/asset config** so they can be replaced wholesale when we get Brady's real brand kit. Don't hardcode brand values in components.

### 3.3 Co-branding
A subtle **"A Magnet Games Production"** lockup on the splash/home/credits, alongside BradyYourTutor branding — reflecting the intended co-ownership split.

---

## 4. The Game — *Last One Standing* (core mode)

This is the heart of the app and must be airtight. There is **one mode** in the MVP.

### 4.1 Episode shape
| Round | Players in | Format | Input | Per-Q timer | Outcome |
|------|-----------|--------|-------|-------------|---------|
| **1 — General Trivia** | 5 | Multiple choice (4 options) | Tap fastest correct | **15s** | 4 advance, **1 eliminated** |
| **2 — Flags & Geography** | 4 | Multiple choice (4 options) | Tap fastest correct | **15s** | 3 advance, **1 eliminated** |
| **3 — Numeric Estimate** | 3 | Type a number | Type | **10s** | 2 advance, **1 eliminated** |
| **Final — Name As Many** | 2 | Type a running list | Type | **20s** | **1 winner** |

A full episode is **4 rounds**, ~**6–10 minutes**, ending with exactly **one champion**.

### 4.2 The unified elimination rule (applies to Rounds 1–3)
Each round runs a sequence of questions over a **pool** of remaining players:

1. A question is shown to **all players still in the pool** simultaneously.
2. Each player **submits exactly one answer** (tap for R1/R2, typed value for R3). Submission **locks** their answer for that question. A player who runs out of time is recorded as **no submission / timeout**.
3. After **all players have submitted or the timer expires**, results are revealed (see §4.6 reveal rules).
4. A **single "winner" of the question** is determined:
   - **R1 & R2 (fastest-correct):** the player with the **earliest correct submission** (by millisecond timestamp). Wrong answers do **not** eliminate a player. If **no one** answered correctly, **no winner** this question.
   - **R3 (closest):** the player whose number has the **smallest absolute distance** to the correct value. Timeouts count as **worst possible** (cannot win). If **all** timed out, **no winner** this question.
5. The **question winner ADVANCES** to the next round and is **removed from the current pool** (they then **spectate** until their next round begins).
6. If there was **no winner**, the pool is unchanged; pull the **next question** and repeat.
7. The round ends when **only one player remains in the pool**. **That last player is eliminated** (regardless of how they would have answered — they are out by being last).

**Consequences (by design):**
- R1: 5 players → advance one at a time → when 1 remains, they're out → **4 advance, 1 eliminated.**
- R2: 4 → **3 advance, 1 eliminated.**
- R3: 3 → **2 advance, 1 eliminated.** (R3 determines 2 winners across (at least) 2 questions, then the last remaining is out.)
- Final: the **2 survivors** play the list battle → **1 winner, 1 runner-up.**

### 4.3 Round 1 — General Trivia
- **Source:** `Round 1 - Trivia` sheet (50 questions). Categories present: Geography, Science, History, Music, Math, Animals, Sports, Pop Culture.
- **Format:** question + **4 options (A–D)**, one correct.
- **Timer:** 15s. **Win = fastest correct.**
- **Selection:** randomized order; difficulty can ramp (Easy→Hard) within the round using the `Difficulty` column (nice-to-have, not required for MVP).

### 4.4 Round 2 — Flags & Geography
- **Source:** `Round 2 - Flags+Geo` sheet (50 questions). Four sub-types:
  - **Zoomed Flag** (13) — a tightly cropped region of a flag; identify the country.
  - **Greyed Flag** (12) — a desaturated flag; identify the country.
  - **Country Outline** (13) — a country silhouette; identify it.
  - **Geography Q** (12) — a standard MC geography question (no image).
- **Format:** **4 options (A–D)**, one correct. **Timer 15s. Win = fastest correct.**
- **Visual assets:** the `Asset Needed` column describes the image. **We derive these programmatically wherever possible** (see §8.4) rather than hand-drawing 38 images:
  - Greyed flag = clean flag asset + grayscale filter.
  - Zoomed flag = clean flag asset + crop/scale to the described region.
  - Country outline = silhouette from a world-map SVG / outline dataset.

### 4.5 Round 3 — Numeric Estimate
- **Source:** `Round 3 - Numeric` sheet (50 questions). Categories: Population, Year, Count, Elevation, Distance, Area, Speed, Temperature. Each row has `Correct Answer`, `Unit`, and `Notes`.
- **Format:** prompt + **numeric text input**. **Timer 10s. Win = closest (smallest absolute distance).**
- **Run:** within one episode, R3 runs as a mini-elimination of 3 players: first question's closest advances, the remaining 2 play a second question, that closest advances, last one is out. No strict tolerance — pure `|guess − answer|` comparison. Show the correct value + each player's guess + their distance on reveal.
- **Input rules:** digits only; strip commas/spaces; reject empty as timeout; allow a reasonable max length. Display the **unit** next to the field (e.g., "people", "m", "year").

### 4.6 Final Round — Name As Many
- **Source:** `Final Round - List` sheet (50 prompts). Each row: `Prompt`, `Time (s)` (20), `Acceptable Answers` (semicolon-separated), `Total Possible`, `Notes`.
- **Format:** both finalists get the **same prompt** and **20 seconds** to type as many valid answers as they can, building a **running list** (enter one → it's added → keep going).
- **Scoring:** count **unique, valid** entries. Validate **case-insensitively** against `Acceptable Answers`. For **open-ended** prompts (e.g., "animals starting with B") where `Total Possible` = "Open," validate against a bundled word list / dictionary for that category (see §8.5). Duplicates and invalid entries don't count and are flagged visually but don't penalize.
- **Win:** **higher valid count wins the game.** Reveal both lists side by side with valid entries highlighted.

### 4.7 Edge cases & rules (must be handled)
- **No correct/closest answer on a question (R1–R3):** no winner; advance to next question with the same pool. Ensure each round has enough questions (50 each — ample).
- **Speed ties (R1/R2):** compare millisecond timestamps; if still tied, break by RNG (with bots we control timing, so exact ties are essentially impossible).
- **Closeness ties (R3):** smallest distance wins; tie → earlier submission time wins; still tied → RNG.
- **Final count ties:** if both finalists have the same valid count → **sudden-death:** one more list prompt, shorter timer (e.g., 15s), higher count wins; repeat if needed.
- **The human is eliminated early:** the human becomes a **spectator**. Remaining rounds **auto-play (bots only), sped up**, with a "you're spectating" banner, then the **results screen shows the human's final placement** (e.g., "4th of 5"). A **Play Again** button restarts a fresh episode.
- **Player leaves / app backgrounded mid-round:** pause the active timer if possible; on return, resume or forfeit the current question as a timeout (MVP can simply forfeit the current question).
- **All five could whiff a question:** allowed; just pull the next one.

### 4.8 Win/end states
- **Champion:** the Final winner. Big celebration: confetti, Brady cheer, "Champion" banner, XP payout, share card.
- **Runner-up / placements:** everyone gets a **placement (1st–5th)** based on when they were eliminated (5th = first out in R1, ... 1st = champion). Spectated bots still get placements.

---

## 5. Players & Bots

### 5.1 The lobby model
Every episode has **exactly 5 players: 1 human (always you) + 4 bots.** The app must *present* this as live multiplayer: a "finding players…" loading state, players "joining" one by one with usernames + avatars, then the **5-avatar lineup on the white stage.**

### 5.2 Bots
Bots are the core illusion. Each bot has:
- A **generated username** (fun, Brady-fan-flavored handles — bundled name pool).
- A **randomized cartoon avatar** (see §6).
- A **skill rating** (e.g., 0.0–1.0) that drives believable behavior:
  - **R1/R2 (MC):** probability of answering correctly, and a **response-latency distribution** (ms) for when they "tap." Higher skill → more often correct and faster.
  - **R3 (numeric):** an **error distribution** around the true value (e.g., log-normal/percentage error scaled by skill) → produces a believable guess and submission time.
  - **Final (list):** a **target count distribution** + believable typing cadence → bot "enters" N valid answers over the 20s.
- **Tunable difficulty curve:** bots should make the human's game **fair but winnable** — the human should win a meaningful fraction of episodes but not always. Expose a single difficulty knob (Easy/Normal/Hard) and per-round skill seeds so the demo feels good. For the pitch, bias toward a tense, winnable game.

> **Important:** bot timings must be simulated with realistic jitter and never instantaneous/identical. Reveal logic (see §4.6) waits for "all submitted or timer," so bot submissions arrive staggered to feel human.

### 5.3 The human player
Real input, real timing. The human can **lose at any round** and then spectates (§4.7). The human occupies one fixed slot in the lineup.

---

## 6. Avatars & Brady Host

### 6.1 Player avatar creation
On first run (and editable later), the human creates a **cartoon avatar of themselves**, then stands in the lineup like a Brady contestant.

- **MVP approach:** use a **parametric cartoon avatar system** (recommended: **DiceBear** "avataaars"/"big-smile"-style or equivalent) so we get a friendly cartoon look with customizable options **without commissioning art**. Options to expose: skin tone, hair style/color, eyes, facial hair/accessories, outfit/color. Keep it to a one-screen builder with live preview.
- Bots get **randomized avatars** from the same system (so everyone matches the art style).
- Persist the human's avatar locally (see §11.5). The avatar appears in the lineup, results, leaderboard, and profile.

### 6.2 Animated Brady host
Brady hosts every episode — the personality anchor.

**Decision (host art):** for the MVP we use an **AI-generated 2D cartoon caricature of Brady**, produced as a **consistent character set of transparent-PNG expression states**, then animated with **lightweight motion** (state swaps + subtle Reanimated/Lottie movement — a bob, a scale-bounce, a head tilt). This is the right call for a solo build on a 1–2 week clock with no pre-deal budget:
- **Fast & near-zero cost** vs. commissioning an illustrator, and easy to iterate.
- **High fidelity** — reads clearly as "Brady" for a private pitch, far better than a code-drawn geometric caricature.
- **Swappable** — exported as named assets behind the theme/asset config (§3.2), so a commissioned/branded set (or art Brady's team provides) can drop in 1:1 later. This also satisfies the "stylized original illustration, not a traced photo / no copyrighted clips" stance in §16.

- **Required expression states (one consistent character):** *idle/intro, asking a question, building tension during countdown, celebrating a correct answer, reacting to a wrong answer, crowning the champion.* Plus a neutral "between questions" pose.
- Brady "speaks" via **text speech bubbles** (host lines + catchphrases). Optional TTS/voice is **post-MVP**.
- Brady delivers **quotes on reveal** (see §10.2): a green-tinted hype line on correct, a playful red-tinted line on wrong — shown **only at reveal time**, never while answers are still pending.

### 6.3 Premium "famous contestant" avatars *(nice-to-have / post-MVP)*
Unlockable avatars of Brady's most popular contestants (e.g., Isaac, Pablo, Anderson, Jake) as a **paid-tier** cosmetic. **Out of scope to build for the MVP**, but referenced in the pitch and represented as locked slots in the avatar/store UI to show the upsell. Requires Brady's (and the contestants') consent before any public release.

---

## 7. Screens & UX Flow

Wireframe-level flow (each is a screen/state):

1. **Splash** — logo lockup + "A Magnet Games Production" + BradyYourTutor branding.
2. **Home / Main Menu** — big **PLAY** button (*Last One Standing*), Profile, Leaderboard, and channel CTAs (Subscribe). One mode tile now; show "More modes coming soon" placeholders to signal extensibility.
3. **Avatar Create / Edit** — parametric avatar builder with live preview (first run, and editable anytime).
4. **Matchmaking / Lobby** — "finding players…" → bots join one by one with names + avatars → the **5-avatar white-stage lineup** → "Round 1 starting."
5. **Round Stage (the core gameplay screen)** — shared layout across rounds:
   - Animated **Brady** + question/prompt.
   - The **player lineup** showing live status (answered ✔ / still thinking / locked) **without revealing correctness**.
   - **Countdown timer** (15/10/20s).
   - **Answer UI**: 4 big tap buttons (R1/R2), numeric keypad/field (R3), or list input + running tally (Final).
   - **Reveal**: green/red on answers, who advanced/was eliminated, Brady's quote.
6. **Round Transition** — "X eliminated," updated lineup, "Round N" intro card.
7. **Spectator state** — if the human is out, sped-up bot rounds with a "spectating" banner.
8. **Results / Champion screen** — winner crown + confetti, full placements (1st–5th), XP earned, badges unlocked, **Share** + **Play Again** + **Subscribe**.
9. **Leaderboard** — global ranking (human + seeded community/bots) by XP (and/or best placement).
10. **Profile** — avatar, level + XP bar, streak, badges earned, lifetime stats (session-scoped for MVP).

> **Reveal discipline (from your requirement):** during answering, show only that a player **has answered** (a neutral "locked in" state). **Correctness (green/red) and each player's actual answer are shown only after all players have responded or the timer ends.**

---

## 8. Question Bank & Content

### 8.1 Source of truth
`content/brady_trivia_question_bank.xlsx` (copied into this repo). **200 questions, 50 per round.** For the MVP the content is **baked into the app** as JSON (no backend). A **Supabase**-backed dynamic content service is **post-MVP** (you've used Supabase on Goalosopher; same pattern later).

### 8.2 Build step: xlsx → JSON
A small **content build script** converts each sheet into a typed JSON file consumed by the app (so editors keep using the spreadsheet, the app loads JSON). Run it whenever the bank changes.

### 8.3 Schema (maps 1:1 from the sheets)
**Round 1 (`Round 1 - Trivia`):** `ID, Category, Question, Option A–D, Correct Answer, Difficulty`
```ts
type MCQuestion = {
  id: string; round: 1 | 2; type: "multiple_choice";
  category: string; question: string;
  options: string[];        // 4 options
  answer: string;           // must equal one option
  difficulty?: "Easy" | "Medium" | "Hard";
  asset?: FlagOrOutlineAsset; // R2 only
};
```
**Round 2 (`Round 2 - Flags+Geo`):** `ID, Type, Prompt, Asset Needed, Option A–D, Correct Answer, Difficulty` — `Type ∈ {Zoomed Flag, Greyed Flag, Country Outline, Geography Q}`. `Asset Needed` drives §8.4.
**Round 3 (`Round 3 - Numeric`):** `ID, Category, Question, Correct Answer, Unit, Notes, Difficulty`
```ts
type NumericQuestion = {
  id: string; round: 3; type: "numeric";
  category: string; question: string;
  answer: number; unit: string; notes?: string;
};
```
**Final (`Final Round - List`):** `ID, Prompt, Time (s), Acceptable Answers (semicolon-separated), Total Possible, Notes`
```ts
type ListQuestion = {
  id: string; round: "final"; type: "list";
  prompt: string; timeSec: number;
  acceptable: string[];     // split on ";", trimmed, lowercased for matching
  totalPossible: number | "open";
  openDictionaryKey?: string; // when totalPossible === "open"
};
```

### 8.4 Round 2 visual asset pipeline (derive, don't hand-draw)
- **Source set:** one clean **flag image/SVG set** (e.g., a public-domain/CC flag pack) + a **world country outline** source (e.g., Natural Earth–derived SVG paths or a country-outline SVG library).
- **Greyed Flag:** render the clean flag with a **grayscale** filter.
- **Zoomed Flag:** render the clean flag scaled/cropped to the region described in `Asset Needed` (store a per-question crop rect, or eyeball a handful since it's ~13 flags).
- **Country Outline:** render the country's silhouette path (filled solid) on white.
- This converts ~38 "needed images" into mostly **config over a reusable asset set**, which is the only way a solo dev hits the 1–2 week timeline. Hand-tune the few zoom crops.

### 8.5 Final-round validation
- Closed prompts: match typed entry (case-insensitive, trimmed, basic normalization) against `acceptable`. Accept common variants where feasible (MVP: exact-normalized match; add alias lists if time allows).
- Open prompts (`Total Possible = Open`, e.g., "animals starting with B"): validate against a **bundled category word list** (`openDictionaryKey`). Ship a small curated list per open prompt; reject unknowns.

### 8.6 Content QA
Before the demo, play each round end-to-end and sanity-check answers, especially Round 3 approximations (populations/years drift) and Final acceptable-answer lists.

---

## 9. Progression: XP, Levels, Streaks, Badges, Leaderboard

Keep it **simple but Brady-flavored** for the MVP. All **session-scoped / resets are acceptable** for the demo (per decision), though we'll **lightly persist locally** so a reopened app feels continuous (see §11.5).

### 9.1 XP & Levels
- **XP per episode:** participation + per correct answer + bonuses for advancing each round + big bonus for **winning**. (Define concrete numbers during build; tune for satisfying payouts.)
- **Levels:** XP thresholds with **Brady-themed level titles** (e.g., *Pop Quiz Rookie → Class Clown → Honor Roll → Dean's List → Valedictorian → The Tutor*). Show a level bar on Profile and a level-up moment on Results.

### 9.2 Streaks
- A **daily play streak** (consecutive days played). Simple counter with a flame/badge. (Per-question answer streaks within a game are **post-MVP** per your note.)

### 9.3 Badges (themed achievements)
A starter set, e.g.: **First Win**, **Flawless** (won without ever placing last in a round), **Geography Whiz** (win Round 2 a few times), **Sharpshooter** (nail a Round 3 estimate within X%), **Listmaster** (max out a Final prompt), **Welcome to the Class** (play first game). Keep ~6–10 for the MVP.

### 9.4 Global leaderboard
- A **global leaderboard** that includes **the human + a seeded "community" of bots** so it looks populated and alive. Ranked by **total XP** (and/or best placement). The human's score slots into the seeded list and climbs as they play.
- MVP is **local** (seeded data + the human's current stats). A real shared leaderboard via Supabase is **post-MVP**.

---

## 10. Audio & Feedback

### 10.1 Sound
Energetic SFX to match the channel: countdown tick, **answer lock-in**, **correct ding**, **wrong buzz**, advance whoosh, **elimination** sting, **champion fanfare**, and light background music on menus/stage. Include a mute toggle. Source from royalty-free packs for the MVP; swap for branded audio later.

### 10.2 Brady reaction quotes (your requirement)
- On **reveal only** (never while answers pending), Brady shows a **quote**:
  - **Correct → green-tinted** hype line (e.g., "Let's go! That's a genius right there.").
  - **Incorrect → red-tinted** playful line (e.g., "Ohhh, so close — not today!").
- Maintain a **pool of correct lines and wrong lines**, chosen at random, with Brady's matching **expression/pose**. Keep them on-brand and good-natured (his vibe is fun, not mean).
- Reveal sequence per question: lock all answers → reveal each player's choice → color green/red → Brady expression + quote → show who advanced / who's out.

---

## 11. Tech Stack & Architecture

### 11.1 Recommendation (and why)
**Expo (React Native) + TypeScript**, one codebase → **iOS + Android + Web**.

Rationale tied to your situation:
- **Closest to what you know.** You shipped Goalosopher with React-style web tooling + Vercel + Supabase. Expo/React Native is React + TS; the web export deploys to **Vercel** exactly like you already do.
- **No Apple Developer account needed to demo.** You don't have one ($99/yr + review delay). Expo lets us **deploy the web build to Vercel** as the **primary demo link** Brady taps — **zero install, looks native on his phone.** Native iOS/Android builds (Expo Go / EAS) come when the partnership is real.
- **Genuinely a mobile-app codebase**, so the pitch is honest ("this is the app, here's the same code as a web link") and the path to App Store / Play Store later is short.
- **Supabase later is first-class** with Expo, matching your stack for the post-MVP backend.

> Flutter would also work but is a new language (Dart) for you and a slower ramp on a 1–2 week clock. Native-only (Swift) is blocked by the missing dev account and doubles platform work. **Expo is the clear pick.**

### 11.2 Supporting libraries (initial picks; finalize during build)
- **Navigation:** Expo Router (or React Navigation).
- **State:** lightweight store (Zustand) for game/session state; a **game-state machine** for the round/elimination flow (XState or a hand-rolled reducer) so the elimination rules in §4.2 are explicit and testable.
- **Avatars:** DiceBear (or equivalent parametric SVG avatars).
- **Animation:** Reanimated + Moti for transitions; Lottie for Brady poses/celebrations; a confetti lib for wins.
- **Local storage:** AsyncStorage (or `expo-secure-store`) for avatar, settings, and light progression persistence.
- **Audio:** `expo-av` for SFX/music.
- **SVG/flags:** `react-native-svg` for outlines/flags and grayscale/zoom rendering.

### 11.3 Architecture shape
- **No server for MVP.** Everything runs on-device. Content is bundled JSON (built from the xlsx). The "multiplayer" is a **local game engine** orchestrating the human + 4 bot agents.
- **Layers:** `content/` (bundled questions + assets) → `engine/` (game state machine, elimination rules, bot AI, scoring/validation) → `ui/` (screens/components) → `store/` (session + progression). Keep the **engine pure and unit-testable** (deterministic given a seed), independent of UI.
- **Determinism for demos:** seedable RNG so a given episode can be reproduced/tuned and so the demo can be made reliably fun.

### 11.4 Deployment
- **Web (primary demo):** `expo export` web build → **Vercel** (your existing flow). Custom subdomain via Porkbun if desired (e.g., a private, unlisted URL).
- **Native (later):** Expo Go for quick device testing; EAS Build for store-ready binaries once there's an Apple Developer account.

### 11.5 Persistence (MVP)
Stats "reset for MVP" is fine, but we'll **persist avatar, settings, level/XP, streak, and badges locally** via AsyncStorage so a reopened session feels continuous. No cloud sync. Provide a "reset profile" affordance for clean demo runs.

---

## 12. Core Data Models (engine)

```ts
type Player = {
  id: string;
  kind: "human" | "bot";
  name: string;
  avatar: AvatarConfig;
  skill?: number;            // bots only, 0..1
  status: "active" | "advanced" | "eliminated" | "spectating";
  placement?: number;        // 1..5 at end
};

type Submission = {
  playerId: string;
  questionId: string;
  value: string | number | string[]; // tap option / number / list
  correct?: boolean;        // R1/R2
  distance?: number;        // R3
  validCount?: number;      // final
  submittedAtMs: number;    // ms since question shown; undefined = timeout
};

type RoundState = {
  round: 1 | 2 | 3 | "final";
  pool: string[];           // active player ids
  advanced: string[];       // winners moving on
  currentQuestion: AnyQuestion;
  submissions: Submission[];
  timer: { totalMs: number; startedAt: number };
};

type EpisodeState = {
  players: Player[];
  rounds: RoundState[];
  phase: "lobby" | "round" | "transition" | "spectating" | "results";
  champion?: string;
  seed: number;
};
```

---

## 13. Demo & Distribution Plan

### 13.1 Recommendation
1. **Primary: a Vercel-hosted web link (Expo web export).** Brady opens it **on his phone's browser** — **no install, no signup**, looks/feels native (portrait, phone-framed). Lowest possible friction; this is what you send in a reply to your cold email. Keep the URL **unlisted/private** (and optionally behind a simple passcode) while it uses his likeness (see §16).
2. **Backup: a polished 60–90s screen recording** ("a full episode in 90 seconds") in case he doesn't tap the link — drop it inline in the message/email.
3. **Optional: Expo Go QR** for a more "native" feel if he's willing to install Expo Go.
4. **Skip TestFlight for the MVP** — it requires an Apple Developer account you don't have, plus review time. Revisit once the deal is on.

### 13.2 Demo mode niceties
- A **"demo seed"** that guarantees a tense, winnable, content-clean episode for the pitch.
- A quick **reset** so it's fresh each time someone opens it.
- Make sure the **first 60 seconds slap** (lobby fill → Brady intro → first question).

---

## 14. Channel Integration & Growth Hooks

This is a key part of *why Brady should care* — the app feeds his channels.

- **Subscribe CTAs** to YouTube + TikTok on Home, Results, and (subtly) the lobby.
- **Shareable result card** (Wordle-style): champion crown / placement + a tease ("I survived to the Final on BradyYourTutor Trivia — can you beat me?") with a link back to the app + his channel. Share via the native share sheet / web share API.
- **Deep links** out to his latest content (placeholder links for the MVP).
- **"Challenge a friend"** as a *concept* in the pitch (real async/live multiplayer is post-MVP). MVP can include a share that *looks* like a challenge.
- Framing for the pitch: **the app is a top-of-funnel growth loop** — players discover, play, share, and subscribe, spreading his content and sparking conversation.

---

## 15. Monetization (pitch-deck only; not built in MVP)

Addressed conceptually, not implemented:
- **Free with ads** (interstitial between episodes, rewarded ads for retries/cosmetics).
- **Freemium paid tier:** ad-free, **premium famous-contestant avatars** (Isaac, Pablo, Anderson, Jake, …), exclusive cosmetics/themes, and early access to new modes.
- **Future:** seasonal passes, branded sponsorships tied to his content, tournaments.
- In the app, show **locked premium avatar slots** and a "coming soon" store to *visualize* the upsell without building purchases.

---

## 16. IP, Likeness & Legal Notes

**Your question — can you use Brady's likeness for a demo shown only to him?** Practical guidance (not legal advice):
- A **private** pitch shown **only to Brady (the rights holder)** is **low-risk** — you're showing him his own brand to propose a partnership, not distributing to the public. Using a **Brady-style animated caricature host** in that context is reasonable for a demo.
- **Do this:** make the host a **stylized original illustration** ("inspired by Brady"), not a traced photo; **keep all brand/likeness assets swappable** via the theme/asset config so they can be replaced or formalized once there's an agreement. Avoid embedding **copyrighted clips, his actual photographs, or his exact logo** in any build.
- **Keep the demo private** (unlisted URL, optional passcode). **Do not publish** the likeness-using build publicly or to app stores before a signed agreement.
- **Premium contestant avatars** (Isaac/Pablo/etc.) require **their** consent too — strictly post-deal.
- **Fallback:** if you'd rather be conservative, ship a **clearly generic host** that Brady can "rebrand as himself," and theme the rest to his vibe. The architecture supports flipping between "Brady host" and "generic host" via config.

**Decision for the MVP:** build the **Brady-style animated host + his vibe**, keep it behind a **private demo link**, and keep the host/brand **swappable**. Co-brand "A Magnet Games Production."

---

## 17. Out of Scope (MVP non-goals)

Explicitly **not** in the MVP (mentioned in pitch only):
- Real online multiplayer / matchmaking / netcode.
- Accounts, auth, cloud sync, real backend (Supabase comes post-deal).
- Multiple game modes (only *Last One Standing*).
- Monetization / IAP / ads (concept only).
- Skill-based lobbies / ranked.
- Per-question streak mechanics, lives/continues.
- Premium contestant avatars (UI placeholder only).
- Voice/TTS for Brady, full 3D character.
- Localization, accessibility audit, anti-cheat, moderation.

---

## 18. Build Plan / Milestones (≈1–2 weeks, solo + Claude Code)

> Order optimizes for "playable end-to-end early, then polish." Adjust freely.

- **M0 — Scaffold (½–1 day):** Expo + TS project, navigation, theme tokens, deploy a "hello" web build to Vercel to prove the pipeline.
- **M1 — Content pipeline (½–1 day):** xlsx→JSON build script; typed loaders; validate all 200 questions parse.
- **M2 — Game engine (2–3 days):** state machine + unified elimination rules (§4.2), bot AI (§5.2), scoring/validation for all four round types, seedable RNG, **unit tests** for the rules. Playable in a bare UI.
- **M3 — Core gameplay UI (2–3 days):** round stage, 5-avatar white lineup, timers, tap/numeric/list inputs, **reveal discipline** (§7), Brady poses + reaction quotes. *(Includes generating the AI 2D Brady caricature expression set per §6.2 — done early in M3 so the host is live during UI work; the assets sit behind the theme config for later swap.)*
- **M4 — Avatars + lobby (1 day):** parametric avatar builder, bot name/avatar generation, "finding players" lobby illusion.
- **M5 — Round 2 visuals (1 day):** flag asset set + grayscale/zoom/outline rendering pipeline (§8.4).
- **M6 — Progression + leaderboard + results (1 day):** XP/levels/streaks/badges, seeded global leaderboard, champion/results screen + share card.
- **M7 — Audio + juice (½–1 day):** SFX/music, confetti, transitions, "first 60 seconds slap" pass.
- **M8 — Demo polish (½–1 day):** demo seed, reset, content QA, private Vercel link, 90s screen recording, smoke-test on a real phone browser.

---

## 19. Definition of Done (MVP acceptance criteria)

The MVP is "done" when, **on a phone browser via the Vercel link, with no install or signup**, a player can:

1. See branded splash/home ("Brady vibe" + "Magnet Games Production").
2. **Create a cartoon avatar** and see it in a **5-player white-stage lineup** with 4 named, avatar'd bots that "joined" like multiplayer.
3. Play a **full *Last One Standing* episode** — all four rounds — with:
   - Correct **per-round formats** (MC tap, MC flags/geo with zoomed/greyed/outline visuals, numeric closest, list battle).
   - Correct **timers** (15/15/10/20s) and **elimination rules** (§4.2) producing one champion.
   - **Reveal discipline** (pending vs. green/red after all answer) and **Brady reaction quotes**.
   - Believable, staggered **bot behavior**; the game is **fair and winnable**.
4. **Win or lose**, see **placements (1st–5th)**, **XP/level**, **badges**, and a **champion celebration**.
5. View a **populated global leaderboard** (human + seeded community).
6. **Play again** quickly, and hit **Subscribe / Share** CTAs.
7. It **runs reliably** for a remote viewer (the demo seed produces a clean, fun episode), and there's a **90s screen recording** backup.

If all seven hold and it *feels like a BradyYourTutor episode*, the pitch demo is ready.

---

## 20. Open Questions & Risks

**Resolved:**
- ~~**App name**~~ → **Confirmed: "BradyYourTutor — Play to Get Smarter"** (name doubles as tagline). Game mode = *Last One Standing*.
- ~~**Brady host art**~~ → **Decided: AI-generated 2D caricature expression set, swappable** (see §6.2).
- ~~**Likeness comfort**~~ → **Confirmed: private demo + Brady caricature + swappable** (see §16).

**Still open:**
- **Real brand kit:** colors/fonts/logo are placeholders until Brady shares assets; theme config makes the swap cheap.
- **R3 answer drift:** populations/years are approximate and date-sensitive; lock an "as of" note and QA.
- **Final open-prompt dictionaries:** curate bundled word lists for open prompts to avoid unfair rejections.
- **Demo passcode:** decide whether the private Vercel link should be passcode-gated. *(Lean yes — a simple gate while it uses Brady's likeness.)*

---

## 21. Appendix

### 21.1 Repo & project
- **Project root:** `/Users/edgarpineda/BradyTrivia/`
- **This spec:** `spec.md`
- **Question bank (source of truth):** `content/brady_trivia_question_bank.xlsx`
- **Suggested layout (once we scaffold):** `app/` (screens) · `engine/` (rules, bots, scoring) · `content/` (xlsx + generated JSON + assets) · `assets/` (Brady art, flags, audio) · `store/` · `theme/`.

### 21.2 Question bank summary (from the xlsx)
- **Round 1 — Trivia (50):** Geography(10), Science(11), History(8), Music(4), Math(5), Animals(4), Sports(4), Pop Culture(4). Schema: ID, Category, Question, A–D, Correct, Difficulty.
- **Round 2 — Flags+Geo (50):** Zoomed Flag(13), Greyed Flag(12), Country Outline(13), Geography Q(12). Schema: ID, Type, Prompt, Asset Needed, A–D, Correct, Difficulty.
- **Round 3 — Numeric (50):** Population(14), Count(14), Year(10), Elevation(4), Distance(3), Area(2), Temperature(2), Speed(1). Schema: ID, Category, Question, Correct, Unit, Notes, Difficulty.
- **Final — List (50):** Schema: ID, Prompt, Time(s)=20, Acceptable Answers (semicolon-sep), Total Possible, Notes.
- **Total: 200 questions.**

### 21.3 Decisions captured from intake (for traceability)
Single mode (*Last One Standing*); 5 players (1 human + 4 bots, presented as multiplayer); rounds & timers per §4; no lives/streaks-in-round for MVP; randomized difficulty; content baked in (Supabase later); Expo RN+Web; iOS-first but build both; web link as primary demo; light mode; Brady-branded + Magnet Games co-brand; animated Brady host + reaction quotes; reveal-after-all discipline; local-only (no accounts); XP/levels/streaks/badges + seeded global leaderboard; stats reset acceptable (light local persistence); monetization in pitch deck only; target ship in 1–2 weeks; remote demo; solo build with Claude Code.

---

> **Next step after sign-off:** scaffold the Expo project (M0) and wire the content pipeline (M1). Say the word and we'll start building against this spec.
