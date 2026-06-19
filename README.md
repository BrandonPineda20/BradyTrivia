# BradyYourTutor — Play to Get Smarter

Mobile-first trivia game (Expo / React Native + TypeScript) recreating a *BradyYourTutor*
episode: 5 players (1 human + 4 bots), white-stage lineup, round-by-round elimination,
one champion. **One mode at launch:** *Last One Standing*. A *Magnet Games Production*.

The single source of truth for the build is [`spec.md`](./spec.md).

## Status

- ✅ **M0 — Scaffold:** Expo + TS + Expo Router, swappable theme/asset config, hello screen, web export → Vercel pipeline wired.
- ✅ **M1 — Content pipeline:** `xlsx → typed JSON` build script; all 200 questions validate.
- ⏭️ **M2 — Game engine** (next): elimination state machine, bot AI, scoring. Not started.

## Project layout (§21.1)

```
app/        Expo Router screens (file-based routing). M0: index hello screen.
engine/     Game rules, bots, scoring (M2 — placeholder).
content/    Question bank: source xlsx + generated/ JSON + typed loader (index.ts, types.ts).
assets/     Icons now; Brady host art + flags + audio later (behind theme/assets.ts).
store/      Session + progression store (M2+ — placeholder).
theme/      Brand design tokens + asset registry (§3.2) — swap Brady's kit in one place.
scripts/    build-content.mjs (xlsx → JSON).
```

## Commands

```bash
npm run web            # local dev server (Expo web)
npm run build:content  # regenerate content/generated/*.json from the xlsx (run when the bank changes)
npm run export:web     # production static web build → dist/
npm run deploy         # build content + deploy to Vercel (requires `npx vercel login` once)
```

## Deploying the web demo (Vercel)

The primary demo is the **web build hosted on Vercel** — a link Brady taps, no install.
`vercel.json` runs `build:content` then `expo export --platform web` and serves `dist/`
as a single-page app.

First time on this machine:

```bash
npx vercel login      # authenticate to your Vercel account
npx vercel link       # link this folder to a Vercel project (once)
npm run deploy        # = npx vercel --prod
```

> Keep the link **unlisted / passcode-gated** while it uses Brady's likeness (spec §16).

## Content pipeline (M1)

`content/brady_trivia_question_bank.xlsx` (200 questions, 50/round) → typed JSON per the
§8.3 schema. `build-content.mjs` validates every row (4 options with the answer among them
for R1/R2, numeric answers for R3, non-empty acceptable lists + open-prompt keys for the
Final) and **exits non-zero** if anything fails to parse. Output lands in
`content/generated/`; the app imports it via `content/index.ts`.
