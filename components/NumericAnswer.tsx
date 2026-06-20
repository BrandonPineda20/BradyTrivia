import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { palette, radii, spacing, typography } from "../theme";

type Props = {
  unit: string;
  onSubmit: (value: string) => void;
  locked: boolean;
  submittedValue?: string;
  reveal?: { correctAnswer: number; humanGuess?: string; distance?: number };
};

/** R3 numeric estimate: typed number + unit (§4.5). */
export function NumericAnswer({ unit, onSubmit, locked, submittedValue, reveal }: Props) {
  // Store raw digits/decimal only; display with commas (except years).
  const [raw, setRaw] = useState("");

  const isYear = unit === "year";
  const formatted = isYear ? raw : raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const handleChange = (input: string) => {
    // Strip everything except digits and one decimal point
    const clean = input.replace(/,/g, "").replace(/[^\d.]/g, "");
    // Allow only one decimal point
    const parts = clean.split(".");
    const normalized = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : clean;
    setRaw(normalized);
  };

  if (reveal) {
    return (
      <View style={styles.revealWrap}>
        <Text style={styles.answerLabel}>ANSWER</Text>
        <Text style={styles.answerVal}>
          {isYear ? reveal.correctAnswer : reveal.correctAnswer.toLocaleString()} {unit}
        </Text>
        {reveal.humanGuess !== undefined ? (
          <Text style={styles.yourGuess}>
            You: {reveal.humanGuess}
            {reveal.distance !== undefined ? `  ·  off by ${isYear ? reveal.distance : reveal.distance.toLocaleString()}` : ""}
          </Text>
        ) : null}
      </View>
    );
  }

  if (locked) {
    return (
      <View style={styles.lockedWrap}>
        <Text style={styles.lockedText}>
          Locked in: {submittedValue} {unit}
        </Text>
      </View>
    );
  }

  const canSubmit = raw.trim().length > 0;
  return (
    <View style={styles.wrap}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={formatted}
          onChangeText={handleChange}
          keyboardType="numeric"
          placeholder="Your estimate"
          placeholderTextColor={palette.neutral}
          onSubmitEditing={() => canSubmit && onSubmit(raw)}
          returnKeyType="done"
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
      <Pressable
        disabled={!canSubmit}
        onPress={() => onSubmit(raw)}
        style={[styles.submit, !canSubmit && { opacity: 0.4 }]}
      >
        <Text style={styles.submitText}>Lock it in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", maxWidth: 420, alignSelf: "center", gap: spacing(3) },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(2),
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(4),
    borderWidth: 2,
    borderColor: palette.surface,
  },
  input: {
    flex: 1,
    paddingVertical: spacing(3.5),
    fontSize: typography.size.xl,
    fontFamily: typography.fonts.display,
    color: palette.ink,
  },
  unit: { fontSize: typography.size.md, color: palette.inkSoft, fontFamily: typography.fonts.body },
  submit: {
    backgroundColor: palette.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing(3.5),
    alignItems: "center",
  },
  submitText: { color: palette.onPrimary, fontFamily: typography.fonts.display, fontSize: typography.size.lg },
  lockedWrap: {
    padding: spacing(4),
    borderRadius: radii.lg,
    backgroundColor: "#EAF1FF",
    borderWidth: 2,
    borderColor: palette.primary,
    alignSelf: "center",
  },
  lockedText: { color: palette.primary, fontFamily: typography.fonts.display, fontSize: typography.size.md },
  revealWrap: { alignItems: "center", gap: 4 },
  answerLabel: { color: palette.inkSoft, fontSize: typography.size.xs, letterSpacing: 2, fontFamily: typography.fonts.body },
  answerVal: { color: palette.correct, fontSize: typography.size.xl, fontFamily: typography.fonts.display },
  yourGuess: { color: palette.inkSoft, fontSize: typography.size.sm, fontFamily: typography.fonts.body },
});
