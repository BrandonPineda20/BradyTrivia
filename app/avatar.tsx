import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SoundPressable } from "../components/SoundPressable";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "../components/PrimaryButton";
import { SPRITE_IDS, SPRITE_IMAGES, spriteLabel } from "../components/spriteImages";
import { useProfileStore } from "../store/profileStore";
import { palette, radii, spacing, typography } from "../theme";

/** Avatar / character select screen — pick one of 8 PNG sprites + enter a name. */
export default function AvatarBuilder() {
  const router = useRouter();
  const profile = useProfileStore();
  const firstRun = !profile.selection;

  const savedId = profile.selection?.spriteIndex ?? null;
  const validSavedId = savedId && SPRITE_IMAGES[savedId] ? savedId : null;

  const [spriteId, setSpriteId] = useState<string | null>(validSavedId ?? "Contestant1");
  const [name, setName] = useState(profile.name || "");

  const onSave = async () => {
    if (!spriteId) return;
    await profile.save(name.trim() || "You", { spriteIndex: String(spriteId) });
    router.replace(firstRun ? "/play" : "/");
  };

  const onReset = async () => {
    await profile.reset();
    setSpriteId("Contestant1");
    setName("");
  };

  return (
    <SafeAreaView style={styles.stage}>
      {/* Header */}
      <View style={styles.header}>
        {!firstRun ? (
          <SoundPressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
            style={styles.headerSide}
            hitSlop={10}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </SoundPressable>
        ) : (
          <View style={styles.headerSide} />
        )}
        <Text style={styles.title}>CHOOSE YOUR CONTESTANT</Text>
        <SoundPressable onPress={onSave} style={styles.headerSide} hitSlop={10}>
          <Text style={styles.saveText}>{firstRun ? "Save ›" : "Save ›"}</Text>
        </SoundPressable>
      </View>

      {/* Fixed top panel — stays visible while grid scrolls */}
      <View style={styles.topPanel}>
        <View style={styles.previewWrap}>
          {spriteId ? (
            <Image
              source={SPRITE_IMAGES[spriteId]}
              style={styles.previewImg}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.previewPlaceholder}>
              <Text style={styles.previewPlaceholderText}>Pick a character below</Text>
            </View>
          )}
        </View>

        {/* Name input sits right under the preview */}
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
      </View>

      {/* Scrollable grid below */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.gridLabel}>SELECT YOUR CHARACTER</Text>
        <View style={styles.grid}>
          {SPRITE_IDS.map((id) => {
            const selected = spriteId === id;
            return (
              <SoundPressable
                key={id}
                onPress={() => setSpriteId(id)}
                style={[styles.gridCard, selected && styles.gridCardSel]}
              >
                <View style={styles.gridImgWrap}>
                  <Image
                    source={SPRITE_IMAGES[id]}
                    style={styles.gridImg}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.gridName, selected && styles.gridNameSel]} numberOfLines={1}>
                  {spriteLabel(id)}
                </Text>
                {selected && <View style={styles.checkBadge}><Text style={styles.checkText}>✓</Text></View>}
              </SoundPressable>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const IMG_SIZE = 155;

const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: palette.stage },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
  },
  headerSide: { width: 72 },
  backText: { color: palette.primary, fontSize: typography.size.md, fontFamily: typography.fonts.display },
  saveText: { color: palette.primary, fontSize: typography.size.md, fontFamily: typography.fonts.display, textAlign: "right" },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: typography.size.xl,
    fontFamily: typography.fonts.display,
    color: palette.ink,
  },

  topPanel: {
    alignItems: "center",
    paddingHorizontal: spacing(4),
    paddingBottom: spacing(2),
    gap: 0,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
  },

  content: {
    padding: spacing(4),
    gap: spacing(4),
    alignItems: "center",
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
  },

  previewWrap: {
    width: "100%",
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  previewImg: { width: 300, height: 300 },
  previewPlaceholder: { alignItems: "center", justifyContent: "center", flex: 1 },
  previewPlaceholderText: {
    color: palette.neutral,
    fontFamily: typography.fonts.body,
    fontSize: typography.size.sm,
  },

  nameInput: {
    width: "100%",
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: palette.hairline,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    fontSize: typography.size.md,
    fontFamily: typography.fonts.display,
    color: palette.ink,
    textAlign: "center",
  },

  gridLabel: {
    fontSize: typography.size.xs,
    fontFamily: typography.fonts.display,
    color: palette.inkSoft,
    letterSpacing: 1,
    textTransform: "uppercase",
    alignSelf: "flex-start",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: spacing(1),
    rowGap: 0,
    justifyContent: "center",
    width: "100%",
  },
  gridCard: {
    alignItems: "center",
    justifyContent: "flex-end",
    opacity: 1,
  },
  gridCardSel: {
    opacity: 1,
  },
  gridImgWrap: {
    width: IMG_SIZE,
    height: IMG_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  gridImg: { width: IMG_SIZE, height: IMG_SIZE },
  gridName: {
    fontSize: 11,
    fontFamily: typography.fonts.display,
    color: palette.inkSoft,
    textAlign: "center",
    marginTop: 0,
    marginBottom: spacing(1),
  },
  gridNameSel: { color: palette.primary, fontWeight: "700" },
  checkBadge: {
    position: "absolute",
    top: 0,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: { color: palette.onPrimary, fontSize: 10, fontFamily: typography.fonts.display },

  actions: { width: "100%", gap: spacing(1), marginTop: spacing(2) },
  resetLink: { alignSelf: "center", paddingVertical: spacing(2) },
  resetText: { color: palette.neutral, fontFamily: typography.fonts.body, fontSize: typography.size.sm },
});
