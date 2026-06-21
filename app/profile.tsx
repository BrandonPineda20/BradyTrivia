import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SoundPressable } from "../components/SoundPressable";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "../components/Avatar";
import { PrimaryButton } from "../components/PrimaryButton";
import { TopBar } from "../components/TopBar";
import { BADGES, levelInfo, LEVELS } from "../engine";
import { useProfileStore } from "../store/profileStore";
import { useProgressionStore } from "../store/progressionStore";
import { palette, radii, spacing, typography } from "../theme";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/** Profile (§7.10, §9): avatar, level + XP bar, streak, badges, lifetime stats. */
export default function Profile() {
  const router = useRouter();
  const { avatar, name } = useProfileStore();
  const { xp, streak, badges, stats } = useProgressionStore();
  const lvl = levelInfo(xp, stats.wins);
  const earned = new Set(badges);
  const [showNext, setShowNext] = useState(false);
  const xpToNext = lvl.xpForNext - lvl.xpIntoLevel;

  return (
    <SafeAreaView style={styles.stage}>
      <TopBar title="Profile" onBack={() => router.canGoBack() ? router.back() : router.replace("/")} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          {avatar ? <Avatar config={avatar} size={88} ringColor={palette.primary} faceOnly /> : null}
          <Text style={styles.name}>{name || "You"}</Text>
          <SoundPressable onPress={() => setShowNext((v) => !v)} hitSlop={8} style={styles.levelTitleBtn}>
            <Text style={styles.levelTitle}>Lv {lvl.level} {lvl.title}</Text>
            <Text style={styles.levelHint}>{showNext ? "▲" : "ⓘ"}</Text>
          </SoundPressable>
          {showNext ? (
            <View style={styles.levelTable}>
              {LEVELS.map((l) => {
                const isCurrent = lvl.level === l.level;
                const isUnlocked = xp >= l.min && stats.wins >= l.minWins;
                const reqs = [
                  l.min > 0 ? `${l.min.toLocaleString()} XP` : null,
                  l.minWins > 0 ? `${l.minWins} wins` : null,
                ].filter(Boolean).join(" · ") || "Start";
                return (
                  <View key={l.level} style={[styles.levelRow, isCurrent && styles.levelRowCurrent]}>
                    <Text style={[styles.levelRowNum, isCurrent && styles.levelRowNumCurrent]}>Lv {l.level}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.levelRowTitle, isCurrent && styles.levelRowTitleCurrent]}>{l.title}</Text>
                      <Text style={[styles.levelRowXp, !isUnlocked && styles.levelRowXpLocked]}>{reqs}</Text>
                    </View>
                    {isUnlocked && !isCurrent ? <Text style={styles.levelRowCheck}>✓</Text> : isCurrent ? <Text style={styles.levelRowCurrent2}>▶</Text> : null}
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>

        <View style={styles.levelCard}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round(lvl.progress * 100)}%` }]} />
          </View>
          <Text style={styles.xp}>{xp.toLocaleString()} XP</Text>
        </View>

        <View style={styles.statsRow}>
          <Stat label="🔥 Streak" value={`${streak}d`} />
          <Stat label="Games" value={stats.gamesPlayed} />
          <Stat label="Wins" value={stats.wins} />
          <Stat label="Best" value={stats.gamesPlayed ? ordinal(stats.bestPlacement) : "N/A"} />
        </View>

        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.badgeGrid}>
          {BADGES.map((b) => {
            const got = earned.has(b.id);
            return (
              <View key={b.id} style={[styles.badge, !got && styles.badgeLocked]}>
                <Text style={styles.badgeEmoji}>{got ? b.emoji : "🔒"}</Text>
                <Text style={styles.badgeName}>{b.name}</Text>
                <Text style={styles.badgeDesc}>{b.desc}</Text>
              </View>
            );
          })}
        </View>

        <PrimaryButton title="Edit avatar" variant="primary" onPress={() => router.push("/avatar")} style={styles.edit} />
        <SoundPressable onPress={() => useProgressionStore.getState().reset()} style={styles.reset}>
          <Text style={styles.resetText}>Reset progress</Text>
        </SoundPressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: palette.stage },
  content: { padding: spacing(5), gap: spacing(3), maxWidth: 480, alignSelf: "center", width: "100%" },
  header: { alignItems: "center", gap: spacing(1) },
  name: { fontSize: typography.size.xl, fontFamily: typography.fonts.display, color: palette.ink },
  levelTitleBtn: { flexDirection: "row", alignItems: "center", gap: spacing(1) },
  levelTitle: { fontSize: typography.size.md, fontFamily: typography.fonts.display, color: palette.primary },
  levelHint: { fontSize: typography.size.sm, color: palette.primary, opacity: 0.7 },
  levelTable: { width: "100%", marginTop: spacing(2), borderRadius: radii.lg, overflow: "hidden", borderWidth: 1, borderColor: palette.hairline },
  levelRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing(3), paddingVertical: spacing(2), backgroundColor: palette.surface, borderBottomWidth: 1, borderBottomColor: palette.hairline, gap: spacing(2) },
  levelRowCurrent: { backgroundColor: palette.primarySoft },
  levelRowNum: { fontSize: typography.size.xs, fontFamily: typography.fonts.display, color: palette.inkSoft, width: 32 },
  levelRowNumCurrent: { color: palette.primary },
  levelRowTitle: { flex: 1, fontSize: typography.size.sm, fontFamily: typography.fonts.display, color: palette.ink },
  levelRowTitleCurrent: { color: palette.primary },
  levelRowXp: { fontSize: typography.size.xs, fontFamily: typography.fonts.body, color: palette.inkSoft },
  levelRowXpLocked: { color: palette.neutral },
  levelRowCheck: { fontSize: 12, color: palette.correct },
  levelRowCurrent2: { fontSize: 12, color: palette.primary },
  levelCard: { backgroundColor: palette.surface, borderRadius: radii.lg, padding: spacing(4), gap: spacing(2) },
  track: { height: 12, borderRadius: radii.pill, backgroundColor: palette.stage, overflow: "hidden" },
  fill: { height: "100%", borderRadius: radii.pill, backgroundColor: palette.primary },
  xp: { fontSize: typography.size.xs, color: palette.inkSoft, fontFamily: typography.fonts.body },
  statsRow: { flexDirection: "row", gap: spacing(2) },
  stat: { flex: 1, backgroundColor: palette.surface, borderRadius: radii.md, paddingVertical: spacing(3), alignItems: "center", gap: 2 },
  statValue: { fontSize: typography.size.lg, fontFamily: typography.fonts.display, color: palette.ink },
  statLabel: { fontSize: 10, color: palette.inkSoft, fontFamily: typography.fonts.body },
  sectionTitle: { fontSize: typography.size.md, fontFamily: typography.fonts.display, color: palette.ink, marginTop: spacing(1) },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing(2) },
  badge: { width: "31%", backgroundColor: "#FFF4D6", borderRadius: radii.md, padding: spacing(2), alignItems: "center", gap: 2 },
  badgeLocked: { backgroundColor: palette.surface },
  badgeEmoji: { fontSize: 26 },
  badgeName: { fontSize: 11, fontFamily: typography.fonts.display, color: palette.ink, textAlign: "center" },
  badgeDesc: { fontSize: 9, color: palette.inkSoft, textAlign: "center" },
  edit: { marginTop: spacing(3) },
  reset: { alignSelf: "center", paddingVertical: spacing(2) },
  resetText: { color: palette.neutral, fontFamily: typography.fonts.body, fontSize: typography.size.sm },
});
