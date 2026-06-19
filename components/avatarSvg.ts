import { avataaars } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";

import type { AvatarConfig } from "../engine/types";

/** Filled-circle backgrounds for bots (seed picks one) so the lineup pops. */
const DEFAULT_BG = ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"];

/** Build a DiceBear "avataaars" SVG string for a config (human options or bot seed). */
export function avatarSvg(config: AvatarConfig, size: number): string {
  const base = config.options ?? { backgroundColor: DEFAULT_BG };
  return createAvatar(avataaars, { seed: config.seed, size, ...base }).toString();
}
