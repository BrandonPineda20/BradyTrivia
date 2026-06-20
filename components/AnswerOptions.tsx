import { Pressable, StyleSheet, Text, View } from "react-native";

import { palette, radii, shadow, spacing, typography } from "../theme";

const LETTERS = ["A", "B", "C", "D"];

type Props = {
  options: string[];
  onPick: (option: string) => void;
  locked: boolean;
  humanPick?: string;
  /** When set, the question is revealed: color correct/incorrect (§4.6). */
  reveal?: { correctAnswer: string };
};

/** R1/R2 multiple-choice: four big tap buttons (§7). */
export function AnswerOptions({ options, onPick, locked, humanPick, reveal }: Props) {
  return (
    <View style={styles.grid}>
      {options.map((opt, i) => {
        const isPick = humanPick === opt;
        let bg: string = palette.stage;
        let border: string = palette.hairline;
        let fg: string = palette.ink;

        if (reveal) {
          if (opt === reveal.correctAnswer) {
            bg = palette.correct;
            border = palette.correct;
            fg = palette.onPrimary;
          } else if (isPick) {
            bg = palette.incorrect;
            border = palette.incorrect;
            fg = palette.onPrimary;
          }
        } else if (isPick) {
          border = palette.primary;
          bg = "#EAF1FF";
        }

        return (
          <Pressable
            key={i}
            disabled={locked || !!reveal}
            onPress={() => onPick(opt)}
            style={({ pressed }) => [
              styles.opt,
              !reveal && shadow.sm,
              { backgroundColor: bg, borderColor: border },
              pressed && !locked && !reveal && styles.pressed,
            ]}
          >
            <View style={[styles.letter, reveal && opt === reveal.correctAnswer && styles.letterOnColor]}>
              <Text style={styles.letterText}>{LETTERS[i]}</Text>
            </View>
            <Text style={[styles.optText, { color: fg }]} numberOfLines={2}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing(1.5), width: "100%", maxWidth: 460, alignSelf: "center" },
  opt: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
    paddingVertical: spacing(2.5),
    paddingHorizontal: spacing(3),
    borderRadius: radii.lg,
    borderWidth: 2,
  },
  pressed: { transform: [{ scale: 0.99 }], opacity: 0.9 },
  letter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  letterOnColor: { backgroundColor: "rgba(255,255,255,0.35)" },
  letterText: { color: palette.onPrimary, fontFamily: typography.fonts.display, fontSize: typography.size.sm },
  optText: { flex: 1, fontSize: typography.size.md, fontFamily: typography.fonts.body },
});
