import { Pressable, StyleSheet, Text, View } from "react-native";
import { SoundPressable } from "./SoundPressable";

import { palette, spacing, typography } from "../theme";

export function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.bar}>
      <SoundPressable onPress={onBack} style={styles.back} hitSlop={10}>
        <Text style={styles.backText}>‹ Back</Text>
      </SoundPressable>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing(4), paddingVertical: spacing(3) },
  back: { width: 72 },
  backText: { color: palette.primary, fontSize: typography.size.md, fontFamily: typography.fonts.display },
  title: { flex: 1, textAlign: "center", fontSize: typography.size.lg, fontFamily: typography.fonts.display, color: palette.ink },
  spacer: { width: 72 },
});
