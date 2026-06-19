/**
 * Theme barrel — the single import surface for brand tokens + assets.
 * Usage: `import { palette, spacing, theme } from "../theme";`
 */
import { motion, palette, radii, shadow, spacing, typography } from "./tokens";

export * from "./tokens";
export * from "./assets";

export const theme = { palette, radii, spacing, typography, motion, shadow } as const;
export type Theme = typeof theme;
