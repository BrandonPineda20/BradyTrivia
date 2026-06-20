/**
 * Sprite-style full-body SVG avatar — RPG game-character aesthetic matching
 * assets/avatar.png. Replaces DiceBear for all avatar rendering: flat colors,
 * dark outlines, clean geometric shapes, consistent with the reference image.
 */

// ── Style constants ────────────────────────────────────────────────────────────
const OL = "#1c1c28"; // outline color
const OW = 2.5;       // stroke width
const AT = `stroke="${OL}" stroke-width="${OW}" stroke-linejoin="round" stroke-linecap="round"`;

function c(hex: string) { return hex.startsWith("#") ? hex : `#${hex}`; }
function f(hex: string) { return `fill="${c(hex)}" ${AT}`; }
function fns(hex: string) { return `fill="${c(hex)}"`;  } // fill, no stroke

// ── Coordinate anchors ─────────────────────────────────────────────────────────
// Viewbox: 280 × 470
const HCX = 140; // head center X
const HCY = 88;  // head center Y
const HRX = 44;  // head X radius
const HRY = 52;  // head Y radius (slightly tall → nice character proportions)

const HEAD_TOP = HCY - HRY; // y = 36
const HEAD_L   = HCX - HRX; // x = 96
const HEAD_R   = HCX + HRX; // x = 184

const NK_W = 28;
const NK_Y = HCY + HRY - 12; // y = 128 — overlap head bottom slightly
const NK_H = 24;

const SH_Y = NK_Y + NK_H; // y = 152 — shoulder top

export const SPRITE_VIEW = { w: 280, h: 470 };

// ── Body type metrics ──────────────────────────────────────────────────────────
type Metrics = { sw: number; ww: number; aw: number; ah: number };
const METRICS: Record<string, Metrics> = {
  slim:     { sw: 68,  ww: 56,  aw: 17, ah: 128 },
  average:  { sw: 78,  ww: 64,  aw: 21, ah: 128 },
  athletic: { sw: 90,  ww: 62,  aw: 24, ah: 128 },
  heavy:    { sw: 98,  ww: 82,  aw: 27, ah: 134 },
};

function m(bodyType: string): Metrics {
  return METRICS[bodyType] ?? METRICS.average;
}

// ── Deterministic bot-look helper ─────────────────────────────────────────────
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function pick(seed: string, salt: string, list: readonly string[]): string {
  return list[hashStr(`${seed}:${salt}`) % list.length];
}

const BOT_SKIN  = ["edb98a","ffdbb4","fd9841","d08b5b","ae5d29","614335"] as const;
const BOT_HAIR  = ["2c1b18","4a312c","724133","a55728","b58143","d6b370"] as const;
const BOT_TOP   = ["shortFlat","shortCurly","shortWaved","curly","fro","bob","bun","longButNotTooLong"] as const;
const BOT_EYES  = ["default","happy","squint","side"] as const;
const BOT_MOUTH = ["smile","default","serious","twinkle"] as const;
const BOT_CLOTH = ["shirtCrewNeck","shirtVNeck","hoodie","collarAndSweater","blazerAndShirt"] as const;
const BOT_CC    = ["25557c","3c4f5c","2e7d4f","c0392b","8e44ad","ffd23f","ffffff"] as const;
const BOT_PC    = ["2f3a4b","1b1d22","37474f","283593","4e342e"] as const;
const BOT_SC    = ["23272e","5d4037","c62828","1565c0","2e7d32"] as const;
const BOT_BT    = ["slim","average","athletic","heavy"] as const;
const BOT_FH    = ["none","none","none","beardLight","beardMedium","moustacheFancy"] as const;

export function selectionFromSeed(seed: string): Record<string, string> {
  return {
    skinColor:       pick(seed, "skin",   BOT_SKIN),
    top:             pick(seed, "top",    BOT_TOP),
    hairColor:       pick(seed, "hair",   BOT_HAIR),
    eyes:            pick(seed, "eyes",   BOT_EYES),
    eyebrows:        "defaultNatural",
    mouth:           pick(seed, "mouth",  BOT_MOUTH),
    facialHair:      pick(seed, "fh",     BOT_FH),
    facialHairColor: pick(seed, "fhc",    BOT_HAIR),
    clothing:        pick(seed, "cloth",  BOT_CLOTH),
    clothesColor:    pick(seed, "cc",     BOT_CC),
    pantsColor:      pick(seed, "pc",     BOT_PC),
    shoeStyle:       "sneaker",
    shoeColor:       pick(seed, "sc",     BOT_SC),
    accessories:     "none",
    bodyType:        pick(seed, "body",   BOT_BT),
    backgroundColor: "transparent",
  };
}

// ── Hair (split into two layers) ──────────────────────────────────────────────
//
// hairBackSvg: drawn BEFORE the head ellipse. Generous shapes — the head
//   ellipse (painted after) naturally masks the face area, so these can
//   extend as far as needed without ever covering eyes/mouth.
//
// hairCapSvg: drawn AFTER the head ellipse but restricted to the upper
//   crown zone (y < HCY − 20, well above the eyebrow line). Adds the
//   visible texture / silhouette on the scalp without touching the face.

