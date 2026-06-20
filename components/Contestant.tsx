import { memo, useEffect, useMemo, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { SvgXml } from "react-native-svg";

import type { AvatarConfig } from "../engine/types";
import { palette, typography } from "../theme";
import { PERSON_VIEW, personSvg, resolveLook } from "./contestantLook";
import { SPRITE_IMAGES } from "./spriteImages";

type Props = {
  config: AvatarConfig;
  name?: string;
  /** Scale knob; the whole figure sizes from this. */
  size?: number;
  /** Status color (used as a soft glow/ground tint — never reveals correctness mid-question). */
  ringColor?: string;
  dimmed?: boolean;
  /** Small badge shown above the head, e.g. "★" winner. */
  badge?: string;
  badgeColor?: string;
  /** Play a brief sparkle burst when true (fires once per mount/change). */
  sparkle?: boolean;
};

/** Full-body, head-to-toe standing contestant (§6.1): the customized avataaars head +
 *  upper body welded to a matching lower body — one connected person, no circle frame. */
export const Contestant = memo(function Contestant({
  config,
  name,
  size = 44,
  ringColor,
  dimmed,
  badge,
  badgeColor = palette.accent,
  sparkle,
}: Props) {
  const spriteId = config.selection?.spriteIndex ?? null;
  const look = useMemo(() => (spriteId ? {} : resolveLook(config)), [config, spriteId]);
  const xml = useMemo(() => (spriteId ? null : personSvg(config, look)), [config, look, spriteId]);

  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(badge ? 1 : 0)).current;

  useEffect(() => {
    if (!badge) {
      opacity.setValue(0);
      return;
    }
    opacity.setValue(1);
    if (sparkle) {
      scale.setValue(2.2);
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }).start();
    } else {
      scale.setValue(1);
    }
  }, [badge, sparkle]);

  const figW = Math.round(size * 1.45);
  // PNG sprites are square images — use square container to avoid wasted vertical space.
  const figH = spriteId ? figW : Math.round((figW * PERSON_VIEW.h) / PERSON_VIEW.w);

  return (
    <View
      style={[{ width: figW, height: figH, opacity: dimmed ? 0.4 : 1, overflow: "visible" }]}
      accessibilityLabel={name ? `${name} contestant` : undefined}
    >
      {/* Soft status glow behind the feet. */}
      {ringColor && ringColor !== palette.neutral ? (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            alignSelf: "center",
            width: figW * 0.45,
            height: 4,
            borderRadius: 2,
            backgroundColor: ringColor,
            opacity: 0.7,
          }}
        />
      ) : null}
      {spriteId && SPRITE_IMAGES[spriteId] ? (
        <Image
          source={SPRITE_IMAGES[spriteId]}
          // @ts-ignore — imageRendering is web-only CSS; RN ignores unknown style keys
          style={{ width: figW, height: figH, imageRendering: "pixelated" }}
          resizeMode="contain"
        />
      ) : (
        <SvgXml xml={xml!} width={figW} height={figH} />
      )}
      {badge ? (
        <Animated.View
          style={[
            styles.badge,
            { backgroundColor: badgeColor, opacity, transform: [{ scale }] },
          ]}
        >
          <Text style={styles.badgeText}>{badge}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -14,
    alignSelf: "center",
    left: "50%",
    marginLeft: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: palette.stage,
  },
  badgeText: { color: palette.onAccent, fontSize: 11, fontFamily: typography.fonts.display },
});
