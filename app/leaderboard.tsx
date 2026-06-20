import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "../components/Avatar";
import { TopBar } from "../components/TopBar";
import { rankedLeaderboard } from "../engine";
import { useProfileStore } from "../store/profileStore";
import { useProgressionStore } from "../store/progressionStore";
import { palette, radii, spacing, typography } from "../theme";

/** Global leaderboard (§9.4): seeded community + the human, ranked by XP. */
export default function Leaderboard() {
  const router = useRouter();
  const { name, avatar } = useProfileStore();
  const xp = useProgressionStore((s) => s.xp);
  const board = rankedLeaderboard(name, xp);

  return (
    <SafeAreaView style={styles.stage}>
      <TopBar title="Leaderboard" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        {board.map((e, i) => (
          <View key={e.id} style={[styles.row, e.isHuman && styles.youRow]}>
            <Text style={[styles.rank, i < 3 && styles.topRank]}>{i + 1}</Text>
            <Avatar config={e.isHuman && avatar ? avatar : { seed: e.avatarSeed, style: "avataaars" }} size={36} />
            <Text style={[styles.name, e.isHuman && styles.human]} numberOfLines={1}>
              {e.isHuman ? "You" : e.name}
            </Text>
            <Text style={styles.xp}>{e.xp.toLocaleString()} XP</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: palette.stage },
  content: { padding: spacing(4), gap: spacing(1.5), maxWidth: 480, alignSelf: "center", width: "100%" },
  row: { flexDirection: "row", alignItems: "center", gap: spacing(3), backgroundColor: palette.surface, borderRadius: radii.md, paddingVertical: spacing(2), paddingHorizontal: spacing(3) },
  youRow: { backgroundColor: "#EAF1FF", borderWidth: 2, borderColor: palette.primary },
  rank: { width: 28, textAlign: "center", fontSize: typography.size.md, fontFamily: typography.fonts.display, color: palette.inkSoft },
  topRank: { color: palette.accent },
  name: { flex: 1, fontSize: typography.size.md, fontFamily: typography.fonts.body, color: palette.ink },
  human: { color: palette.primary, fontFamily: typography.fonts.display },
  xp: { fontSize: typography.size.sm, fontFamily: typography.fonts.display, color: palette.inkSoft },
});