function hairBackSvg(style: string, color: string): string {
  const fl = f(color);
  // Shared shorthand helpers
  const blob  = `<ellipse cx="${HCX}" cy="${HCY - 20}" rx="50" ry="52" ${fl}/>`;
  const sideL = (h: number) =>
    `<rect x="${HEAD_L - 11}" y="${HCY - 36}" width="14" height="${h}" rx="6" ${fl}/>`;
  const sideR = (h: number) =>
    `<rect x="${HEAD_R - 3}"  y="${HCY - 36}" width="14" height="${h}" rx="6" ${fl}/>`;

  switch (style) {
    case "shortFlat":
    case "theCaesar":
    case "shortWaved":
      return `${blob}${sideL(36)}${sideR(36)}`;

    case "shortCurly":
      return `${blob}${sideL(30)}${sideR(30)}`;

    case "curly":
    case "curvy":
      return `
        <ellipse cx="${HCX}" cy="${HCY - 22}" rx="56" ry="56" ${fl}/>
        ${sideL(36)}${sideR(36)}`;

    case "fro":
      return `<ellipse cx="${HCX}" cy="${HCY - 22}" rx="62" ry="60" ${fl}/>`;

    case "dreads": {
      const dxs = [102, 114, 126, 140, 154, 166, 178];
      const locs = dxs.map((x, i) =>
        `<rect x="${x - 5}" y="${HCY - 10}" width="10" height="${32 + (i % 2) * 10}" rx="4" ${fl}/>`
      ).join("");
      return `${blob}${sideL(60)}${sideR(60)}${locs}`;
    }

    case "bob":
      return `
        <ellipse cx="${HCX}" cy="${HCY - 18}" rx="54" ry="56" ${fl}/>
        ${sideL(68)}${sideR(68)}`;

    case "bun":
      return `${blob}${sideL(30)}${sideR(30)}`;

    case "longButNotTooLong":
    case "straight01":
      return `
        <ellipse cx="${HCX}" cy="${HCY - 18}" rx="54" ry="56" ${fl}/>
        ${sideL(100)}${sideR(100)}`;

    default:
      return `${blob}${sideL(36)}${sideR(36)}`;
  }
}

function hairCapSvg(style: string, color: string): string {
  const fl = f(color);
  // All shapes here must stay above y ≈ HCY − 20 (= y 68) so they never
  // overlap the eyebrow line (y 70) or the eye line (y 86).
  const flatCap = `<rect x="${HEAD_L + 6}" y="${HEAD_TOP - 2}" width="${HRX * 2 - 12}" height="22" rx="5" ${fl}/>`;

  switch (style) {
    case "shortFlat":
    case "theCaesar":
      return flatCap;

    case "shortWaved":
      return `
        ${flatCap}
        <path d="M${HCX-34} ${HEAD_TOP+20} Q${HCX-14} ${HEAD_TOP+4} ${HCX} ${HEAD_TOP+2} Q${HCX+14} ${HEAD_TOP+4} ${HCX+34} ${HEAD_TOP+20}"
          fill="none" stroke="${c(color)}" stroke-width="9" stroke-linecap="round"/>`;

    case "shortCurly":
      return `
        <ellipse cx="${HCX}"      cy="${HEAD_TOP + 10}" rx="34" ry="16" ${fl}/>
        <ellipse cx="${HCX - 24}" cy="${HEAD_TOP + 18}" rx="13" ry="13" ${fl}/>
        <ellipse cx="${HCX + 24}" cy="${HEAD_TOP + 18}" rx="13" ry="13" ${fl}/>`;

    case "curly":
    case "curvy":
      return `
        <ellipse cx="${HCX}"      cy="${HEAD_TOP + 8}"  rx="40" ry="20" ${fl}/>
        <ellipse cx="${HCX - 30}" cy="${HEAD_TOP + 22}" rx="16" ry="16" ${fl}/>
        <ellipse cx="${HCX + 30}" cy="${HEAD_TOP + 22}" rx="16" ry="16" ${fl}/>
        <ellipse cx="${HCX}"      cy="${HEAD_TOP + 2}"  rx="20" ry="14" ${fl}/>`;

    case "fro":
      return `<ellipse cx="${HCX}" cy="${HEAD_TOP - 2}" rx="50" ry="26" ${fl}/>`;

    case "dreads":
      return `<ellipse cx="${HCX}" cy="${HEAD_TOP + 8}" rx="36" ry="16" ${fl}/>`;

    case "bob":
      return flatCap;

    case "bun":
      return `
        <ellipse cx="${HCX}" cy="${HEAD_TOP - 18}" rx="24" ry="22" ${fl}/>
        <rect x="${HCX - 12}" y="${HEAD_TOP - 8}" width="24" height="14" rx="3" ${fl}/>
        <ellipse cx="${HCX}" cy="${HEAD_TOP + 8}" rx="34" ry="14" ${fl}/>`;

    case "longButNotTooLong":
    case "straight01":
      return flatCap;

    default:
      return flatCap;
  }
}

