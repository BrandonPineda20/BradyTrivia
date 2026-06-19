import { avataaars } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";

import type { AvatarConfig } from "../engine/types";

/**
 * Full-body "contestant" look (§6.1, extended). DiceBear "avataaars" only renders a
 * head-and-shoulders bust, so for the head-to-toe lineup we keep that art as the
 * HEAD and synthesize a matching parametric body (shirt, arms, legs, shoes). Body
 * colors are read from the human's customized options when present, else derived
 * deterministically from the seed so every bot is varied but stable.
 */

// Mirror the avataaars option palettes so head + body always agree.
const SKIN = ["edb98a", "ffdbb4", "fd9841", "d08b5b", "ae5d29", "614335"];
const CLOTHES = ["3c4f5c", "65c9ff", "5199e4", "25557c", "ff488e", "ff5c5c", "a7ffc4", "ffffb1", "929598", "ffffff"];
const PANTS = ["2f3a4b", "3e4c5e", "5a4633", "37474f", "283593", "4e342e"];
const SHOE = "23272e";

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick(seed: string, salt: string, list: string[]): string {
  return list[hashStr(`${seed}:${salt}`) % list.length];
}

/** First valid 6-hex value from a DiceBear option (array or string). */
function firstHex(v: unknown): string | undefined {
  let x = Array.isArray(v) ? v[0] : v;
  if (typeof x === "string" && /^[0-9a-fA-F]{6}$/.test(x)) return x;
  return undefined;
}

export type ContestantLook = { skin: string; clothes: string; pants: string };

/** Resolve the body colors for a contestant (human options win; bots derive from seed). */
export function resolveLook(config: AvatarConfig): ContestantLook {
  const opts = config.options ?? {};
  return {
    skin: firstHex(opts.skinColor) ?? pick(config.seed, "skin", SKIN),
    clothes: firstHex(opts.clothesColor) ?? pick(config.seed, "clothes", CLOTHES),
    pants: pick(config.seed, "pants", PANTS),
  };
}

/** Combined viewBox for a whole person: avataaars upper body fills the top 280×280,
 *  the synthesized lower body extends below. */
export const PERSON_VIEW = { w: 280, h: 470 };

/**
 * One combined "full person" SVG: the customized avataaars head + neck + shoulders +
 * shirt (rendered un-clipped, transparent background) welded to a matching lower body
 * (arms with hands, hips, legs, shoes) drawn in the same flat style and colors. No
 * circle — the head connects naturally into the upper body. The avataaars mask id is
 * made unique per seed so multiple people on one web page don't collide.
 */
export function personSvg(config: AvatarConfig, look: ContestantLook): string {
  const { backgroundColor, ...rest } = config.options ?? {};
  void backgroundColor; // dropped → transparent

  const raw = createAvatar(avataaars, {
    seed: config.seed,
    size: 280,
    ...rest,
    skinColor: [look.skin],
    clothesColor: [look.clothes],
  }).toString();

  // Keep only the inner content; uniquify the shared mask id.
  const uid = `m${hashStr(config.seed).toString(36)}`;
  const inner = raw
    .replace(/<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .split("viewboxMask")
    .join(uid);

  const skin = `#${look.skin}`;
  const shirt = `#${look.clothes}`;
  const pants = `#${look.pants}`;
  const shoe = `#${SHOE}`;

  // Lower body + arms are drawn first (behind), so the shirt hem/shoulders overlap
  // and conceal the joins for a clean, connected silhouette.
  return `<svg viewBox="0 0 ${PERSON_VIEW.w} ${PERSON_VIEW.h}" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="140" cy="458" rx="80" ry="9" fill="#000000" opacity="0.08" />
    <rect x="34" y="250" width="26" height="92" rx="13" fill="${shirt}" />
    <rect x="220" y="250" width="26" height="92" rx="13" fill="${shirt}" />
    <circle cx="47" cy="344" r="13" fill="${skin}" />
    <circle cx="233" cy="344" r="13" fill="${skin}" />
    <rect x="98" y="252" width="84" height="54" rx="20" fill="${pants}" />
    <rect x="100" y="288" width="36" height="156" rx="15" fill="${pants}" />
    <rect x="144" y="288" width="36" height="156" rx="15" fill="${pants}" />
    <ellipse cx="112" cy="448" rx="27" ry="13" fill="${shoe}" />
    <ellipse cx="168" cy="448" rx="27" ry="13" fill="${shoe}" />
    ${inner}
  </svg>`;
}
