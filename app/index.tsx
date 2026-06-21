import { useRouter } from "expo-router";
import { useEffect } from "react";
import { unlockAudio } from "../audio/sfx";
import { Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SoundPressable } from "../components/SoundPressable";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "../components/Avatar";
import { BradyHost } from "../components/BradyHost";
import { FloatingBrains } from "../components/FloatingBrains";
import { PixelIcon } from "../components/PixelIcon";
import { PrimaryButton } from "../components/PrimaryButton";
import { useProgressionStore } from "../store/progressionStore";

const ICON_PROFILE  = require("../assets/Icons/Icons/Profile Icon.png");
const ICON_TROPHY   = require("../assets/Icons/Icons/Pixel Trophy.png");
const ICON_NEW_BTN  = require("../assets/Icons/Icons/New Button.png");
const ICON_MAGNET   = require("../assets/Icons/Icons/magnet-colorful copy.png");
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
  const pendingXp = useProgressionStore((s) => s.pendingXpDisplay);
  const dismissXp = () => useProgressionStore.getState().setPendingXpDisplay(null);

  useEffect(() => {
    if (loaded && !selection) router.replace("/avatar"); // first run → create avatar
  }, [loaded, selection, router]);

  if (!loaded || !selection) return <SafeAreaView style={styles.stage} />;

  return (
    <SafeAreaView style={styles.stage}>
      <FloatingBrains />
      <SoundPressable style={styles.muteBtn} onPress={() => useSettingsStore.getState().toggleMute()} hitSlop={10}>
        <PixelIcon name={muted ? "speaker_off" : "speaker_on"} size={22} />
      </SoundPressable>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.top}>
          <View style={styles.kickerPill}>
            <Image source={ICON_MAGNET} style={styles.kickerIcon} resizeMode="contain" />
            <Text style={styles.kicker}>A MAGNET GAMES PRODUCTION</Text>
          </View>
          <Text style={styles.title}>BradyYourTutor</Text>
          <Text style={styles.tag}>Play to Get Smarter 🧠</Text>
        </View>

        <BradyHost expression="idle" size={220} />

        <SoundPressable style={({ pressed }) => [styles.profileChip, pressed && styles.chipPressed]} onPress={() => router.push("/avatar")}>
          {avatar ? <Avatar config={avatar} size={48} ringColor={palette.primary} faceOnly /> : null}
          <View>
            <Text style={styles.profileName}>{name || "You"}</Text>
            <Text style={styles.editLink}>Edit avatar ›</Text>
          </View>
        </SoundPressable>

        <View style={styles.mid}>
          <PrimaryButton title="▶&#xFE0E;  Last Genius Standing Wins" variant="primary" onPress={() => { unlockAudio(); router.push("/play"); }} style={styles.playBtn} fontSize={17} />
          <View style={styles.tiles}>
            <SoundPressable style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]} onPress={() => router.push("/profile")}>
              <Image source={ICON_PROFILE} style={styles.tileIconImgLg} resizeMode="contain" />
              <Text style={styles.tileTitle}>Profile</Text>
            </SoundPressable>
            <SoundPressable style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]} onPress={() => router.push("/leaderboard")}>
              <Image source={ICON_TROPHY} style={styles.tileIconImg} resizeMode="contain" />
              <Text style={styles.tileTitle}>Leaderboard</Text>
            </SoundPressable>
            <View style={[styles.tile, styles.tileMuted]}>
              <PixelIcon name="controller" size={28} />
              <Text style={styles.tileTitle}>More modes</Text>
              <Text style={styles.soon}>soon</Text>
            </View>
          </View>
        </View>

        <View style={styles.socials}>
          {SOCIALS.map((s) => (
            <SoundPressable
              key={s.name}
              style={({ pressed }) => [styles.socialBtn, pressed && styles.socialBtnPressed]}
              onPress={() => Linking.openURL(s.url)}
              accessibilityLabel={s.name}
              accessibilityRole="link"
            >
              <Image source={s.icon} style={styles.socialIcon} resizeMode="contain" />
            </SoundPressable>
          ))}
        </View>
      </ScrollView>

      {/* XP earned popup — shown after leaving a game early */}
      <Modal visible={!!pendingXp} transparent animationType="fade">
        <View style={styles.xpOverlay}>
          <View style={styles.xpCard}>
            <Pressable style={styles.xpClose} onPress={dismissXp} hitSlop={16}>
              <Text style={styles.xpCloseText}>✕</Text>
            </Pressable>
            <BradyHost expression="neutral" size={80} />
            <Text style={styles.xpTitle}>Game Over</Text>
            <Text style={styles.xpSub}>XP earned this game</Text>
            <View style={styles.xpPill}>
              <Text style={styles.xpPillText}>+{pendingXp?.xpEarned ?? 0} XP</Text>
            </View>
            {/* Progress bar toward next level */}
            <View style={styles.xpLevelRow}>
              <Text style={styles.xpLevelLabel}>Lv {pendingXp?.level ?? 1}</Text>
              <Text style={styles.xpLevelTitle}>{pendingXp?.title ?? ""}</Text>
            </View>
            <View style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: `${Math.round((pendingXp?.progress ?? 0) * 100)}%` }]} />
            </View>
            {pendingXp && pendingXp.xpToNext > 0 ? (
              <Text style={styles.xpHint}>
                {pendingXp.xpToNext} XP to reach {pendingXp.nextTitle ?? `Level ${pendingXp.level + 1}`}
              </Text>
            ) : (
              <Text style={styles.xpHint}>Max level reached!</Text>
            )}
            <SoundPressable style={styles.xpDismissBtn} onPress={dismissXp}>
              <Text style={styles.xpDismissBtnText}>Close</Text>
            </SoundPressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: palette.stageTint },
  scroll: { alignItems: "center", paddingVertical: spacing(5), paddingHorizontal: spacing(5), gap: spacing(4) },
  top: { alignItems: "center", gap: spacing(1.5) },
  kickerPill: { flexDirection: "row", alignItems: "center", gap: spacing(1.5), backgroundColor: palette.surface, borderRadius: radii.pill, paddingHorizontal: spacing(3), paddingVertical: spacing(1) },
  kickerIcon: { width: 16, height: 16 },
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
  tile: { flex: 1, backgroundColor: palette.stage, borderRadius: radii.lg, paddingVertical: spacing(1.5), paddingHorizontal: spacing(1), alignItems: "center", justifyContent: "flex-end", gap: spacing(0.5), height: 90, ...shadow.sm },
  tilePressed: { transform: [{ scale: 0.97 }] },
  tileMuted: { opacity: 0.85 },
  tileIcon: { fontSize: 22 },
  tileTitle: { fontSize: typography.size.sm, fontFamily: typography.fonts.body, color: palette.ink },
  soon: { fontSize: 10, color: palette.neutral, fontFamily: typography.fonts.body, letterSpacing: 1, textTransform: "uppercase" },
  playBtn: { paddingVertical: spacing(5.5), paddingHorizontal: spacing(5) },
  newBtn: { width: "100%", alignItems: "center" },
  newBtnPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  newBtnClip: { width: 300, height: 56, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  newBtnImg: { position: "absolute", width: 540, height: 540, marginTop: 60 },
  newBtnText: { color: "#ffffff", fontSize: 15, fontFamily: typography.fonts.display, letterSpacing: 0.5, zIndex: 1 },
  tileIconImg: { width: 56, height: 56 },
  tileIconImgLg: { width: 56, height: 56 },
  socials: { flexDirection: "row", gap: spacing(3), alignItems: "center", justifyContent: "center" },
  socialBtn: { width: 52, height: 52, borderRadius: radii.lg, backgroundColor: palette.stage, alignItems: "center", justifyContent: "center", ...shadow.sm },
  socialBtnPressed: { transform: [{ scale: 0.92 }], opacity: 0.85 },
  socialIcon: { width: 38, height: 38 },
  muteBtn: { position: "absolute", top: spacing(4), right: spacing(4), padding: spacing(2), zIndex: 10 },
  muteText: { fontSize: 22 },
  // XP earned modal
  xpOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center" },
  xpCard: { backgroundColor: palette.stage, borderRadius: radii.xl, padding: spacing(6), alignItems: "center", gap: spacing(2.5), width: 300, ...shadow.md, position: "relative" },
  xpClose: { position: "absolute", top: spacing(3), right: spacing(3), width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  xpCloseText: { fontSize: 18, color: palette.inkSoft },
  xpTitle: { fontSize: typography.size.xl, fontFamily: typography.fonts.display, color: palette.ink },
  xpSub: { fontSize: typography.size.sm, color: palette.inkSoft, fontFamily: typography.fonts.body },
  xpPill: { backgroundColor: palette.accent, borderRadius: radii.pill, paddingHorizontal: spacing(6), paddingVertical: spacing(2), ...shadow.glow },
  xpPillText: { fontSize: typography.size.xl, fontFamily: typography.fonts.display, color: palette.onAccent },
  xpLevelRow: { flexDirection: "row", alignItems: "center", gap: spacing(2), width: "100%" },
  xpLevelLabel: { fontSize: typography.size.xs, fontFamily: typography.fonts.display, color: palette.primary },
  xpLevelTitle: { fontSize: typography.size.xs, fontFamily: typography.fonts.body, color: palette.inkSoft, flex: 1 },
  xpTrack: { height: 12, width: "100%", borderRadius: radii.pill, backgroundColor: palette.hairline, overflow: "hidden" },
  xpFill: { height: "100%", borderRadius: radii.pill, backgroundColor: palette.primary },
  xpHint: { fontSize: typography.size.xs, color: palette.inkSoft, fontFamily: typography.fonts.body, textAlign: "center" },
  xpDismissBtn: { marginTop: spacing(1), paddingHorizontal: spacing(6), paddingVertical: spacing(2.5), borderRadius: radii.pill, borderWidth: 2, borderColor: palette.hairline },
  xpDismissBtnText: { color: palette.inkSoft, fontFamily: typography.fonts.display, fontSize: typography.size.sm },
});