// ── Eyes ──────────────────────────────────────────────────────────────────────
function eyesSvg(style: string): string {
  const EY  = HCY - 2;
  const ELX = HCX - 17;
  const ERX = HCX + 17;

  switch (style) {
    case "happy":
      return `
        <path d="M${ELX-8} ${EY} Q${ELX} ${EY-9} ${ELX+8} ${EY}" fill="none" stroke="${OL}" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M${ERX-8} ${EY} Q${ERX} ${EY-9} ${ERX+8} ${EY}" fill="none" stroke="${OL}" stroke-width="2.5" stroke-linecap="round"/>`;
    case "wink":
      return `
        <path d="M${ELX-8} ${EY} Q${ELX} ${EY-9} ${ELX+8} ${EY}" fill="none" stroke="${OL}" stroke-width="2.5" stroke-linecap="round"/>
        <ellipse cx="${ERX}" cy="${EY}" rx="8" ry="9" fill="${OL}"/>
        <ellipse cx="${ERX+2}" cy="${EY-2}" rx="3" ry="3" fill="white"/>`;
    case "squint":
      return `
        <rect x="${ELX-8}" y="${EY-3}" width="16" height="7" rx="4" fill="${OL}"/>
        <rect x="${ERX-8}" y="${EY-3}" width="16" height="7" rx="4" fill="${OL}"/>`;
    case "surprised":
      return `
        <ellipse cx="${ELX}" cy="${EY}" rx="10" ry="11" fill="${OL}"/>
        <ellipse cx="${ELX+3}" cy="${EY-3}" rx="4" ry="4" fill="white"/>
        <ellipse cx="${ERX}" cy="${EY}" rx="10" ry="11" fill="${OL}"/>
        <ellipse cx="${ERX+3}" cy="${EY-3}" rx="4" ry="4" fill="white"/>`;
    case "hearts":
      return `
        <path d="M${ELX-6} ${EY-4} C${ELX-6} ${EY-10} ${ELX+6} ${EY-10} ${ELX+6} ${EY-4} C${ELX+6} ${EY} ${ELX} ${EY+6} ${ELX} ${EY+6} C${ELX} ${EY+6} ${ELX-6} ${EY} ${ELX-6} ${EY-4}Z" fill="#FF6B9D"/>
        <path d="M${ERX-6} ${EY-4} C${ERX-6} ${EY-10} ${ERX+6} ${EY-10} ${ERX+6} ${EY-4} C${ERX+6} ${EY} ${ERX} ${EY+6} ${ERX} ${EY+6} C${ERX} ${EY+6} ${ERX-6} ${EY} ${ERX-6} ${EY-4}Z" fill="#FF6B9D"/>`;
    case "side":
      return `
        <ellipse cx="${ELX+4}" cy="${EY}" rx="8" ry="9" fill="${OL}"/>
        <ellipse cx="${ELX+6}" cy="${EY-2}" rx="3" ry="3" fill="white"/>
        <ellipse cx="${ERX+4}" cy="${EY}" rx="8" ry="9" fill="${OL}"/>
        <ellipse cx="${ERX+6}" cy="${EY-2}" rx="3" ry="3" fill="white"/>`;
    case "closed":
      return `
        <line x1="${ELX-7}" y1="${EY}" x2="${ELX+7}" y2="${EY}" stroke="${OL}" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="${ERX-7}" y1="${EY}" x2="${ERX+7}" y2="${EY}" stroke="${OL}" stroke-width="2.5" stroke-linecap="round"/>`;
    default: // default
      return `
        <ellipse cx="${ELX}" cy="${EY}" rx="8" ry="9" fill="${OL}"/>
        <ellipse cx="${ELX+2}" cy="${EY-2}" rx="3" ry="3" fill="white"/>
        <ellipse cx="${ERX}" cy="${EY}" rx="8" ry="9" fill="${OL}"/>
        <ellipse cx="${ERX+2}" cy="${EY-2}" rx="3" ry="3" fill="white"/>`;
  }
}

