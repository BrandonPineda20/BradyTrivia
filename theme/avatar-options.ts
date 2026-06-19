/**
 * Parametric avatar catalog (spec §6.1) — drives the one-screen builder and maps
 * a flat selection to DiceBear "avataaars" options. Bots use the same style with
 * just a seed (randomized), so everyone matches the art style (§5.2).
 */
export const AVATAR_STYLE = "avataaars";

export type AvatarAttr = {
  key: string; // DiceBear option key
  label: string;
  values: string[]; // variant names, or hex (isColor), or "none"
  isColor?: boolean;
  /** When set, "none" toggles this probability option to 0 (else 100). */
  probabilityKey?: string;
};

export const ATTRIBUTES: AvatarAttr[] = [
  { key: "skinColor", label: "Skin", isColor: true, values: ["edb98a", "ffdbb4", "fd9841", "d08b5b", "ae5d29", "614335"] },
  { key: "top", label: "Hair", values: ["shortFlat", "shortCurly", "shortWaved", "theCaesar", "bob", "bun", "curly", "curvy", "dreads", "fro", "longButNotTooLong", "straight01", "hat", "turban", "hijab"] },
  { key: "hairColor", label: "Hair color", isColor: true, values: ["2c1b18", "4a312c", "724133", "a55728", "b58143", "d6b370", "e8e1e1", "f59797"] },
  { key: "eyes", label: "Eyes", values: ["default", "happy", "wink", "squint", "surprised", "hearts", "side", "closed"] },
  { key: "eyebrows", label: "Brows", values: ["defaultNatural", "raisedExcitedNatural", "flatNatural", "angryNatural", "sadConcernedNatural", "upDownNatural"] },
  { key: "mouth", label: "Mouth", values: ["smile", "default", "twinkle", "serious", "tongue", "grimace"] },
  { key: "facialHair", label: "Facial hair", probabilityKey: "facialHairProbability", values: ["none", "beardLight", "beardMedium", "beardMajestic", "moustacheFancy"] },
  { key: "facialHairColor", label: "Beard color", isColor: true, values: ["2c1b18", "4a312c", "724133", "a55728", "b58143", "d6b370", "e8e1e1", "f59797"] },
  { key: "clothing", label: "Outfit", values: ["hoodie", "shirtCrewNeck", "blazerAndShirt", "collarAndSweater", "graphicShirt", "overall", "shirtVNeck"] },
  { key: "clothesColor", label: "Outfit color", isColor: true, values: ["3c4f5c", "65c9ff", "5199e4", "25557c", "ff488e", "ff5c5c", "a7ffc4", "ffffb1", "929598", "ffffff"] },
  { key: "accessories", label: "Glasses", probabilityKey: "accessoriesProbability", values: ["none", "round", "wayfarers", "sunglasses", "prescription01", "prescription02"] },
  { key: "backgroundColor", label: "Background", isColor: true, values: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf", "transparent"] },
];

export type AvatarSelection = Record<string, string>;

/** A clean default look (first variant of each; no facial hair / glasses). */
export const DEFAULT_SELECTION: AvatarSelection = Object.fromEntries(
  ATTRIBUTES.map((a) => [a.key, a.values[0]]),
);

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
