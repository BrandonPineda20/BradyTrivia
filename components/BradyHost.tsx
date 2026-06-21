import { Image, StyleSheet, Text, View } from "react-native";

import { bradyPhoto, palette, shadow, type HostExpression } from "../theme";
import { Spotlight } from "./Spotlight";

/**
 * Brady host (§6.2) — his real photo, circle-masked with the brand ring and a
 * stage-light glow so he pops on the white stage. Because it's one photo, his
 * "expression" reads through a small reaction badge (🤔/🔥/🏆…) that changes with
 * game state. Swap the photo in theme/assets `bradyPhoto`.
 */
const REACTION: Record<HostExpression, string | null> = {
  idle: null,
  neutral: null,
  asking: null,
  tension: null,
  correct: null,
  wrong: null,
  champion: null,
};

export function BradyHost({
  expression = "idle",
  size = 150,
  glow = true,
}: {
  expression?: HostExpression;
  size?: number;
  glow?: boolean;
}) {
  const reaction = REACTION[expression];
  const ring = expression === "champion" ? palette.accent : expression === "correct" ? palette.correct : expression === "wrong" ? palette.incorrect : palette.accent;
  const badgeScale = Math.max(0.78, size / 150);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {glow ? <Spotlight size={Math.round(size * 2.1)} intensity={expression === "champion" ? 0.7 : 0.5} /> : null}
      <View
        style={[
          styles.ring,
          { width: size, height: size, borderRadius: size / 2, borderColor: ring },
        ]}
      >
        <Image source={bradyPhoto} style={{ width: size, height: size }} resizeMode="cover" />
      </View>
      {reaction ? (
        <View style={[styles.badge, { transform: [{ scale: badgeScale }] }]}>
          <Text style={styles.badgeText}>{reaction}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  ring: {
    overflow: "hidden",
    borderWidth: 4,
    backgroundColor: palette.surface,
  },
  badge: {
    position: "absolute",
    bottom: -18,
    right: -18,
    minWidth: 40,
    height: 40,
    paddingHorizontal: 4,
    borderRadius: 20,
    backgroundColor: palette.stage,
    borderWidth: 3,
    borderColor: palette.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 20 },
});
