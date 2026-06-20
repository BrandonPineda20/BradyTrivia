import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "../components/Avatar";
import { BradyHost } from "../components/BradyHost";
import { FloatingBrains } from "../components/FloatingBrains";
import { PixelIcon } from "../components/PixelIcon";
import { PrimaryButton } from "../components/PrimaryButton";
import { useProfileStore } from "../store/profileStore";
import { useSettingsStore } from "../store/settingsStore";
import { palette, radii, shadow, spacing, typography } from "../theme";

const SOCIALS = [
  { name: "YouTube",   url: "https://www.youtube.com/@bradyyourtutor",  icon: require("../assets/YouTube_full-color_icon_(2017).svg.png") },
  { name: "Instagram", url: "https://www.instagram.com/bradyyourtutor", icon: require("../assets/Instagram_logo_2016.svg.webp") },
  { name: "TikTok",    url: "https://www.tiktok.com/@bradyyourtutor",   icon: require("../assets/social-media-icon-illustration-tiktok-tiktok-icon-vector-illustration_561158-2136.avif") },
  { name: "X",         url: "https://x.com/BradyYourTutor_",            icon: require("../assets/twitter-x-logo-png_seeklogo-492396.png") },
];

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
      <FloatingBrains />
      <Pressable style={styles.muteBtn} onPress={() => useSettingsStore.getState().toggleMute()} hitSlop={10}>
        <PixelIcon name={muted ? "speaker_off" : "speaker_on"} size={22} />
      </Pressable>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.top}>
          <View style={styles.kickerPill}>
            <Text style={styles.kicker}>A MAGNET GAMES PRODUCTION</Text>
          </View>
          <Text style={styles.title}>BradyYourTutor</Text>
          <View style={styles.underline} />
          <Text style={styles.tag}>Play to Get Smarter 🧠</Text>
        </View>

        <BradyHost expression="idle" size={220} />

        <Pressable style={({ pressed }) => [styles.profileChip, pressed && styles.chipPressed]} onPress={() => router.push("/avatar")}>
          {avatar ? <Avatar config={avatar} size={48} ringColor={palette.primary} faceOnly /> : null}
          <View>
            <Text style={styles.profileName}>{name || "You"}</Text>
            <Text style={styles.editLink}>Edit avatar ›</Text>
          </View>
        </Pressable>

        <View style={styles.mid}>
          <PrimaryButton title="▶  Last Genius Standing Wins" variant="primary" onPress={() => router.push("/play")} style={styles.playBtn} fontSize={17} />
          <View style={styles.tiles}>
            <Pressable style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]} onPress={() => router.push("/profile")}>
              <PixelIcon name="person" size={28} />
              <Text style={styles.tileTitle}>Profile</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]} onPress={() => router.push("/leaderboard")}>
              <PixelIcon name="trophy" size={28} />
              <Text style={styles.tileTitle}>Leaderboard</Text>
            </Pressable>
            <View style={[styles.tile, styles.tileMuted]}>
              <PixelIcon name="controller" size={28} />
              <Text style={styles.tileTitle}>More modes</Text>
              <Text style={styles.soon}>soon</Text>
            </View>
          </View>
        </View>

        <View style={styles.socials}>
          {SOCIALS.map((s) => (
            <Pressable
              key={s.name}
              style={({ pressed }) => [styles.socialBtn, pressed && styles.socialBtnPressed]}
              onPress={() => Linking.openURL(s.url)}
              accessibilityLabel={s.name}
              accessibilityRole="link"
            >
              <Image source={s.icon} style={styles.socialIcon} resizeMode="contain" />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: palette.stageTint },
  scroll: { alignItems: "center", paddingVertical: spacing(5), paddingHorizontal: spacing(5), gap: spacing(4) },
  top: { alignItems: "center", gap: spacing(1.5) },
  kickerPill: { backgroundColor: palette.surface, borderRadius: radii.pill, paddingHorizontal: spacing(3), paddingVertical: spacing(1) },
  kicker: { color: palette.inkSoft, fontSize: typography.size.xs, letterSpacing: 2, fontFamily: typography.fonts.body },
  title: { color: palette.ink, fontSize: typography.size.xxl, fontFamily: typography.fonts.display, letterSpacing: 1, marginTop: spacing(1) },
  underline: { width: 64, height: 5, borderRadius: radii.pill, backgroundColor: palette.accent },
  tag: { color: palette.primary, fontSize: typography.size.lg, fontFamily: typography.fonts.display, marginTop: 2 },
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
  profileName: { fontSize: typography.size.md, fontFamily: typography.fonts.body, color: palette.ink },
  editLink: { fontSize: typography.size.xs, color: palette.primary, fontFamily: typography.fonts.body },
  mid: { width: "100%", maxWidth: 420, gap: spacing(4), alignItems: "stretch" },
  tiles: { flexDirection: "row", gap: spacing(2), justifyContent: "center" },
  tile: { flex: 1, backgroundColor: palette.stage, borderRadius: radii.lg, paddingVertical: spacing(3.5), alignItems: "center", gap: spacing(1), ...shadow.sm },
  tilePressed: { transform: [{ scale: 0.97 }] },
  tileMuted: { opacity: 0.85 },
  tileIcon: { fontSize: 22 },
  tileTitle: { fontSize: typography.size.sm, fontFamily: typography.fonts.body, color: palette.ink },
  soon: { fontSize: 10, color: palette.neutral, fontFamily: typography.fonts.body, letterSpacing: 1, textTransform: "uppercase" },
  playBtn: { paddingVertical: spacing(5.5), paddingHorizontal: spacing(5) },
  socials: { flexDirection: "row", gap: spacing(3), alignItems: "center", justifyContent: "center" },
  socialBtn: { width: 52, height: 52, borderRadius: radii.lg, backgroundColor: palette.stage, alignItems: "center", justifyContent: "center", ...shadow.sm },
  socialBtnPressed: { transform: [{ scale: 0.92 }], opacity: 0.85 },
  socialIcon: { width: 38, height: 38 },
  muteBtn: { position: "absolute", top: spacing(4), right: spacing(4), padding: spacing(2), zIndex: 10 },
  muteText: { fontSize: 22 },
});