// ── Eyebrows ──────────────────────────────────────────────────────────────────
function eyebrowsSvg(style: string): string {
  const BY  = HCY - 18;
  const BLX = HCX - 17;
  const BRX = HCX + 17;
  const brow = (lx: number, ly0: number, ly1: number, ry0: number, ry1: number) =>
    `<path d="M${lx-9} ${BY+ly0} Q${lx} ${BY+ly1} ${lx+9} ${BY+ry0}" fill="none" stroke="${OL}" stroke-width="2.5" stroke-linecap="round"/>` +
    `<path d="M${BRX-9} ${BY+ry1} Q${BRX} ${BY+ly1} ${BRX+9} ${BY+ly0}" fill="none" stroke="${OL}" stroke-width="2.5" stroke-linecap="round"/>`;

  switch (style) {
    case "raisedExcitedNatural": return brow(BLX, 0, -5, -2, -2);
    case "flatNatural":
      return `<line x1="${BLX-9}" y1="${BY}" x2="${BLX+9}" y2="${BY}" stroke="${OL}" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="${BRX-9}" y1="${BY}" x2="${BRX+9}" y2="${BY}" stroke="${OL}" stroke-width="2.5" stroke-linecap="round"/>`;
    case "angryNatural":
      return `<path d="M${BLX-9} ${BY-4} L${BLX+9} ${BY+3}" fill="none" stroke="${OL}" stroke-width="3" stroke-linecap="round"/>
              <path d="M${BRX-9} ${BY+3} L${BRX+9} ${BY-4}" fill="none" stroke="${OL}" stroke-width="3" stroke-linecap="round"/>`;
    case "sadConcernedNatural": return brow(BLX, -3, 2, 2, -3);
    case "upDownNatural":
      return `<path d="M${BLX-9} ${BY+3} Q${BLX} ${BY-3} ${BLX+9} ${BY}" fill="none" stroke="${OL}" stroke-width="2.5" stroke-linecap="round"/>
              <path d="M${BRX-9} ${BY} Q${BRX} ${BY-3} ${BRX+9} ${BY+3}" fill="none" stroke="${OL}" stroke-width="2.5" stroke-linecap="round"/>`;
    default: return brow(BLX, 2, -2, 0, 0);
  }
}

// ── Mouth ─────────────────────────────────────────────────────────────────────
function mouthSvg(style: string): string {
  const MY = HCY + 22;
  const MX = HCX;
  switch (style) {
    case "default":
      return `<ellipse cx="${MX}" cy="${MY}" rx="9" ry="6" fill="${OL}"/>`;
    case "twinkle":
      return `
        <path d="M${MX-12} ${MY} Q${MX} ${MY+12} ${MX+12} ${MY}" fill="${OL}"/>
        <rect x="${MX-4}" y="${MY-2}" width="8" height="7" rx="2" fill="white"/>`;
    case "serious":
      return `<line x1="${MX-11}" y1="${MY}" x2="${MX+11}" y2="${MY}" stroke="${OL}" stroke-width="2.5" stroke-linecap="round"/>`;
    case "tongue":
      return `
        <path d="M${MX-11} ${MY-2} Q${MX} ${MY+11} ${MX+11} ${MY-2}" fill="${OL}"/>
        <ellipse cx="${MX}" cy="${MY+9}" rx="6" ry="7" fill="#FF6B9D" stroke="${OL}" stroke-width="1.5"/>`;
    case "grimace":
      return `
        <rect x="${MX-12}" y="${MY-5}" width="24" height="13" rx="5" fill="${OL}"/>
        <line x1="${MX-9}" y1="${MY+1}" x2="${MX+9}" y2="${MY+1}" stroke="white" stroke-width="1.5"/>`;
    default: // smile
      return `<path d="M${MX-12} ${MY-2} Q${MX} ${MY+12} ${MX+12} ${MY-2}" fill="none" stroke="${OL}" stroke-width="2.5" stroke-linecap="round"/>`;
  }
}

