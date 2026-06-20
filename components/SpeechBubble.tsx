import { StyleSheet, Text, View } from "react-native";

import { palette, radii, spacing, typography } from "../theme";

type Tint = "neutral" | "correct" | "wrong";

const BG: Record<Tint, string> = {
  neutral: "#FFFFFF",
  correct: "#E6FBF0", // green-tinted (§10.2)
  wrong: "#FFECEC", // red-tinted (§10.2)
};
const BORDER: Record<Tint, string> = {
  neutral: palette.neutral,
  correct: palette.correct,
  wrong: palette.incorrect,
};

/** Brady's speech bubble. Host "speaks" via text bubbles for the MVP (§6.2). */
export function SpeechBubble({ text, tint = "neutral" }: { text: string; tint?: Tint }) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.tail, { borderBottomColor: BORDER[tint] }]} />
      <View style={[styles.tailFill, { borderBottomColor: BG[tint] }]} />
      <View style={[styles.bubble, { backgroundColor: BG[tint], borderColor: BORDER[tint] }]}>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", maxWidth: 420, alignSelf: "center" },
  bubble: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    borderRadius: radii.lg,
    borderWidth: 2,
  },
  text: {
    color: palette.ink,
    fontSize: typography.size.md,
    fontFamily: typography.fonts.body,
    textAlign: "center",
  },
  tail: {
    position: "absolute",
    top: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderBottomWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  tailFill: {
    position: "absolute",
    top: -7,
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    zIndex: 1,
  },
});
