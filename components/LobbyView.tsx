import { StyleSheet, Text, View } from "react-native";

import { useGameStore } from "../store/gameStore";
import { palette, spacing, typography } from "../theme";
import { Avatar } from "./Avatar";
import { BradyHost } from "./BradyHost";

/** Matchmaking / lobby illusion (§5.1, §7): bots "join" one by one → 5-avatar lineup. */
export function LobbyView() {
  const s = useGameStore();
  const full = s.lobbyJoinedCount >= 5;
  return (
    <View style={styles.wrap}>
      <BradyHost expression="idle" size={130} />
      <Text style={styles.status}>{full ? "Lineup set — Round 1 coming up!" : "Finding players…"}</Text>

      <View style={styles.row}>
        {s.players.map((p, i) => {
          const here = i < s.lobbyJoinedCount;
          return (
            <View key={p.id} style={styles.slot}>
              {here ? (
                <Avatar
                  config={p.avatar}
                  name={p.name}
                  size={56}
                  ringColor={p.kind === "human" ? palette.primary : palette.neutral}
                />
              ) : (
                <View style={styles.empty}>
                  <Text style={styles.dots}>…</Text>
                </View>
              )}
              <Text style={[styles.name, p.kind === "human" && styles.human]} numberOfLines={1}>
                {here ? (p.kind === "human" ? "You" : p.name) : ""}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.hint}>5 players · 1 human + 4 bots · last one standing wins</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing(4), padding: spacing(5) },
  status: { fontSize: typography.size.lg, fontWeight: typography.weight.heavy, color: palette.ink },
  row: { flexDirection: "row", gap: spacing(2), flexWrap: "wrap", justifyContent: "center" },
  slot: { alignItems: "center", width: 72 },
  empty: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: palette.neutral,
    alignItems: "center",
    justifyContent: "center",
  },
  dots: { color: palette.neutral, fontSize: typography.size.lg, fontWeight: typography.weight.heavy },
  name: { marginTop: spacing(1), fontSize: typography.size.xs, color: palette.inkSoft, fontWeight: typography.weight.medium },
  human: { color: palette.primary, fontWeight: typography.weight.heavy },
  hint: { fontSize: typography.size.xs, color: palette.neutral, fontWeight: typography.weight.medium, textAlign: "center" },
});
