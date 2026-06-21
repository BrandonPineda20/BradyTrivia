/** Static require map for all selectable PNG character avatars. */
export const SPRITE_IMAGES: Record<string, ReturnType<typeof require>> = {
  Contestant1:   require("../assets/Avatars/Characters/Default Guy V2.png"),
  Contestant2:   require("../assets/Avatars/Characters/Default Girl.png"),
  Anderson:      require("../assets/Avatars/Characters/Anderson.png"),
  Garrett:       require("../assets/Avatars/Characters/Andrew.png"),
  Ashli:         require("../assets/Avatars/Characters/Ashli.png"),
  Ben:           require("../assets/Avatars/Characters/Ben.png"),
  Brady:         require("../assets/Avatars/Characters/Brady.png"),
  Branden:       require("../assets/Avatars/Characters/Branden.png"),
  Brandi:        require("../assets/Avatars/Characters/Brandi.png"),
  Fortune:       require("../assets/Avatars/Characters/Fortune.png"),
  Isaac:         require("../assets/Avatars/Characters/Isaac.png"),
  Jake:          require("../assets/Avatars/Characters/Jake.png"),
  Landon:        require("../assets/Avatars/Characters/Landon.png"),
  Lauren:        require("../assets/Avatars/Characters/Lauren.png"),
  Miles:         require("../assets/Avatars/Characters/Miles.png"),
  Owen:          require("../assets/Avatars/Characters/Owen.png"),
  Pablo:         require("../assets/Avatars/Characters/Pablo.png"),
  Reda:          require("../assets/Avatars/Characters/Reda.png"),
  Robert:        require("../assets/Avatars/Characters/Robert.png"),
  Shea:          require("../assets/Avatars/Characters/Shea.png"),
  Andrew:        require("../assets/Avatars/Characters/Soluna.png"),
};

export const SPRITE_IDS = Object.keys(SPRITE_IMAGES) as AvatarKey[];
export type AvatarKey = keyof typeof SPRITE_IMAGES;

/** Human-readable display name for each avatar key. */
export const SPRITE_LABELS: Record<string, string> = {
  Contestant1: "Contestant #1",
  Contestant2: "Contestant #2",
};
export function spriteLabel(key: string): string {
  return SPRITE_LABELS[key] ?? key;
}
