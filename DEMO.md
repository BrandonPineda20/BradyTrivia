# BradyYourTutor — Demo & Pitch Guide

*A Magnet Games production · pitch demo for Brady · "Play to Get Smarter"*

This is the one-page runbook for showing the demo. It covers the access gate, the
curated pitch run, a 90-second storyboard, a phone smoke-test, and the known
content notes to clean up before any public/app-store launch.

---

## 1. Access (keep it private — spec §16)

The live build is **unlisted + passcode-gated** while it uses Brady's likeness/vibe.

- **URL:** https://bradyyourtutor.vercel.app
- **Passcode:** `MAGNET` (case-insensitive)
- The gate is a soft curtain (the code ships in the bundle) — it stops casual/
  accidental sharing, it is **not** real security. Don't post the link publicly,
  and **do not publish the likeness build to app stores before a signed agreement.**

**Rotating the passcode:** set `EXPO_PUBLIC_PASSCODE` in the Vercel project env and
redeploy. Rotating it auto-logs-out everyone (the saved unlock is tied to the code).
Set it to an empty string to disable the gate entirely (e.g. a likeness-free public build).

A returning visitor stays unlocked on their device until the code changes.

---

## 2. The curated pitch run (reproducible)

Append a URL param to control the episode (web):

| Link | What it does |
| --- | --- |
| `…/play?demo=1` | **The curated pitch episode** (seed 618) — same questions every time, so you can rehearse it. |
| `…/play?seed=N` | Force any specific seed `N` (for testing a particular run). |
| `…/play` | Fresh random episode each time (normal player experience). |

**Why a fixed seed for the pitch:** the contestants and the questions are identical
every time, so you can rehearse the exact run and prep your answers. Bot difficulty
is globally tuned to be **tense but winnable** (~24% human win across thousands of
simulated episodes), so a focused player reliably reaches the championship moment.
Seed 618 (the build date, 6/18) gives a clean, varied lobby. Rehearse it a couple of
times so you know the questions cold before recording.

> The live game is fully deterministic for a given seed — reloading `?demo=1` always
> produces the same contestants and questions (verified).
>
> Tip: open `…/play?demo=1` directly, or start from Home and the param carries through.

---

## 3. 90-second storyboard (backup recording)

1. **0:00 — Cold open / Home (~8s).** "A Magnet Games production." Title card,
   Brady host avatar, your contestant chip. Tap **PLAY · Last One Standing**.
2. **0:08 — Lobby (~7s).** 1 human + 4 bot contestants animate in with avatars.
   Brady sets the stakes: last one standing wins.
3. **0:15 — Round 1 · General Trivia (~15s).** Answer 2–3 MC questions; show the
   lock-in, the green correct reveal, and a bot getting eliminated.
4. **0:30 — Round 2 · Flags & Geography (~15s).** Show the zoomed/greyscale flag
   and country-outline visuals — the "derive, don't hand-draw" look. Another elim.
5. **0:45 — Round 3 · Numeric Estimate (~12s).** Closest-guess wheel; tension as
   it narrows to a 1-on-1.
6. **0:57 — Final · Name As Many (~18s).** The head-to-head list battle — race the
   clock to name as many as you can and edge out the last bot.
7. **1:15 — Champion (~10s).** Confetti, "CHAMPION," **+XP**, level-up, badge
   unlock, the placements board, and the **Subscribe** call-to-action.
8. **1:25 — Outro (~5s).** Land on Profile/Leaderboard to show progression depth.

Mute is the 🔊 toggle top-right on Home if you're recording your own VO.

---

## 4. Phone smoke-test checklist

Open the link on a phone (the format is mobile-first) and confirm:

- [ ] Passcode screen appears first; `MAGNET` unlocks it; reopening stays unlocked.
- [ ] First run routes to **Create your contestant**; avatar builder + name save.
- [ ] `play?demo=1` runs the seed-618 episode end-to-end (4 rounds → final → champion).
- [ ] Flag/outline visuals render in Round 2.
- [ ] Reveal discipline holds: answers show "Locked in" until everyone's in, then green/red.
- [ ] Win → confetti + XP + level/badge; **Play again** and **Home** work.
- [ ] Profile + Leaderboard screens load.
- [ ] 🔊 mute toggle persists.

---

## 5. Content notes — clean up before any public launch

These are **not** demo blockers (none appear in the seed-618 run), but fix them
before a wider/app-store release:

- **Population figures (R3-01…R3-14)** are labeled *"Approx 2024."* The numeric
  round scores by *closest guess*, so 2024 figures still play fairly in 2026 — but
  refresh them to current numbers before launch. **Human fact-check needed.**
- **Cross-round fact collisions (random play only):** the same fact appears as both
  an R1 multiple-choice and an R3 numeric in two pairs —
  - `R1-23` & `R3-21`: *"In what year did the Titanic sink?"*
  - `R1-09` & `R3-28`: *"How many bones are in the adult human body?"*

  A random (non-demo) episode could ask the same fact twice. Fix in the source
  `content/brady_trivia_question_bank.xlsx` by replacing one question in each pair
  with a fresh fact, then `npm run build:content`. **Editorial decision needed.**
- The 13 "thin" Finals (oceans, continents, Great Lakes, etc.) are intentionally
  **complete closed sets** — no fix needed.

---

## 6. Commands

```bash
npm run web            # local dev server (Expo web)
npm test               # engine unit tests (vitest)
npm run sim -- 618     # headless play of the pitch episode
npm run build:content  # regenerate JSON from the xlsx source
npm run export:web     # static web build → dist/
npm run deploy         # build content + export + deploy to Vercel (--prod)
```

---

## 7. Still placeholder (by plan)

- Real Brady caricature art (swap `HOST_ART_MODE → "image"` in `theme/assets.ts`).
- Real brand kit (all tokens live in `theme/tokens.ts`).
- Round-2 flag zoom uses a center crop — striped/cantoned flags want focal crops.
- Avatar bundle (~3.3MB) trim is a post-MVP optimization.
