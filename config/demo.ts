/**
 * Demo / pitch mode (spec §16, §18).
 *
 * DEMO_SEED is a hand-picked episode seed that plays a clean, tense, winnable
 * Last One Standing run for the pitch: a varied lobby, the strongest bot knocked
 * out before the final, and a close 12–11 final the presenter wins by playing
 * reasonably. The seed makes the question set + bot behavior reproducible, so the
 * exact run can be rehearsed (the human still answers live).
 *
 * URL controls (web only — Expo Router preserves query params):
 *   ?demo=1   → force the curated DEMO_SEED episode
 *   ?seed=N   → force an explicit seed N (reproduce / test a specific run)
 *   (neither) → a fresh random episode each play
 */
export const DEMO_SEED = 618;

export type SeedChoice = { seed: number; demo: boolean };

/** Resolve which seed to start an episode with, honoring web URL params. */
export function resolveEpisodeSeed(): SeedChoice {
  const random = () => Math.floor(Math.random() * 1_000_000_000);
  try {
    if (typeof window !== "undefined" && window.location?.search) {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get("seed");
      if (raw && raw.trim() !== "" && Number.isFinite(Number(raw))) {
        return { seed: Math.floor(Number(raw)), demo: true };
      }
      const demo = params.get("demo");
      if (demo === "1" || demo === "true") return { seed: DEMO_SEED, demo: true };
    }
  } catch {
    // non-web runtime or blocked location → fall through to a random episode
  }
  return { seed: random(), demo: false };
}
