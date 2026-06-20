import type { AvatarConfig } from "../engine/types";
import { spriteBustSvg, selectionFromSeed } from "./spriteSvg";

/** Sprite-style bust SVG for the circle Avatar component. */
export function avatarSvg(config: AvatarConfig, _size: number): string {
  const sel = config.selection ?? selectionFromSeed(config.seed);
  return spriteBustSvg(sel);
}
