import { memo, useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SvgXml } from "react-native-svg";

import type { AvatarConfig } from "../engine/types";
import { palette, typography } from "../theme";
import { avatarSvg } from "./avatarSvg";
import { SPRITE_IMAGES } from "./spriteImages";

type Props = {
  config: AvatarConfig;
  name?: string;
  size?: number;
  /** Ring color around the avatar (status cue — never reveals correctness mid-question). */
  ringColor?: string;
  dimmed?: boolean;
  /** Small corner badge, e.g. "✓" advanced / "★" winner. */
  badge?: string;
  badgeColor?: string;
  /** Crop to face only — zooms into the top portion of the sprite. */
  faceOnly?: boolean;
};

/** Circle avatar — renders a PNG sprite if spriteIndex is set, else SVG. */
export const Avatar = memo(function Avatar({
  config,
  name,
  size = 56,
  ringColor = palette.neutral,
  dimmed,
  badge,
  badgeColor = palette.accent,
  faceOnly,
}: Props) {
  const spriteId = config.selection?.spriteIndex ?? null;
  const xml = useMemo(
    () => (spriteId ? null : avatarSvg(config, size)),
    [config, size, spriteId],
  );

  // Zoom into the top portion of the sprite; shift the image down slightly
  // so the face lands at the vertical center of the circle.
  const faceImgSize = size * 2.4;
  const faceTop = size * -0.12; // negative = shift image downward

  return (
    <View style={{ opacity: dimmed ? 0.4 : 1 }} accessibilityLabel={name ? `${name} avatar` : undefined}>
      <View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2, borderColor: ringColor },
        ]}
      >
        {spriteId && SPRITE_IMAGES[spriteId] ? (
          faceOnly ? (
            <Image
              source={SPRITE_IMAGES[spriteId]}
              // @ts-ignore
              style={{ width: faceImgSize, height: faceImgSize, position: "absolute", top: -faceTop, left: -(faceImgSize - size) / 2, imageRendering: "pixelated" }}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={SPRITE_IMAGES[spriteId]}
              // @ts-ignore
              style={{ width: size, height: size, imageRendering: "pixelated" }}
              resizeMode="cover"
            />
          )
        ) : (
          <SvgXml xml={xml!} width={size} height={size} />
        )}
      </View>
      {badge ? (
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  circle: {
    overflow: "hidden",
    borderWidth: 3,
    backgroundColor: palette.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 3,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: palette.stage,
  },
  badgeText: { color: palette.onAccent, fontSize: 11, fontWeight: typography.weight.heavy },
});
