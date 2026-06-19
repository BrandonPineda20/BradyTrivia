import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { playSfx } from "../audio/sfx";
import { BADGES, levelInfo } from "../engine";
import { useGameStore } from "../store/gameStore";
import { useProgressionStore, type ApplyResult } from "../store/progressionStore";
import { palette, radii, shadow, spacing, typography } from "../theme";
import { Avatar } from "./Avatar";
import { BradyHost } from "./BradyHost";
import { Confetti } from "./Confetti";
import { PrimaryButton } from "./PrimaryButton";

function ordinal(n?: number): string {
  if (!n) return "—";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Results / champion screen (§7, §4.8, §9). Applies the episode into progression once. */
export function ResultsView({ onPlayAgain, onHome }: { onPlayAgain: () => void; onHome: () => void }) {
  const players = useGameStore((s) => s.players);
  const championId = useGameStore((s) => s.championId);
  const summary = useGameStore((s) => s.summary);
  const xp = useProgressionStore((s) => s.xp);

  const [apply, setApply] = useState<ApplyResult | null>(null);
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current || !summary) return;
    applied.current = true;
    useProgressionStore.getState().applyEpisode(summary).then(setApply);
  }, [summary]);

  const won = championId === "human";
  useEffect(() => {
    if (won) playSfx("champion");
  }, [won]);

  const champ = players.find((p) => p.id === championId);
  const you = players.find((p) => p.kind === "human");
  const ordered = [...players].sort((a, b) => (a.placement ?? 9) - (b.placement ?? 9));
  const lvl = levelInfo(apply?.totalXp ?? xp);
  const unlocked = (apply?.newBadges ?? []).map((id) => BADGES.find((b) => b.id === id)).filter(Boolean);

  const share = () => {
    const text = won
      ? "I won a BradyYourTutor Trivia episode! 🏆 Can you beat me?"
      : `I finished ${ordinal(you?.placement)} of 5 on BradyYourTutor Trivia — can you beat me?`;
    const url = typeof location !== "undefined" ? location.href : "";
    const nav = typeof navigator !== "undefined" ? (navigator as Navigator) : undefined;
    if (nav?.share) nav.share({ title: "BradyYourTutor", text, url }).catch(() => {});
    else nav?.clipboard?.writeText(`${text} ${url}`).catch(() => {});
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <BradyHost expression="champion" size={130} />
      <Text style={styles.kicker}>CHAMPION</Text>
      <Text style={styles.champName}>
        {champ?.name}
        {champ?.kind === "human" ? " (You!)" : ""}
      </Text>
      <Text style={styles.sub}>
        {won ? "Last one standing — you schooled the lobby!" : `You finished ${ordinal(you?.placement)} of 5`}
      </Text>

      <View style={styles.board}>
        {ordered.map((p) => (
          <View key={p.id} style={[styles.rowItem, p.kind === "human" && styles.youRow]}>
            <Text style={styles.place}>{p.placement}</Text>
            <Avatar config={p.avatar} size={34} ringColor={p.placement === 1 ? palette.accent : palette.neutral} />
            <Text style={[styles.pname, p.kind === "human" && styles.human]}>{p.kind === "human" ? "You" : p.name}</Text>
            {p.placement === 1 ? <Text style={styles.crown}>👑</Text> : null}
          </View>
        ))}
      </View>

      {/* XP + level */}
      <View style={styles.xpPill}>
        <Text style={styles.xpText}>+{apply?.xpEarned ?? "…"} XP</Text>
      </View>
      <View style={styles.levelCard}>
        <View style={styles.levelHead}>
          <Text style={styles.levelTitle}>Lv {lvl.level} · {lvl.title}</Text>
          {apply?.leveledUp ? <Text style={styles.levelUp}>LEVEL UP! 🎉</Text> : null}
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(lvl.progress * 100)}%` }]} />
        </View>
        {lvl.nextTitle ? (
          <Text style={styles.nextText}>{lvl.xpForNext - lvl.xpIntoLevel} XP to {lvl.nextTitle}</Text>
        ) : (
          <Text style={styles.nextText}>Max level reached!</Text>
        )}
      </View>

      {unlocked.length > 0 ? (
        <View style={styles.badges}>
          <Text style={styles.badgesTitle}>Badges unlocked</Text>
          <View style={styles.badgeRow}>
            {unlocked.map((b) => (
              <View key={b!.id} style={styles.badge}>
                <Text style={styles.badgeEmoji}>{b!.emoji}</Text>
                <Text style={styles.badgeName}>{b!.name}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.actions}>
        <PrimaryButton title="Play again" variant="accent" onPress={onPlayAgain} />
        <PrimaryButton title="Home" variant="ghost" onPress={onHome} />
      </View>
      <Pressable onPress={share} style={styles.share}>
        <Text style={styles.shareText}>↗  Share result</Text>
      </Pressable>
      <Text style={styles.cta}>▶  Subscribe to BradyYourTutor</Text>
      </ScrollView>
      {won ? <Confetti /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  wrap: { alignItems: "center", gap: spacing(2), padding: spacing(5), paddingBottom: spacing(10) },
  kicker: { color: palette.inkSoft, fontSize: typography.size.xs, letterSpacing: 3, fontWeight: typography.weight.medium },
  champName: { fontSize: typography.size.xxl, fontWeight: typography.weight.heavy, color: palette.ink, textAlign: "center" },
  sub: { fontSize: typography.size.md, color: palette.primary, fontWeight: typography.weight.medium, textAlign: "center", marginBottom: spacing(2) },
  board: { width: "100%", maxWidth: 360, gap: spacing(1.5) },
  rowItem: { flexDirection: "row", alignItems: "center", gap: spacing(3), backgroundColor: palette.stage, borderRadius: radii.md, paddingVertical: spacing(2), paddingHorizontal: spacing(3), ...shadow.sm },
  youRow: { backgroundColor: palette.primarySoft, borderWidth: 2, borderColor: palette.primary },
  place: { width: 22, fontSize: typography.size.lg, fontWeight: typography.weight.heavy, color: palette.inkSoft },
  pname: { flex: 1, fontSize: typography.size.md, fontWeight: typography.weight.medium, color: palette.ink },
  human: { color: palette.primary, fontWeight: typography.weight.heavy },
  crown: { fontSize: typography.size.lg },
  xpPill: { backgroundColor: palette.accent, borderRadius: radii.pill, paddingHorizontal: spacing(5), paddingVertical: spacing(2), marginTop: spacing(2), ...shadow.glow },
  xpText: { fontSize: typography.size.lg, fontWeight: typography.weight.heavy, color: palette.onAccent },
  levelCard: { width: "100%", maxWidth: 360, backgroundColor: palette.stage, borderRadius: radii.lg, padding: spacing(4), gap: spacing(2), ...shadow.md },
  levelHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  levelTitle: { fontSize: typography.size.md, fontWeight: typography.weight.heavy, color: palette.ink },
  levelUp: { fontSize: typography.size.sm, fontWeight: typography.weight.heavy, color: palette.correct },
  track: { height: 12, borderRadius: radii.pill, backgroundColor: palette.stage, overflow: "hidden" },
  fill: { height: "100%", borderRadius: radii.pill, backgroundColor: palette.primary },
  nextText: { fontSize: typography.size.xs, color: palette.inkSoft, fontWeight: typography.weight.medium },
  badges: { width: "100%", maxWidth: 360, alignItems: "center", gap: spacing(2), marginTop: spacing(2) },
  badgesTitle: { fontSize: typography.size.sm, fontWeight: typography.weight.heavy, color: palette.inkSoft, letterSpacing: 1 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing(2), justifyContent: "center" },
  badge: { backgroundColor: "#FFF4D6", borderRadius: radii.md, paddingVertical: spacing(2), paddingHorizontal: spacing(3), alignItems: "center", minWidth: 96 },
  badgeEmoji: { fontSize: 24 },
  badgeName: { fontSize: 11, fontWeight: typography.weight.heavy, color: palette.ink, textAlign: "center" },
  actions: { flexDirection: "row", gap: spacing(3), marginTop: spacing(3) },
  share: { marginTop: spacing(3), paddingVertical: spacing(2), paddingHorizontal: spacing(4) },
  shareText: { color: palette.primary, fontWeight: typography.weight.heavy, fontSize: typography.size.md },
  cta: { marginTop: spacing(2), color: palette.incorrect, fontWeight: typography.weight.heavy, fontSize: typography.size.sm },
});
