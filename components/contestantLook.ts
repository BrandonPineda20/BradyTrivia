import type { AvatarConfig } from "../engine/types";
import { spriteSvg, selectionFromSeed, SPRITE_VIEW } from "./spriteSvg";

export const PERSON_VIEW = SPRITE_VIEW;

// Re-exported so callers that destructure resolveLook/personSvg still compile.
export type ContestantLook = Record<string, never>;
export function resolveLook(_config: AvatarConfig): ContestantLook { return {}; }

/** Full-body sprite SVG for the standing Contestant figure. */
export function personSvg(config: AvatarConfig, _look: ContestantLook): string {
  const sel = config.selection ?? selectionFromSeed(config.seed);
  const bg  = sel.backgroundColor;
  return spriteSvg(sel, bg && bg !== "transparent" ? `#${bg}` : undefined);
}
