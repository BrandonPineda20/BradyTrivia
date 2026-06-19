import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SvgXml } from "react-native-svg";

import type { AvatarConfig } from "../engine/types";
import { palette, typography } from "../theme";
import { PERSON_VIEW, personSvg, resolveLook } from "./contestantLook";

type Props = {
  config: AvatarConfig;
  name?: string;
  /** Scale knob; the whole figure sizes from this. */
  size?: number;
  /** Status color (used as a soft glow/ground tint — never reveals correctness mid-question). */
  ringColor?: string;
  dimmed?: boolean;
  /** Small corner badge, e.g. "✓" advanced / "★" winner. */
  badge?: string;
  badgeColor?: string;
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
}: Props) {
  const look = useMemo(() => resolveLook(config), [config]);
  const xml = useMemo(() => personSvg(config, look), [config, look]);

  const figW = Math.round(size * 1.45);
  const figH = Math.round((figW * PERSON_VIEW.h) / PERSON_VIEW.w);

  return (
    <View
      style={[{ width: figW, height: figH, opacity: dimmed ? 0.4 : 1 }]}
      accessibilityLabel={name ? `${name} contestant` : undefined}
    >
      {/* Soft status glow behind the feet, in place of the old ring. */}
      {ringColor && ringColor !== palette.neutral ? (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            alignSelf: "center",
            width: figW * 0.8,
            height: 8,
            borderRadius: 4,
            backgroundColor: ringColor,
            opacity: 0.55,
          }}
        />
      ) : null}
      <SvgXml xml={xml} width={figW} height={figH} />
      {badge ? (
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: "8%",
    right: "10%",
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
