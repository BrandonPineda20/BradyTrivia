/**
 * Brand design tokens (spec §3.2).
 *
 * EVERYTHING brand-related lives here so Brady's real brand kit can be swapped in
 * ONE place. Do not hardcode brand colors, type, or motion in components — read
 * from these tokens (or `theme` in ./index) instead.
 *
 * Direction: "YouTube-thumbnail energy" — bold, high-contrast, playful, light mode
 * (the white stage is core to the format). Polished with soft depth + a yellow
 * "stage spotlight" so cards float and the host pops, without losing the bright,
 * punchy game-show feel. Current values are tuned placeholders until Brady shares
 * his real brand assets (see §20 "Real brand kit").
 */

export const palette = {
  stage: "#FFFFFF", // white lineup stage — core to the format
  stageTint: "#F7F9FF", // barely-there cool wash for large backgrounds
  surface: "#F4F6FB",
  surfaceAlt: "#EEF2FA", // slightly deeper surface for nested fills
  hairline: "#E4E9F2", // 1px borders / dividers

  primary: "#1F6FEB", // electric blue (placeholder)
  primaryDark: "#0B4FC4",
  primarySoft: "#EAF1FF", // tinted primary fill (selected / locked)

  accent: "#FFD23F", // sunny yellow (placeholder)
  accentDark: "#F2B807",
  accentSoft: "#FFF4D6", // tinted accent fill

  correct: "#2BD576", // §3.2 correct
  correctSoft: "#E6FBF0",
  incorrect: "#FF4D4D", // §3.2 incorrect
  incorrectSoft: "#FFECEC",

  neutral: "#9AA3AF", // pending / locked
  ink: "#15181D", // primary text
  inkSoft: "#5B6470", // secondary text
  onPrimary: "#FFFFFF",
  onAccent: "#1A1500",
} as const;

/** Spotlight gradient stops (yellow stage-light glow → transparent). */
export const glow = {
  core: "#FFD23F",
} as const;

export const radii = { sm: 8, md: 14, lg: 22, xl: 28, pill: 999 } as const;

/** 4pt spacing scale: spacing(2) = 8px. */
export const spacing = (n: number) => n * 4;

/**
 * Soft elevation presets (RN 0.76+/0.85 `boxShadow`, cross-platform). Spread onto
 * a View's style: `style={[styles.card, shadow.md]}`. Keep these subtle — the look
 * is "floating on a bright stage", not heavy material.
 */
export const shadow = {
  sm: { boxShadow: "0px 2px 8px rgba(11,27,58,0.07)" },
  md: { boxShadow: "0px 8px 20px rgba(11,27,58,0.10)" },
  lg: { boxShadow: "0px 16px 36px rgba(11,27,58,0.16)" },
  glow: { boxShadow: "0px 6px 30px rgba(255,194,0,0.45)" }, // host / champion pop
  press: { boxShadow: "0px 2px 6px rgba(11,27,58,0.12)" },
} as const;

export const typography = {
  fonts: {
    // Rounded/heavy display face (Poppins/Nunito feel) + clean body face.
    // System stack for now; real faces load via expo-font in M3 behind these keys.
    display: "System",
    body: "System",
    mono: "Courier",
  },
  size: { xs: 12, sm: 14, md: 16, lg: 20, xl: 28, xxl: 40, mega: 64 },
  weight: { regular: "400", medium: "600", heavy: "800" },
} as const;

export const motion = {
  // Snappy spring + countdown/reveal timings (§3.2 Motion).
  spring: { damping: 14, stiffness: 180, mass: 0.6 },
  duration: { fast: 120, base: 220, slow: 420 },
} as const;
