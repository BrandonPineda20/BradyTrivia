import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "../components/Avatar";
import { PrimaryButton } from "../components/PrimaryButton";
import { TopBar } from "../components/TopBar";
import { BADGES, levelInfo } from "../engine";
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
  const lvl = levelInfo(xp);
  const earned = new Set(badges);

  return (
    <SafeAreaView style={styles.stage}>
      <TopBar title="Profile" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          {avatar ? <Avatar config={avatar} size={88} ringColor={palette.primary} /> : null}
          <Text style={styles.name}>{name || "You"}</Text>
          <Text style={styles.levelTitle}>Lv {lvl.level} · {lvl.title}</Text>
        </View>

        <View style={styles.levelCard}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round(lvl.progress * 100)}%` }]} />
          </View>
          <Text style={styles.xp}>
            {xp.toLocaleString()} XP
            {lvl.nextTitle ? ` · ${lvl.xpForNext - lvl.xpIntoLevel} to ${lvl.nextTitle}` : " · max level"}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <Stat label="🔥 Streak" value={`${streak}d`} />
          <Stat label="Games" value={stats.gamesPlayed} />
          <Stat label="Wins" value={stats.wins} />
          <Stat label="Best" value={stats.gamesPlayed ? ordinal(stats.bestPlacement) : "—"} />
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
        <Pressable onPress={() => useProgressionStore.getState().reset()} style={styles.reset}>
          <Text style={styles.resetText}>Reset progress</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: palette.stage },
  content: { padding: spacing(5), gap: spacing(3), maxWidth: 480, alignSelf: "center", width: "100%" },
  header: { alignItems: "center", gap: spacing(1) },
  name: { fontSize: typography.size.xl, fontWeight: typography.weight.heavy, color: palette.ink },
  levelTitle: { fontSize: typography.size.md, fontWeight: typography.weight.heavy, color: palette.primary },
  levelCard: { backgroundColor: palette.surface, borderRadius: radii.lg, padding: spacing(4), gap: spacing(2) },
  track: { height: 12, borderRadius: radii.pill, backgroundColor: palette.stage, overflow: "hidden" },
  fill: { height: "100%", borderRadius: radii.pill, backgroundColor: palette.primary },
  xp: { fontSize: typography.size.xs, color: palette.inkSoft, fontWeight: typography.weight.medium },
  statsRow: { flexDirection: "row", gap: spacing(2) },
  stat: { flex: 1, backgroundColor: palette.surface, borderRadius: radii.md, paddingVertical: spacing(3), alignItems: "center", gap: 2 },
  statValue: { fontSize: typography.size.lg, fontWeight: typography.weight.heavy, color: palette.ink },
  statLabel: { fontSize: 10, color: palette.inkSoft, fontWeight: typography.weight.medium },
  sectionTitle: { fontSize: typography.size.md, fontWeight: typography.weight.heavy, color: palette.ink, marginTop: spacing(1) },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing(2) },
  badge: { width: "31%", backgroundColor: "#FFF4D6", borderRadius: radii.md, padding: spacing(2), alignItems: "center", gap: 2 },
  badgeLocked: { backgroundColor: palette.surface },
  badgeEmoji: { fontSize: 26 },
  badgeName: { fontSize: 11, fontWeight: typography.weight.heavy, color: palette.ink, textAlign: "center" },
  badgeDesc: { fontSize: 9, color: palette.inkSoft, textAlign: "center" },
  edit: { marginTop: spacing(3) },
  reset: { alignSelf: "center", paddingVertical: spacing(2) },
  resetText: { color: palette.neutral, fontWeight: typography.weight.medium, fontSize: typography.size.sm },
});
