/**
 * Demo access gate (spec §16).
 *
 * A SOFT, client-side passcode that keeps the Brady-likeness build out of casual
 * / public hands while the pitch is in progress. This is intentionally not real
 * security — the code ships in the web bundle — it's a "you need the link AND the
 * code" curtain so the unlisted URL can't be casually shared or stumbled into.
 *
 * Rotate or set per-deploy via the EXPO_PUBLIC_PASSCODE build-time env var (Expo
 * inlines EXPO_PUBLIC_* into the web bundle at export). Set it to an empty string
 * to disable the gate entirely (e.g. a fully-public, likeness-free build).
 * Comparison is case-insensitive + trimmed so it's forgiving to type on a phone.
 */
export const DEMO_PASSCODE: string = (process.env.EXPO_PUBLIC_PASSCODE ?? "MAGNET").trim();

/** When false (empty passcode) the app is open — no gate is shown. */
export const GATE_ENABLED: boolean = DEMO_PASSCODE.length > 0;

export function passcodeMatches(input: string): boolean {
  return input.trim().toLowerCase() === DEMO_PASSCODE.toLowerCase();
}
