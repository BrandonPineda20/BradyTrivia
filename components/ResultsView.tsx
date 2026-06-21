import { useEffect, useRef, useState } from "react";
import { Animated, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SoundPressable } from "./SoundPressable";

import { BADGES, levelInfo } from "../engine";
import { useGameStore } from "../store/gameStore";
import { useProgressionStore, type ApplyResult } from "../store/progressionStore";
import { palette, radii, shadow, spacing, typography } from "../theme";
import { Avatar } from "./Avatar";
import { BradyHost } from "./BradyHost";
import { PixelIcon } from "./PixelIcon";
import { Confetti } from "./Confetti";
import { PrimaryButton } from "./PrimaryButton";

function ordinal(n?: number): string {
  if (!n) return "N/A";
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
  const shineAnim = useRef(new Animated.Value(0)).current;
  const fanfarePlayed = useRef(false);

  // Play fanfare once on mount + trigger shine animation
  useEffect(() => {
    if (fanfarePlayed.current) return;
    fanfarePlayed.current = true;

    if (typeof window !== "undefined") {
      const FANFARE = require("../audio/u_ss015dykrt-brass-fanfare-with-timpani-and-winchimes-reverberated-146260.mp3");
      const src = typeof FANFARE === "string" ? FANFARE : FANFARE?.uri ?? String(FANFARE);
      const audio = new Audio(src);
      audio.volume = 0.35;
      audio.play().catch(() => {});
    }

    // Shine: fade in then fade out over ~2s
    Animated.sequence([
      Animated.timing(shineAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(900),
      Animated.timing(shineAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (applied.current || !summary) return;
    applied.current = true;
    useProgressionStore.getState().applyEpisode(summary).then(setApply);
  }, [summary]);

  const won = championId === "human";

  const champ = players.find((p) => p.id === championId);
  const you = players.find((p) => p.kind === "human");
  const ordered = [...players].sort((a, b) => (a.placement ?? 9) - (b.placement ?? 9));
  const wins = useProgressionStore((s) => s.stats.wins);

  // Deterministic fake win count for bots seeded from name chars
  function botWins(name: string): number {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
    return (h % 28) + 2; // 2–29 wins
  }
  const lvl = levelInfo(apply?.totalXp ?? xp, (apply?.totalXp != null ? (wins + (won ? 1 : 0)) : wins));
  const unlocked = (apply?.newBadges ?? []).map((id) => BADGES.find((b) => b.id === id)).filter(Boolean);

  const share = () => {
    const text = won
      ? "I won a BradyYourTutor Trivia episode! 🏆 Can you beat me?"
      : `I finished ${ordinal(you?.placement)} of 5 on BradyYourTutor Trivia · can you beat me?`;
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
        {won ? "Last one standing · you schooled the lobby!" : `You finished ${ordinal(you?.placement)} of 5`}
      </Text>

      <View style={styles.board}>
        {ordered.map((p) => {
          const isChamp = p.placement === 1;
          return (
            <Animated.View
              key={p.id}
              style={[
                styles.rowItem,
                p.kind === "human" && styles.youRow,
                isChamp && {
                  transform: [{ scale: shineAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }) }],
                },
              ]}
            >
              <Text style={styles.place}>{p.placement}</Text>
              <Animated.View style={isChamp ? { opacity: shineAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1] }), shadowColor: "#FFD700", shadowRadius: shineAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 18] }), shadowOpacity: shineAnim } : undefined}>
                <Avatar config={p.avatar} size={56} ringColor={isChamp ? palette.accent : palette.neutral} faceOnly />
              </Animated.View>
              <View style={{ flex: 1 }}>
                <Animated.Text
                  style={[
                    styles.pname,
                    p.kind === "human" && styles.human,
                    isChamp && { color: shineAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [palette.ink, "#FFD700", palette.ink] }) },
                  ]}
                >
                  {p.kind === "human" ? "You" : p.name}
                </Animated.Text>
                <Text style={styles.pwins}>{p.kind === "human" ? wins : botWins(p.name)} wins</Text>
              </View>
              {isChamp ? <Image source={require("../assets/Icons/Icons/Crown Icon.png")} style={{ width: 28, height: 28 }} resizeMode="contain" /> : null}
            </Animated.View>
          );
        })}
      </View>

      {/* XP + level */}
      <View style={styles.xpPill}>
        <Text style={styles.xpText}>+{apply?.xpEarned ?? "…"} XP</Text>
      </View>
      <View style={styles.levelCard}>
        <View style={styles.levelHead}>
          <Text style={styles.levelTitle}>Lv {lvl.level} {lvl.title}</Text>
          {apply?.leveledUp ? <View style={styles.levelUpRow}><PixelIcon name="confetti" size={20} /><Text style={styles.levelUp}>LEVEL UP!</Text><PixelIcon name="confetti" size={20} /></View> : null}
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
      <SoundPressable onPress={share} style={styles.share}>
        <Text style={styles.shareText}>↗  Share result</Text>
      </SoundPressable>
      <SoundPressable
        onPress={() => Linking.openURL("https://www.youtube.com/@bradyyourtutor")}
        style={styles.ytBtn}
      >
        <Image
          source={require("../assets/YouTube_full-color_icon_(2017).svg.png")}
          style={styles.ytLogo}
          resizeMode="contain"
        />
        <Text style={styles.ytText}>BradyYourTutor</Text>
      </SoundPressable>
      </ScrollView>
      {won ? <Confetti /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  wrap: { alignItems: "center", gap: spacing(2), padding: spacing(5), paddingBottom: spacing(10) },
  kicker: { color: palette.inkSoft, fontSize: typography.size.xs, letterSpacing: 3, fontFamily: typography.fonts.body },
  champName: { fontSize: typography.size.xxl, fontFamily: typography.fonts.display, color: palette.ink, textAlign: "center" },
  sub: { fontSize: typography.size.md, color: palette.primary, fontFamily: typography.fonts.body, textAlign: "center", marginBottom: spacing(2) },
  board: { width: "100%", maxWidth: 360, gap: spacing(1.5) },
  rowItem: { flexDirection: "row", alignItems: "center", gap: spacing(3), backgroundColor: palette.stage, borderRadius: radii.md, paddingVertical: spacing(2), paddingHorizontal: spacing(3), ...shadow.sm },
  youRow: { backgroundColor: palette.primarySoft, borderWidth: 2, borderColor: palette.primary },
  place: { width: 22, fontSize: typography.size.lg, fontFamily: typography.fonts.display, color: palette.inkSoft },
  pname: { fontSize: typography.size.md, fontFamily: typography.fonts.body, color: palette.ink },
  pwins: { fontSize: typography.size.xs, color: palette.inkSoft, fontFamily: typography.fonts.body, marginTop: 1 },
  human: { color: palette.primary, fontFamily: typography.fonts.display },
  crown: { fontSize: typography.size.lg },
  xpPill: { backgroundColor: palette.accent, borderRadius: radii.pill, paddingHorizontal: spacing(5), paddingVertical: spacing(2), marginTop: spacing(2), ...shadow.glow },
  xpText: { fontSize: typography.size.lg, fontFamily: typography.fonts.display, color: palette.onAccent },
  levelCard: { width: "100%", maxWidth: 360, backgroundColor: palette.stage, borderRadius: radii.lg, padding: spacing(4), gap: spacing(2), ...shadow.md },
  levelHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  levelTitle: { fontSize: typography.size.md, fontFamily: typography.fonts.display, color: palette.ink },
  levelUpRow: { flexDirection: "row", alignItems: "center", gap: spacing(2) },
  levelUp: { fontSize: typography.size.sm, fontFamily: typography.fonts.display, color: palette.correct },
  track: { height: 12, borderRadius: radii.pill, backgroundColor: palette.stage, overflow: "hidden" },
  fill: { height: "100%", borderRadius: radii.pill, backgroundColor: palette.primary },
  nextText: { fontSize: typography.size.xs, color: palette.inkSoft, fontFamily: typography.fonts.body },
  badges: { width: "100%", maxWidth: 360, alignItems: "center", gap: spacing(2), marginTop: spacing(2) },
  badgesTitle: { fontSize: typography.size.sm, fontFamily: typography.fonts.display, color: palette.inkSoft, letterSpacing: 1 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing(2), justifyContent: "center" },
  badge: { backgroundColor: "#FFF4D6", borderRadius: radii.md, paddingVertical: spacing(2), paddingHorizontal: spacing(3), alignItems: "center", minWidth: 96 },
  badgeEmoji: { fontSize: 24 },
  badgeName: { fontSize: 11, fontFamily: typography.fonts.display, color: palette.ink, textAlign: "center" },
  actions: { flexDirection: "row", gap: spacing(3), marginTop: spacing(3) },
  share: { marginTop: spacing(3), paddingVertical: spacing(2), paddingHorizontal: spacing(4) },
  shareText: { color: palette.primary, fontFamily: typography.fonts.display, fontSize: typography.size.md },
  ytBtn: { flexDirection: "row", alignItems: "center", gap: spacing(2), marginTop: spacing(3), paddingVertical: spacing(2), paddingHorizontal: spacing(4) },
  ytLogo: { width: 36, height: 36 },
  ytText: { color: palette.inkSoft, fontFamily: typography.fonts.display, fontSize: typography.size.md },
});