// ── Facial hair ───────────────────────────────────────────────────────────────
// Drawn BEFORE eyes/mouth so face features always render on top.
// Shapes are positioned anatomically: mustache above upper lip, chin beard
// below the mouth, sideburns on the cheek sides only.
function facialHairSvg(style: string, color: string): string {
  if (style === "none") return "";
  const fl = f(color);
  const fc = c(color);

  // Anatomical anchors
  const STACHE_Y = HCY + 14; // y=102  — mustache, just above upper lip
  const CHIN_Y   = HCY + 34; // y=122  — chin, below mouth (mouth center y=110)
  const SIDE_L   = HEAD_L - 8; // x=88  — left sideburn outer edge
  const SIDE_R   = HEAD_R + 8; // x=192 — right sideburn outer edge

  switch (style) {
    case "moustacheFancy":
      // Waxed curled mustache, sits above upper lip
      return `
        <path d="M${HCX-22} ${STACHE_Y+3}
          Q${HCX-12} ${STACHE_Y-8} ${HCX-3} ${STACHE_Y+1}
          Q${HCX} ${STACHE_Y+4} ${HCX+3} ${STACHE_Y+1}
          Q${HCX+12} ${STACHE_Y-8} ${HCX+22} ${STACHE_Y+3}
          Q${HCX+10} ${STACHE_Y+8} ${HCX+3} ${STACHE_Y+5}
          Q${HCX} ${STACHE_Y+6} ${HCX-3} ${STACHE_Y+5}
          Q${HCX-10} ${STACHE_Y+8} ${HCX-22} ${STACHE_Y+3}Z" ${fl}/>`;

    case "beardLight": {
      // Stubble: small dots on chin/jaw + faint cheek coverage + shadow mustache
      const dots: string[] = [];
      // Chin dots grid
      for (let xi = -3; xi <= 3; xi++) {
        for (let yi = 0; yi <= 2; yi++) {
          dots.push(`<circle cx="${HCX + xi * 8}" cy="${CHIN_Y + yi * 7}" r="2.4" fill="${fc}" opacity="0.62"/>`);
        }
      }
      // Lower cheek dots (sides only — away from face center)
      [[SIDE_L + 4, HCY + 8], [SIDE_L + 6, HCY + 16], [SIDE_L + 4, HCY + 24],
       [SIDE_R - 4, HCY + 8], [SIDE_R - 6, HCY + 16], [SIDE_R - 4, HCY + 24]].forEach(([x, y]) =>
        dots.push(`<circle cx="${x}" cy="${y}" r="2.4" fill="${fc}" opacity="0.55"/>`)
      );
      // Faint shadow mustache line
      dots.push(`<path d="M${HCX-14} ${STACHE_Y+5} Q${HCX} ${STACHE_Y} ${HCX+14} ${STACHE_Y+5}"
        fill="none" stroke="${fc}" stroke-width="3.5" stroke-linecap="round" opacity="0.65"/>`);
      return dots.join("\n");
    }

    case "beardMedium":
      // Solid chin beard + sideburns + mustache — all below/beside face features
      return `
        <!-- Chin beard -->
        <path d="M${HCX-26} ${CHIN_Y-2}
          Q${HCX-28} ${CHIN_Y+20} ${HCX-14} ${CHIN_Y+32}
          Q${HCX} ${CHIN_Y+40} ${HCX+14} ${CHIN_Y+32}
          Q${HCX+28} ${CHIN_Y+20} ${HCX+26} ${CHIN_Y-2}
          Q${HCX+10} ${CHIN_Y+1} ${HCX} ${CHIN_Y-1}
          Q${HCX-10} ${CHIN_Y+1} ${HCX-26} ${CHIN_Y-2}Z" ${fl}/>
        <!-- Left sideburn -->
        <rect x="${SIDE_L}" y="${HCY + 8}" width="12" height="36" rx="5" ${fl}/>
        <!-- Right sideburn -->
        <rect x="${SIDE_R - 12}" y="${HCY + 8}" width="12" height="36" rx="5" ${fl}/>
        <!-- Mustache -->
        <path d="M${HCX-20} ${STACHE_Y+3}
          Q${HCX-8} ${STACHE_Y-6} ${HCX} ${STACHE_Y+1}
          Q${HCX+8} ${STACHE_Y-6} ${HCX+20} ${STACHE_Y+3}
          Q${HCX+8} ${STACHE_Y+7} ${HCX} ${STACHE_Y+5}
          Q${HCX-8} ${STACHE_Y+7} ${HCX-20} ${STACHE_Y+3}Z" ${fl}/>`;

    case "beardMajestic":
      // Full flowing beard + prominent sideburns + thick mustache
      return `
        <!-- Flowing chin beard -->
        <path d="M${HCX-28} ${CHIN_Y-4}
          Q${HCX-36} ${CHIN_Y+30} ${HCX-18} ${CHIN_Y+58}
          Q${HCX} ${CHIN_Y+68} ${HCX+18} ${CHIN_Y+58}
          Q${HCX+36} ${CHIN_Y+30} ${HCX+28} ${CHIN_Y-4}
          Q${HCX+10} ${CHIN_Y} ${HCX} ${CHIN_Y-2}
          Q${HCX-10} ${CHIN_Y} ${HCX-28} ${CHIN_Y-4}Z" ${fl}/>
        <!-- Left sideburn -->
        <rect x="${SIDE_L - 2}" y="${HCY + 4}" width="14" height="52" rx="6" ${fl}/>
        <!-- Right sideburn -->
        <rect x="${SIDE_R - 12}" y="${HCY + 4}" width="14" height="52" rx="6" ${fl}/>
        <!-- Thick mustache -->
        <path d="M${HCX-24} ${STACHE_Y+3}
          Q${HCX-10} ${STACHE_Y-8} ${HCX} ${STACHE_Y}
          Q${HCX+10} ${STACHE_Y-8} ${HCX+24} ${STACHE_Y+3}
          Q${HCX+10} ${STACHE_Y+8} ${HCX} ${STACHE_Y+6}
          Q${HCX-10} ${STACHE_Y+8} ${HCX-24} ${STACHE_Y+3}Z" ${fl}/>`;

    default: return "";
  }
}

