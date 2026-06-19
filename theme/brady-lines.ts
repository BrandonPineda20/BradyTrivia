/**
 * Brady reaction quotes (spec §10.2). Good-natured, on-brand host voice — fun,
 * never mean. Lives in the theme layer so it swaps with the rest of the brand.
 * Shown ONLY at reveal time (§7 reveal discipline), never while answers pend.
 */
import type { HostExpression } from "./assets";

export type HostMood =
  | "intro"
  | "asking"
  | "tension"
  | "correct"
  | "wrong"
  | "champion"
  | "neutral";

/** Map a host mood to the matching expression art slot (§6.2). */
export const MOOD_EXPRESSION: Record<HostMood, HostExpression> = {
  intro: "idle",
  asking: "asking",
  tension: "tension",
  correct: "correct",
  wrong: "wrong",
  champion: "champion",
  neutral: "neutral",
};

export const BRADY_LINES: Record<HostMood, readonly string[]> = {
  intro: [
    "Welcome to the class — let's see who's got it!",
    "Five players, one champion. Let's play!",
    "Alright, eyes up here — first question's a doozy.",
  ],
  asking: [
    "Lock it in when you've got it...",
    "No pressure, but the clock's ticking!",
    "Trust your gut on this one.",
  ],
  tension: [
    "Tick... tick... tick...",
    "Make it count!",
    "Last few seconds!",
  ],
  correct: [
    "LET'S GO! That's a genius right there!",
    "Boom! Straight to the top of the class.",
    "Too easy for you, huh? Love to see it.",
    "Correct! Somebody's been studying.",
  ],
  wrong: [
    "Ohhh, so close — not today!",
    "Swing and a miss! Shake it off.",
    "Not quite — but I respect the confidence.",
    "Yikes! The class winced a little on that one.",
  ],
  champion: [
    "CHAMPION! Take a bow — that's a Valedictorian right there!",
    "Last one standing! Brady's proud of you.",
    "Winner, winner! You just schooled the whole lobby.",
  ],
  neutral: [
    "Nice. On to the next.",
    "Stay sharp — we're just getting started.",
    "Good round. Shake it out.",
  ],
};

/** Pick a line for a mood. Pass a 0..1 roll for deterministic selection. */
export function bradyLine(mood: HostMood, roll: number = Math.random()): string {
  const pool = BRADY_LINES[mood];
  return pool[Math.floor(roll * pool.length) % pool.length];
}
