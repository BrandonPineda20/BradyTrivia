import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SvgXml } from "react-native-svg";

import type { AvatarConfig } from "../engine/types";
import { palette, shadow, typography } from "../theme";
import { avatarSvg } from "./avatarSvg";

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
};

/** Parametric cartoon avatar (DiceBear "avataaars", §6.1), clipped to a circle. */
export const Avatar = memo(function Avatar({
  config,
  name,
  size = 56,
  ringColor = palette.neutral,
  dimmed,
  badge,
  badgeColor = palette.accent,
}: Props) {
  const xml = useMemo(() => avatarSvg(config, size), [config, size]);
  return (
    <View style={{ opacity: dimmed ? 0.4 : 1 }} accessibilityLabel={name ? `${name} avatar` : undefined}>
      <View
        style={[
          styles.circle,
          shadow.sm,
          { width: size, height: size, borderRadius: size / 2, borderColor: ringColor },
        ]}
      >
        <SvgXml xml={xml} width={size} height={size} />
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