// ── Glasses ───────────────────────────────────────────────────────────────────
function glassesSvg(style: string): string {
  if (style === "none") return "";
  const GY = HCY - 2;
  const GLX = HCX - 19;
  const GRX = HCX + 19;
  const ARMS = `
    <line x1="${GLX - 11}" y1="${GY - 1}" x2="${GLX - 20}" y2="${GY - 3}" stroke="${OL}" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="${GRX + 11}" y1="${GY - 1}" x2="${GRX + 20}" y2="${GY - 3}" stroke="${OL}" stroke-width="1.5" stroke-linecap="round"/>`;
  const BRIDGE = (y = GY) => `<line x1="${GLX + 11}" y1="${y}" x2="${GRX - 11}" y2="${y}" stroke="${OL}" stroke-width="1.5"/>`;

  switch (style) {
    case "round":
      return `
        <circle cx="${GLX}" cy="${GY}" r="11" fill="none" stroke="${OL}" stroke-width="2"/>
        <circle cx="${GRX}" cy="${GY}" r="11" fill="none" stroke="${OL}" stroke-width="2"/>
        ${BRIDGE()} ${ARMS}`;
    case "prescription02":
      return `
        <rect x="${GLX-11}" y="${GY-8}" width="22" height="17" rx="5" fill="none" stroke="${OL}" stroke-width="2"/>
        <rect x="${GRX-11}" y="${GY-8}" width="22" height="17" rx="5" fill="none" stroke="${OL}" stroke-width="2"/>
        ${BRIDGE(GY - 1)} ${ARMS}`;
    case "wayfarers":
      return `
        <rect x="${GLX-12}" y="${GY-9}" width="24" height="19" rx="4" fill="none" stroke="${OL}" stroke-width="2"/>
        <rect x="${GRX-12}" y="${GY-9}" width="24" height="19" rx="4" fill="none" stroke="${OL}" stroke-width="2"/>
        ${BRIDGE(GY - 1)} ${ARMS}`;
    case "sunglasses":
      return `
        <rect x="${GLX-12}" y="${GY-8}" width="24" height="17" rx="9" fill="#1a1a2e" stroke="${OL}" stroke-width="2"/>
        <rect x="${GRX-12}" y="${GY-8}" width="24" height="17" rx="9" fill="#1a1a2e" stroke="${OL}" stroke-width="2"/>
        ${BRIDGE()} ${ARMS}`;
    case "prescription01": // aviator
      return `
        <path d="M${GLX-12} ${GY-8} L${GLX+13} ${GY-10} L${GLX+13} ${GY+8} L${GLX-12} ${GY+7}Z" fill="none" stroke="${OL}" stroke-width="2"/>
        <path d="M${GRX-13} ${GY-10} L${GRX+12} ${GY-8} L${GRX+12} ${GY+7} L${GRX-13} ${GY+8}Z" fill="none" stroke="${OL}" stroke-width="2"/>
        ${BRIDGE(GY - 1)} ${ARMS}`;
    default: return "";
  }
}

