import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "../components/Avatar";
import { PrimaryButton } from "../components/PrimaryButton";
import { useProfileStore } from "../store/profileStore";
import {
  ATTRIBUTES,
  AVATAR_STYLE,
  buildAvatarOptions,
  randomSelection,
  type AvatarAttr,
  type AvatarSelection,
} from "../theme/avatar-options";
import { palette, radii, spacing, typography } from "../theme";

function prettify(v: string): string {
  if (v === "none") return "None";
  return v.replace(/([A-Z])/g, " $1").replace(/^\w/, (c) => c.toUpperCase()).replace(/\d+/g, "").trim();
}

/** Avatar Create / Edit (§7.3) — one-screen parametric builder with live preview. */
export default function AvatarBuilder() {
  const router = useRouter();
  const profile = useProfileStore();
  const firstRun = !profile.selection;
  const [selection, setSelection] = useState<AvatarSelection>(() => profile.selection ?? randomSelection());
  const [name, setName] = useState(profile.name || "");

  const config = useMemo(
    () => ({ seed: "you", style: AVATAR_STYLE, options: buildAvatarOptions(selection) }),
    [selection],
  );

  const cycle = (attr: AvatarAttr, dir: 1 | -1) => {
    const i = attr.values.indexOf(selection[attr.key]);
    const next = (i + dir + attr.values.length) % attr.values.length;
    setSelection({ ...selection, [attr.key]: attr.values[next] });
  };

  const onSave = async () => {
    await profile.save(name.trim() || "You", selection);
    router.replace(firstRun ? "/play" : "/"); // first run → straight into your first episode
  };

  return (
    <SafeAreaView style={styles.stage}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{firstRun ? "Create your contestant" : "Edit your avatar"}</Text>

        <View style={styles.previewWrap}>
          <Avatar config={config} size={150} ringColor={palette.primary} />
        </View>

        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={setName}
          placeholder="Your name / handle"
          placeholderTextColor={palette.neutral}
          maxLength={16}
          autoCapitalize="words"
          autoCorrect={false}
        />

        <Pressable onPress={() => setSelection(randomSelection())} style={styles.shuffle}>
          <Text style={styles.shuffleText}>🎲  Shuffle</Text>
        </Pressable>

        {ATTRIBUTES.map((attr) => (
          <View key={attr.key} style={styles.row}>
            <Text style={styles.rowLabel}>{attr.label}</Text>
            <View style={styles.cycler}>
              <Pressable onPress={() => cycle(attr, -1)} style={styles.arrow} hitSlop={8}>
                <Text style={styles.arrowText}>◀</Text>
              </Pressable>
              {attr.isColor ? (
                <View style={styles.swatchWrap}>
                  {selection[attr.key] === "transparent" ? (
                    <Text style={styles.value}>None</Text>
                  ) : (
                    <View style={[styles.swatch, { backgroundColor: `#${selection[attr.key]}` }]} />
                  )}
                </View>
              ) : (
                <Text style={styles.value} numberOfLines={1}>
                  {prettify(selection[attr.key])}
                </Text>
              )}
              <Pressable onPress={() => cycle(attr, 1)} style={styles.arrow} hitSlop={8}>
                <Text style={styles.arrowText}>▶</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <PrimaryButton
          title={firstRun ? "Save & Play" : "Save"}
          variant="accent"
          onPress={onSave}
          style={styles.save}
        />
        {!firstRun ? (
          <PrimaryButton
            title="Reset profile"
            variant="ghost"
            onPress={async () => {
              await profile.reset();
              setSelection(randomSelection());
              setName("");
            }}
            style={styles.reset}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: palette.stage },
  content: { padding: spacing(5), gap: spacing(2), alignItems: "stretch", maxWidth: 480, alignSelf: "center", width: "100%" },
  title: { fontSize: typography.size.xl, fontWeight: typography.weight.heavy, color: palette.ink, textAlign: "center" },
  previewWrap: { alignItems: "center", marginVertical: spacing(2) },
  nameInput: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    fontSize: typography.size.lg,
    fontWeight: typography.weight.heavy,
    color: palette.ink,
    textAlign: "center",
  },
  shuffle: { alignSelf: "center", paddingVertical: spacing(2), paddingHorizontal: spacing(4) },
  shuffleText: { color: palette.primary, fontWeight: typography.weight.heavy, fontSize: typography.size.md },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
  },
  rowLabel: { fontSize: typography.size.sm, fontWeight: typography.weight.heavy, color: palette.inkSoft, width: 96 },
  cycler: { flexDirection: "row", alignItems: "center", gap: spacing(2), flex: 1, justifyContent: "flex-end" },
  arrow: { padding: spacing(1.5) },
  arrowText: { fontSize: typography.size.md, color: palette.primary, fontWeight: typography.weight.heavy },
  value: { fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: palette.ink, minWidth: 90, textAlign: "center" },
  swatchWrap: { minWidth: 90, alignItems: "center" },
  swatch: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: palette.ink },
  save: { marginTop: spacing(4) },
  reset: { marginTop: spacing(2) },
});
