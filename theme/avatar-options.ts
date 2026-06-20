/**
 * Parametric avatar catalog (spec §6.1) — drives the two-section builder
 * (Appearance + Wardrobe) and maps a flat selection to DiceBear "avataaars"
 * options. Bots use the same style with just a seed (randomized), so everyone
 * matches the art style (§5.2).
 */
export const AVATAR_STYLE = "avataaars";

export type AvatarSection = "appearance" | "wardrobe";

export type AvatarAttr = {
  key: string; // DiceBear option key (or a synthesized-body key like bodyType)
  label: string;
  section: AvatarSection;
  /** Decorative emoji shown beside the control label. */
  icon: string;
  values: string[]; // variant names, or hex (isColor), or "none" / "transparent"
  isColor?: boolean;
  /** When set, "none" toggles this probability option to 0 (else 100). */
  probabilityKey?: string;
};

/** The two builder tabs, in order. */
export const SECTIONS: { key: AvatarSection; label: string; icon: string }[] = [
  { key: "appearance", label: "Appearance", icon: "🧑" },
  { key: "wardrobe", label: "Wardrobe", icon: "👕" },
];

export const ATTRIBUTES: AvatarAttr[] = [
  // ── Appearance ───────────────────────────────────────────────────────────
  { key: "skinColor", label: "Skin tone", section: "appearance", icon: "🎨", isColor: true,
    values: ["edb98a", "ffdbb4", "fd9841", "d08b5b", "ae5d29", "614335"] },
  { key: "bodyType", label: "Body type", section: "appearance", icon: "💪",
    values: ["average", "slim", "athletic", "heavy"] },
  { key: "top", label: "Hair", section: "appearance", icon: "💇",
    values: ["shortFlat", "shortCurly", "shortWaved", "theCaesar", "curly", "curvy", "fro", "dreads", "bob", "bun", "longButNotTooLong", "straight01"] },
  { key: "hairColor", label: "Hair color", section: "appearance", icon: "🖌️", isColor: true,
    values: ["2c1b18", "4a312c", "724133", "a55728", "b58143", "d6b370", "e8e1e1", "f59797"] },
  { key: "eyes", label: "Eyes", section: "appearance", icon: "👀",
    values: ["default", "happy", "wink", "squint", "surprised", "hearts", "side", "closed"] },
  { key: "eyebrows", label: "Eyebrows", section: "appearance", icon: "〽️",
    values: ["defaultNatural", "raisedExcitedNatural", "flatNatural", "angryNatural", "sadConcernedNatural", "upDownNatural"] },
  { key: "mouth", label: "Mouth", section: "appearance", icon: "😀",
    values: ["smile", "default", "twinkle", "serious", "tongue", "grimace"] },
  { key: "facialHair", label: "Facial hair", section: "appearance", icon: "🧔", probabilityKey: "facialHairProbability",
    values: ["none", "beardLight", "beardMedium", "beardMajestic", "moustacheFancy"] },
  { key: "facialHairColor", label: "Beard color", section: "appearance", icon: "🖌️", isColor: true,
    values: ["2c1b18", "4a312c", "724133", "a55728", "b58143", "d6b370", "e8e1e1", "f59797"] },
  { key: "backgroundColor", label: "Backdrop", section: "appearance", icon: "🌈", isColor: true,
    values: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf", "ffffff", "transparent"] },

  // ── Wardrobe ─────────────────────────────────────────────────────────────
  { key: "clothing", label: "Outfit", section: "wardrobe", icon: "👕",
    values: ["shirtCrewNeck", "shirtVNeck", "hoodie", "collarAndSweater", "blazerAndShirt", "graphicShirt", "overall"] },
  { key: "clothesColor", label: "Outfit color", section: "wardrobe", icon: "🎨", isColor: true,
    values: ["25557c", "3c4f5c", "5199e4", "65c9ff", "2e7d4f", "a7ffc4", "c0392b", "ff5c5c", "ff488e", "8e44ad", "ffd23f", "ffffff"] },
  { key: "pantsColor", label: "Pants", section: "wardrobe", icon: "👖", isColor: true,
    values: ["2f3a4b", "1b1d22", "37474f", "3e4c5e", "283593", "1a237e", "5a4633", "4e342e"] },
  { key: "shoeStyle", label: "Shoes", section: "wardrobe", icon: "👟",
    values: ["sneaker", "boot", "dress"] },
  { key: "shoeColor", label: "Shoe color", section: "wardrobe", icon: "🎨", isColor: true,
    values: ["23272e", "5d4037", "ffffff", "c62828", "1565c0", "2e7d32", "f9a825", "7e57c2"] },
  { key: "accessories", label: "Glasses", section: "wardrobe", icon: "👓", probabilityKey: "accessoriesProbability",
    values: ["none", "round", "wayfarers", "sunglasses", "prescription01", "prescription02"] },
];

export type AvatarSelection = Record<string, string>;

/** Attributes belonging to one builder tab, in display order. */
export function attrsFor(section: AvatarSection): AvatarAttr[] {
  return ATTRIBUTES.filter((a) => a.section === section);
}

/** A clean, friendly default look (first variant of each). */
export const DEFAULT_SELECTION: AvatarSelection = Object.fromEntries(
  ATTRIBUTES.map((a) => [a.key, a.values[0]]),
);

/** Build a full selection from the default plus a handful of overrides. */
function preset(over: AvatarSelection): AvatarSelection {
  return { ...DEFAULT_SELECTION, ...over };
}

export type AvatarPreset = {
  key: string;
  name: string;
  tagline: string;
  selection: AvatarSelection;
};

/**
 * Three ready-made contestants the user can start from. Built from the real
 * reference photos in /assets, re-drawn in the avataaars art style.
 */
export const PRESETS: AvatarPreset[] = [
  {
    key: "isaac",
    name: "Isaac",
    tagline: "Curly hair · aviators",
    selection: preset({
      skinColor: "d08b5b",
      bodyType: "slim",
      top: "curly",
      hairColor: "2c1b18",
      eyes: "happy",
      eyebrows: "defaultNatural",
      mouth: "smile",
      facialHair: "moustacheFancy",
      facialHairColor: "2c1b18",
      clothing: "shirtCrewNeck",
      clothesColor: "c0392b",
      pantsColor: "2f3a4b",
      shoeStyle: "sneaker",
      shoeColor: "23272e",
      accessories: "prescription01",
      backgroundColor: "ffd5dc",
    }),
  },
  {
    key: "jake",
    name: "Jake",
    tagline: "Team USA · athletic",
    selection: preset({
      skinColor: "ffdbb4",
      bodyType: "athletic",
      top: "shortWaved",
      hairColor: "724133",
      eyes: "happy",
      eyebrows: "defaultNatural",
      mouth: "smile",
      facialHair: "beardLight",
      facialHairColor: "724133",
      clothing: "shirtCrewNeck",
      clothesColor: "25557c",
      pantsColor: "1b1d22",
      shoeStyle: "sneaker",
      shoeColor: "ffffff",
      accessories: "none",
      backgroundColor: "b6e3f4",
    }),
  },
  {
    key: "anderson",
    name: "Anderson",
    tagline: "Long hair · argyle",
    selection: preset({
      skinColor: "ffdbb4",
      bodyType: "heavy",
      top: "longButNotTooLong",
      hairColor: "a55728",
      eyes: "default",
      eyebrows: "defaultNatural",
      mouth: "serious",
      facialHair: "beardMedium",
      facialHairColor: "a55728",
      clothing: "collarAndSweater",
      clothesColor: "2e7d4f",
      pantsColor: "1b1d22",
      shoeStyle: "sneaker",
      shoeColor: "23272e",
      accessories: "prescription02",
      backgroundColor: "d1d4f9",
    }),
  },
];

/** Map a flat selection to DiceBear options (single-pick arrays + probabilities). */
export function buildAvatarOptions(selection: AvatarSelection): Record<string, unknown> {
  const opts: Record<string, unknown> = {};
  for (const attr of ATTRIBUTES) {
    const val = selection[attr.key];
    if (val == null) continue;
    if (attr.probabilityKey) {
      if (val === "none") opts[attr.probabilityKey] = 0;
      else {
        opts[attr.key] = [val];
        opts[attr.probabilityKey] = 100;
      }
    } else if (attr.isColor && val === "transparent") {
      // omit → transparent background
    } else {
      opts[attr.key] = [val];
    }
  }
  return opts;
}

/** Random selection for the "shuffle" button / first-run starting point. */
export function randomSelection(rand: () => number = Math.random): AvatarSelection {
  const sel: AvatarSelection = {};
  for (const attr of ATTRIBUTES) {
    sel[attr.key] = attr.values[Math.floor(rand() * attr.values.length)];
  }
  return sel;
}