// ── Clothing / torso + arms ───────────────────────────────────────────────────
function bodySvg(clothing: string, clothesColor: string, bodyType: string, skin: string): string {
  const mt = m(bodyType);
  const SL = HCX - mt.sw / 2; // shoulder left
  const SR = HCX + mt.sw / 2; // shoulder right
  const WL = HCX - mt.ww / 2; // waist left
  const WR = HCX + mt.ww / 2; // waist right
  const torsoBot = SH_Y + mt.ah;

  // Arms hang slightly past torso bottom
  const armTop  = SH_Y + 6;
  const armBot  = torsoBot - 14;
  const handR   = mt.aw / 2 + 2;
  const handCLX = SL - mt.aw / 2;
  const handCRX = SR + mt.aw / 2;

  const shF   = f(clothesColor);
  const skinF = f(skin);

  const torsoPth = `M${SL} ${SH_Y} L${SR} ${SH_Y} L${WR} ${torsoBot} L${WL} ${torsoBot}Z`;
  const collarY  = SH_Y + 6;

  let collar = "";
  switch (clothing) {
    case "shirtVNeck":
      collar = `<path d="M${HCX-14} ${collarY+4} L${HCX} ${collarY+26} L${HCX+14} ${collarY+4}" fill="none" stroke="${OL}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
      break;
    case "hoodie":
      collar = `
        <path d="M${HCX-18} ${collarY} Q${HCX-12} ${collarY+10} ${HCX} ${collarY+12} Q${HCX+12} ${collarY+10} ${HCX+18} ${collarY}" fill="none" stroke="${OL}" stroke-width="2" stroke-linecap="round"/>
        <line x1="${HCX}" y1="${collarY+12}" x2="${HCX}" y2="${torsoBot-8}" stroke="${OL}" stroke-width="1.5" stroke-dasharray="5,4" opacity="0.6"/>`;
      break;
    case "collarAndSweater":
      collar = `
        <rect x="${HCX-14}" y="${collarY-4}" width="28" height="16" rx="3" fill="white" stroke="${OL}" stroke-width="1.5" opacity="0.7"/>
        <line x1="${WL+14}" y1="${SH_Y+36}" x2="${WR-14}" y2="${torsoBot-28}" stroke="${OL}" stroke-width="1" opacity="0.25"/>
        <line x1="${WR-14}" y1="${SH_Y+36}" x2="${WL+14}" y2="${torsoBot-28}" stroke="${OL}" stroke-width="1" opacity="0.25"/>`;
      break;
    case "blazerAndShirt": {
      const lapW = 24, lapH = 44;
      collar = `
        <path d="M${HCX-14} ${collarY} L${HCX-lapW} ${collarY+lapH} L${HCX} ${collarY+lapH-12} L${HCX+lapW} ${collarY+lapH} L${HCX+14} ${collarY}Z"
          fill="${c(clothesColor)}" stroke="${OL}" stroke-width="2"/>
        <rect x="${HCX-8}" y="${collarY}" width="16" height="32" rx="2" fill="white" stroke="${OL}" stroke-width="1" opacity="0.85"/>`;
      break;
    }
    case "graphicShirt":
      collar = `
        <path d="M${HCX-14} ${collarY+2} Q${HCX} ${collarY+14} ${HCX+14} ${collarY+2}" fill="none" stroke="${OL}" stroke-width="2" stroke-linecap="round"/>
        <text x="${HCX}" y="${SH_Y+66}" text-anchor="middle" font-size="16" fill="${OL}" opacity="0.28" font-family="sans-serif">★</text>`;
      break;
    case "overall":
      collar = `
        <rect x="${HCX-18}" y="${collarY-4}" width="36" height="40" rx="5" fill="${OL}" opacity="0.18"/>
        <rect x="${HCX-9}" y="${collarY-12}" width="8" height="26" rx="3" ${shF}/>
        <rect x="${HCX+1}" y="${collarY-12}" width="8" height="26" rx="3" ${shF}/>`;
      break;
    default: // shirtCrewNeck
      collar = `<path d="M${HCX-15} ${collarY+2} Q${HCX} ${collarY+14} ${HCX+15} ${collarY+2}" fill="none" stroke="${OL}" stroke-width="2" stroke-linecap="round"/>`;
  }

  return `
    <rect x="${SL-mt.aw}" y="${armTop}" width="${mt.aw}" height="${armBot-armTop}" rx="${mt.aw/2}" ${shF}/>
    <circle cx="${handCLX}" cy="${armBot+handR}" r="${handR}" ${skinF}/>
    <rect x="${SR}" y="${armTop}" width="${mt.aw}" height="${armBot-armTop}" rx="${mt.aw/2}" ${shF}/>
    <circle cx="${handCRX}" cy="${armBot+handR}" r="${handR}" ${skinF}/>
    <path d="${torsoPth}" ${shF}/>
    ${collar}`;
}

// ── Pants ─────────────────────────────────────────────────────────────────────
function pantsSvg(pantsColor: string, bodyType: string): string {
  const mt = m(bodyType);
  const fl = f(pantsColor);
  const hipY   = SH_Y + mt.ah;
  const legW   = Math.floor(mt.ww / 2) - 2;
  const legH   = 116;
  const hipW   = mt.ww;
  const hipX   = HCX - mt.ww / 2;
  return `
    <rect x="${hipX}" y="${hipY - 4}" width="${hipW}" height="30" rx="10" ${fl}/>
    <rect x="${hipX}" y="${hipY + 20}" width="${legW}" height="${legH}" rx="${legW / 2}" ${fl}/>
    <rect x="${HCX + 2}" y="${hipY + 20}" width="${legW}" height="${legH}" rx="${legW / 2}" ${fl}/>`;
}

// ── Shoes ─────────────────────────────────────────────────────────────────────
function shoesSvg(shoeStyle: string, shoeColor: string, bodyType: string): string {
  const mt = m(bodyType);
  const fl  = f(shoeColor);
  const hipY   = SH_Y + mt.ah;
  const shoeY  = hipY + 20 + 116;
  const legW   = Math.floor(mt.ww / 2) - 2;
  const LX     = HCX - mt.ww / 2;
  const RX     = HCX + 2;
  const sole   = `fill="#1c1c28" stroke="${OL}" stroke-width="2" stroke-linejoin="round"`;

  if (shoeStyle === "boot") {
    return `
      <rect x="${LX-2}" y="${shoeY-18}" width="${legW+4}" height="34" rx="9" ${fl}/>
      <ellipse cx="${LX+legW/2-1}" cy="${shoeY+14}" rx="${legW/2+6}" ry="8" ${sole}/>
      <rect x="${RX-2}" y="${shoeY-18}" width="${legW+4}" height="34" rx="9" ${fl}/>
      <ellipse cx="${RX+legW/2+1}" cy="${shoeY+14}" rx="${legW/2+6}" ry="8" ${sole}/>`;
  }
  if (shoeStyle === "dress") {
    return `
      <path d="M${LX} ${shoeY} L${LX+legW+8} ${shoeY} Q${LX+legW+12} ${shoeY+9} ${LX+legW} ${shoeY+16} L${LX-2} ${shoeY+16}Z" ${fl}/>
      <rect x="${LX-2}" y="${shoeY+14}" width="${legW+10}" height="5" rx="2" ${sole}/>
      <path d="M${RX} ${shoeY} L${RX+legW+8} ${shoeY} Q${RX+legW+12} ${shoeY+9} ${RX+legW} ${shoeY+16} L${RX-2} ${shoeY+16}Z" ${fl}/>
      <rect x="${RX-2}" y="${shoeY+14}" width="${legW+10}" height="5" rx="2" ${sole}/>`;
  }
  // Sneaker
  return `
    <rect x="${LX-2}" y="${shoeY-2}" width="${legW+4}" height="20" rx="9" ${fl}/>
    <ellipse cx="${LX+legW/2-1}" cy="${shoeY+17}" rx="${legW/2+6}" ry="7" fill="#e8e8e8" stroke="${OL}" stroke-width="2"/>
    <line x1="${LX+4}" y1="${shoeY+7}" x2="${LX+legW-2}" y2="${shoeY+7}" stroke="white" stroke-width="1.5" opacity="0.45" stroke-linecap="round"/>
    <rect x="${RX-2}" y="${shoeY-2}" width="${legW+4}" height="20" rx="9" ${fl}/>
    <ellipse cx="${RX+legW/2+1}" cy="${shoeY+17}" rx="${legW/2+6}" ry="7" fill="#e8e8e8" stroke="${OL}" stroke-width="2"/>
    <line x1="${RX+4}" y1="${shoeY+7}" x2="${RX+legW-2}" y2="${shoeY+7}" stroke="white" stroke-width="1.5" opacity="0.45" stroke-linecap="round"/>`;
}

// ── Main composer ─────────────────────────────────────────────────────────────
export function spriteSvg(sel: Record<string, string>, bg?: string): string {
  const skin = sel.skinColor ?? "edb98a";
  const bt   = sel.bodyType  ?? "average";
  const skinF = f(skin);

  const bgEl = (bg && bg !== "transparent")
    ? `<rect width="${SPRITE_VIEW.w}" height="${SPRITE_VIEW.h}" fill="${bg}"/>`
    : "";

  const top   = sel.top      ?? "shortFlat";
  const hcol  = sel.hairColor ?? "2c1b18";

  return `<svg viewBox="0 0 ${SPRITE_VIEW.w} ${SPRITE_VIEW.h}" xmlns="http://www.w3.org/2000/svg">
  ${bgEl}
  <!-- Ground shadow -->
  <ellipse cx="${HCX}" cy="462" rx="74" ry="9" fill="#000000" opacity="0.08"/>

  <!-- Body (behind everything) -->
  ${bodySvg(sel.clothing ?? "shirtCrewNeck", sel.clothesColor ?? "25557c", bt, skin)}
  ${pantsSvg(sel.pantsColor ?? "2f3a4b", bt)}
  ${shoesSvg(sel.shoeStyle ?? "sneaker", sel.shoeColor ?? "23272e", bt)}

  <!-- Hair BACK — behind head; head ellipse masks the face area naturally -->
  ${hairBackSvg(top, hcol)}

  <!-- Neck + Ears -->
  <rect x="${HCX - NK_W/2}" y="${NK_Y}" width="${NK_W}" height="${NK_H}" rx="8" ${skinF}/>
  <ellipse cx="${HEAD_L - 5}" cy="${HCY + 2}" rx="9" ry="12" ${skinF}/>
  <ellipse cx="${HEAD_R + 5}" cy="${HCY + 2}" rx="9" ry="12" ${skinF}/>

  <!-- Head — paints skin over hair back, keeping face clear -->
  <ellipse cx="${HCX}" cy="${HCY}" rx="${HRX}" ry="${HRY}" ${skinF}/>

  <!-- Hair CAP — crown detail, above brow line only -->
  ${hairCapSvg(top, hcol)}

  <!-- Facial hair BEFORE eyes/mouth so face features render on top -->
  ${facialHairSvg(sel.facialHair ?? "none", sel.facialHairColor ?? "2c1b18")}

  <!-- Face features -->
  ${eyebrowsSvg(sel.eyebrows ?? "defaultNatural")}
  ${eyesSvg(sel.eyes ?? "default")}
  <ellipse cx="${HCX}" cy="${HCY + 12}" rx="3" ry="2" fill="${OL}" opacity="0.18"/>
  ${mouthSvg(sel.mouth ?? "smile")}
  ${glassesSvg(sel.accessories ?? "none")}
</svg>`;
}

// ── Bust crop (for circle Avatar component) ────────────────────────────────────
// Crops to viewBox="0 16 280 256" — shows head + just the shoulder tops.
export const BUST_CROP = { x: 0, y: 16, w: SPRITE_VIEW.w, h: 256 };

export function spriteBustSvg(sel: Record<string, string>): string {
  return spriteSvg(sel).replace(
    `viewBox="0 0 ${SPRITE_VIEW.w} ${SPRITE_VIEW.h}"`,
    `viewBox="${BUST_CROP.x} ${BUST_CROP.y} ${BUST_CROP.w} ${BUST_CROP.h}"`,
  );
}
