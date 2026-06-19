import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { palette, radii, spacing, typography } from "../theme";

export type ListEntryView = { text: string; valid: boolean };

type Props = {
  onAdd: (text: string) => void;
  entries: ListEntryView[];
  validCount: number;
  totalPossible: number | "open";
  disabled?: boolean;
};

/** Final round: type a running list, live valid tally (§4.6). */
export function ListAnswer({ onAdd, entries, validCount, totalPossible, disabled }: Props) {
  const [text, setText] = useState("");
  const submit = () => {
    if (text.trim()) {
      onAdd(text);
      setText("");
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.tally}>
        <Text style={styles.tallyNum}>{validCount}</Text>
        <Text style={styles.tallyLabel}>
          valid{totalPossible !== "open" ? ` / ${totalPossible}` : ""}
        </Text>
      </View>

      {!disabled ? (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Type an answer, hit enter"
            placeholderTextColor={palette.neutral}
            onSubmitEditing={submit}
            returnKeyType="done"
            blurOnSubmit={false}
            autoCapitalize="words"
            autoCorrect={false}
          />
          <Pressable onPress={submit} style={styles.add}>
            <Text style={styles.addText}>Add</Text>
          </Pressable>
        </View>
      ) : null}

      <ScrollView style={styles.list} contentContainerStyle={styles.listInner}>
        {entries
          .slice()
          .reverse()
          .map((e, i) => (
            <View key={`${e.text}-${i}`} style={[styles.chip, e.valid ? styles.chipValid : styles.chipInvalid]}>
              <Text style={[styles.chipText, e.valid && { color: palette.onPrimary }]}>{e.text}</Text>
            </View>
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", maxWidth: 460, alignSelf: "center", gap: spacing(2) },
  tally: { flexDirection: "row", alignItems: "baseline", justifyContent: "center", gap: spacing(2) },
  tallyNum: { fontSize: typography.size.xxl, fontWeight: typography.weight.heavy, color: palette.correct },
  tallyLabel: { fontSize: typography.size.md, color: palette.inkSoft, fontWeight: typography.weight.medium },
  inputRow: { flexDirection: "row", gap: spacing(2), alignItems: "center" },
  input: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    color: palette.ink,
    borderWidth: 2,
    borderColor: palette.surface,
  },
  add: { backgroundColor: palette.primary, borderRadius: radii.lg, paddingHorizontal: spacing(4), paddingVertical: spacing(3) },
  addText: { color: palette.onPrimary, fontWeight: typography.weight.heavy, fontSize: typography.size.md },
  list: { maxHeight: 150 },
  listInner: { flexDirection: "row", flexWrap: "wrap", gap: spacing(1.5), paddingVertical: spacing(1) },
  chip: { paddingHorizontal: spacing(3), paddingVertical: spacing(1.5), borderRadius: radii.pill, borderWidth: 1.5 },
  chipValid: { backgroundColor: palette.correct, borderColor: palette.correct },
  chipInvalid: { backgroundColor: palette.surface, borderColor: palette.neutral },
  chipText: { fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: palette.inkSoft },
});
