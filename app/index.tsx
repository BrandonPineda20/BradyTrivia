import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "../components/Avatar";
import { BradyHost } from "../components/BradyHost";
import { PrimaryButton } from "../components/PrimaryButton";
import { useProfileStore } from "../store/profileStore";
import { useSettingsStore } from "../store/settingsStore";
import { palette, radii, shadow, spacing, typography } from "../theme";

/** Home / Main Menu (§7.2). One mode now; placeholders signal extensibility. */
export default function Home() {
  const router = useRouter();
  const { loaded, selection, avatar, name } = useProfileStore();
  const muted = useSettingsStore((s) => s.muted);

  useEffect(() => {
    if (loaded && !selection) router.replace("/avatar"); // first run → create avatar
  }, [loaded, selection, router]);

  if (!loaded || !selection) return <SafeAreaView style={styles.stage} />;

  return (
    <SafeAreaView style={styles.stage}>
      <Pressable style={styles.muteBtn} onPress={() => useSettingsStore.getState().toggleMute()} hitSlop={10}>
        <Text style={styles.muteText}>{muted ? "🔇" : "🔊"}</Text>
      </Pressable>

      <View style={styles.top}>
        <View style={styles.kickerPill}>
          <Text style={styles.kicker}>A MAGNET GAMES PRODUCTION</Text>
        </View>
        <Text style={styles.title}>BradyYourTutor</Text>
        <View style={styles.underline} />
        <Text style={styles.tag}>Play to Get Smarter 🧠</Text>
      </View>

      <BradyHost expression="idle" size={264} />

      <Pressable style={({ pressed }) => [styles.profileChip, pressed && styles.chipPressed]} onPress={() => router.push("/avatar")}>
        {avatar ? <Avatar config={avatar} size={48} ringColor={palette.primary} /> : null}
        <View>
          <Text style={styles.profileName}>{name || "You"}</Text>
          <Text style={styles.editLink}>Edit avatar ›</Text>
        </View>
      </Pressable>

      <View style={styles.mid}>
        <PrimaryButton title="▶  PLAY · Last One Standing" variant="primary" onPress={() => router.push("/play")} />
        <View style={styles.tiles}>
          <Pressable style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]} onPress={() => router.push("/profile")}>
            <Text style={styles.tileIcon}>👤</Text>
            <Text style={styles.tileTitle}>Profile</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]} onPress={() => router.push("/leaderboard")}>
            <Text style={styles.tileIcon}>🏆</Text>
            <Text style={styles.tileTitle}>Leaderboard</Text>
          </Pressable>
          <View style={[styles.tile, styles.tileMuted]}>
            <Text style={styles.tileIcon}>🎮</Text>
            <Text style={styles.tileTitle}>More modes</Text>
            <Text style={styles.soon}>soon</Text>
          </View>
        </View>
      </View>

      <Text style={styles.cta}>▶  Subscribe on YouTube + TikTok</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: palette.stageTint, alignItems: "center", justifyContent: "space-between", paddingVertical: spacing(7), paddingHorizontal: spacing(5) },
  top: { alignItems: "center", gap: spacing(1.5) },
  kickerPill: { backgroundColor: palette.surface, borderRadius: radii.pill, paddingHorizontal: spacing(3), paddingVertical: spacing(1) },
  kicker: { color: palette.inkSoft, fontSize: typography.size.xs, letterSpacing: 2, fontWeight: typography.weight.heavy },
  title: { color: palette.ink, fontSize: typography.size.xxl, fontWeight: typography.weight.heavy, letterSpacing: -0.5, marginTop: spacing(1) },
  underline: { width: 64, height: 5, borderRadius: radii.pill, backgroundColor: palette.accent },
  tag: { color: palette.primary, fontSize: typography.size.lg, fontWeight: typography.weight.heavy, marginTop: 2 },
  profileChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
    backgroundColor: palette.stage,
    borderRadius: radii.pill,
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(3),
    paddingRight: spacing(5),
    ...shadow.md,
  },
  chipPressed: { transform: [{ scale: 0.98 }] },
  profileName: { fontSize: typography.size.md, fontWeight: typography.weight.heavy, color: palette.ink },
  editLink: { fontSize: typography.size.xs, color: palette.primary, fontWeight: typography.weight.heavy },
  mid: { width: "100%", maxWidth: 420, gap: spacing(4), alignItems: "stretch" },
  tiles: { flexDirection: "row", gap: spacing(2), justifyContent: "center" },
  tile: { flex: 1, backgroundColor: palette.stage, borderRadius: radii.lg, paddingVertical: spacing(3.5), alignItems: "center", gap: spacing(1), ...shadow.sm },
  tilePressed: { transform: [{ scale: 0.97 }] },
  tileMuted: { opacity: 0.85 },
  tileIcon: { fontSize: 22 },
  tileTitle: { fontSize: typography.size.sm, fontWeight: typography.weight.heavy, color: palette.ink },
  soon: { fontSize: 10, color: palette.neutral, fontWeight: typography.weight.heavy, letterSpacing: 1, textTransform: "uppercase" },
  cta: { color: palette.incorrect, fontWeight: typography.weight.heavy, fontSize: typography.size.sm },
  muteBtn: { position: "absolute", top: spacing(4), right: spacing(4), padding: spacing(2), zIndex: 10 },
  muteText: { fontSize: 22 },
});
