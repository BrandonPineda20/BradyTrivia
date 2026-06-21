import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SoundPressable } from "./SoundPressable";

import { fuzzyMatch, normalizeEntry } from "../engine/validation";
import { useGameStore } from "../store/gameStore";
import { palette, radii, shadow, spacing, typography } from "../theme";
import { AnswerOptions } from "./AnswerOptions";
import { BradyHost } from "./BradyHost";
import { PixelIcon } from "./PixelIcon";
import { CountdownTimer } from "./CountdownTimer";
import { ListAnswer, type ListEntryView } from "./ListAnswer";
import { NumericAnswer } from "./NumericAnswer";
import { R2Visual } from "./R2Visual";
import { PlayerLineup, type LineupItem } from "./PlayerLineup";
import { SpeechBubble } from "./SpeechBubble";

const ROUND_TITLE: Record<string, string> = {
  "1": "Round 1: General Trivia",
  "2": "Round 2: Flags & Geography",
  "3": "Round 3: Numeric Estimate",
  final: "Final: Name As Many",
};

export function RoundStage({ now, onLeaveGame }: { now: number; onLeaveGame?: () => void }) {
  const router = useRouter();
  const s = useGameStore();
  const q = s.current;
  const qualifyPlayedRef = useRef(false);
  const byId = useMemo(
    () => Object.fromEntries(s.players.map((p) => [p.id, p])),
    [s.players],
  );

  // Live list-entry validation (final).
  const { accepted, canonicalDisplay } = useMemo(() => {
    if (!q || q.type !== "list") return { accepted: null, canonicalDisplay: null };
    const set = new Set<string>();
    const display = new Map<string, string>(); // normalized → original-cased
    for (const w of q.acceptable) {
      const n = normalizeEntry(w);
      set.add(n);
      display.set(n, w);
    }
    if (q.totalPossible === "open" && q.openDictionaryKey) {
      for (const w of s.supplements?.[q.openDictionaryKey] ?? []) {
        const n = normalizeEntry(w);
        set.add(n);
        display.set(n, w);
      }
    }
    return { accepted: set, canonicalDisplay: display };
  }, [q, s.supplements]);

  if (!q) return null;

  const reveal = s.phase === "reveal" ? s.reveal : null;
  const humanInPool = s.pool.includes("human");
  const humanQualified = s.round !== "final" && s.advanced.includes("human");

  // Fire as soon as the human's ★ badge appears (reveal phase, human is winner).
  // This is earlier than s.advanced updating, so it syncs with the visual badge.
  const humanWonReveal =
    s.round !== "final" &&
    reveal !== null &&
    (reveal.rows.find((r) => r.playerId === "human")?.isWinner ?? false);

  useEffect(() => {
    if (!humanWonReveal && !humanQualified) {
      qualifyPlayedRef.current = false; // reset for next round
      return;
    }
    if (qualifyPlayedRef.current) return;
    qualifyPlayedRef.current = true;
    if (typeof window !== "undefined") {
      const SFX = require("../audio/correctaudio.mp3");
      const src = typeof SFX === "string" ? SFX : SFX?.uri ?? String(SFX);
      const audio = new Audio(src);
      audio.volume = 0.12;
      audio.play().catch(() => {});
    }
  }, [humanWonReveal, humanQualified]);

  const totalMs = Math.max(1, s.deadlineAt - s.questionStartAt);
  const remainingMs = s.deadlineAt - now;
  const prompt = q.type === "list" ? q.prompt : q.question;
  const category = q.type === "list" ? "" : q.category;

  // Shuffle MC options once per question (stable during reveal, random each new question).
  const shuffledOptions = useMemo(() => {
    if (q.type !== "multiple_choice") return [];
    const opts = [...q.options];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.id]);

  // Answer order: sort locked submissions by submittedAtMs to assign 1st, 2nd, 3rd...
  const answerOrder = useMemo(() => {
    const entries = Object.entries(s.locked)
      .filter(([, sub]) => sub.submittedAtMs !== undefined)
      .sort(([, a], [, b]) => (a.submittedAtMs ?? 0) - (b.submittedAtMs ?? 0));
    const order: Record<string, number> = {};
    entries.forEach(([id], i) => { order[id] = i + 1; });
    return order;
  }, [s.locked]);

  // Unified lineup: all active players in original order.
  // Qualified players are dimmed with a ✓ badge; pool players show normal state.
  const advancedSet = new Set(s.round !== "final" ? s.advanced : []);
  const poolSet = new Set(s.pool);

  const items: LineupItem[] = s.players
    .filter((p) => advancedSet.has(p.id) || poolSet.has(p.id))
    .map((p) => {
      const base = { id: p.id, name: p.name, avatar: p.avatar, isHuman: p.kind === "human" };

      // Already qualified — grey out, show ✓
      if (advancedSet.has(p.id)) {
        return {
          ...base,
          dimmed: true,
          badge: "✓",
          badgeColor: palette.correct,
          caption: "Qualified",
          captionColor: palette.correct,
        };
      }

      // Still in pool
      if (reveal) {
        const row = reveal.rows.find((r) => r.playerId === p.id)!;
        let ring: string = palette.neutral;
        let captionColor: string = palette.inkSoft;
        if (q.type === "multiple_choice") {
          ring = row.correct ? palette.correct : palette.incorrect;
          captionColor = row.correct ? palette.correct : palette.incorrect;
        } else if (row.isWinner) {
          ring = palette.correct;
          captionColor = palette.correct;
        }
        return {
          ...base,
          ringColor: ring,
          badge: row.isWinner ? "★" : undefined,
          badgeColor: palette.accent,
          sparkle: row.isWinner,
          caption: row.display,
          captionColor,
        };
      }
      const locked = !!s.locked[p.id] || (p.id === "human" && s.humanLocked);
      const showOrder = s.round === 1 || s.round === 2;
      const orderNum = showOrder ? answerOrder[p.id] : undefined;
      return {
        ...base,
        ringColor: locked ? palette.primary : palette.neutral,
        badge: orderNum !== undefined ? String(orderNum) : undefined,
        badgeColor: palette.primary,
        caption: locked ? "Locked in" : "Thinking…",
        captionColor: locked ? palette.primary : palette.neutral,
      };
    });

  // Reveal banner.
  let banner: { text: string; tint: "advance" | "out" | "neutral" } | null = null;
  if (reveal) {
    const w = reveal.winnerId;
    if (q.type === "list") {
      if (w) {
        const proposedWins = (s.finalWins[w] ?? 0) + 1;
        const opponent = s.pool.find((id) => id !== w);
        const opponentWins = opponent ? (s.finalWins[opponent] ?? 0) : 0;
        if (proposedWins >= 2) {
          banner = { text: `${byId[w].name} wins the episode!`, tint: "advance" };
        } else {
          banner = { text: `Correct! ${byId[w].name} leads ${proposedWins}–${opponentWins}`, tint: "advance" };
        }
      } else {
        banner = { text: "Tie! Sudden death...", tint: "neutral" };
      }
    } else if (w) {
      const next = s.round === 1 ? "Round 2" : s.round === 2 ? "Round 3" : "the Final";
      if (s.pool.length === 2) {
        const loser = s.pool.find((id) => id !== w)!;
        banner = { text: `${byId[w].name} advances. ${byId[loser].name} eliminated.`, tint: "out" };
      } else {
        banner = { text: `${byId[w].name} advances to ${next}!`, tint: "advance" };
      }
    } else {
      banner = { text: "Nobody got it! Next question.", tint: "neutral" };
    }
  }

  // Human list entries with live valid flags.
  let listViews: ListEntryView[] = [];
  let validCount = 0;
  if (q.type === "list" && accepted) {
    const seen = new Set<string>();
    for (const e of s.listEntries) {
      const n = normalizeEntry(e);
      const matched = fuzzyMatch(n, accepted);
      const valid = matched !== null && !seen.has(matched);
      if (valid) seen.add(matched!);
      const displayText = matched !== null ? (canonicalDisplay!.get(matched) ?? e) : e;
      listViews.push({ text: displayText, valid });
    }
    validCount = seen.size;
  }
  const humanSub = s.locked["human"];

  const isMC = q.type === "multiple_choice";
  const screenWidth = Dimensions.get("window").width;
  const isMobileScreen = screenWidth < 768;
  const isRound2 = s.round === 2;

  const header = (
    <View style={styles.header}>
      <View>
        <Text style={styles.roundTitle}>{ROUND_TITLE[String(s.round)]}</Text>
        {category ? <Text style={styles.category}>{category}</Text> : null}
      </View>
      {!reveal ? <CountdownTimer remainingMs={remainingMs} totalMs={totalMs} deadlineAt={s.deadlineAt} /> : null}
    </View>
  );

  const bradyBlock = (
    <View style={styles.brady}>
      <BradyHost expression={s.hostExpression} size={60} />
      {reveal ? (
        <SpeechBubble text={s.hostLine} tint={s.hostTint} />
      ) : (
        <View style={[styles.questionCard, isRound2 && styles.questionCardR2]}>
          {q.asset && q.asset.kind !== "none" ? (
            <View style={styles.visualWrap}><R2Visual question={q} width={isRound2 ? 220 : 140} /></View>
          ) : null}
          <Text style={[styles.prompt, isRound2 && styles.promptR2]} numberOfLines={3}>{prompt}</Text>
        </View>
      )}
    </View>
  );

  const avatarSize = isRound2
    ? (isMobileScreen ? 44 : 60)
    : (isMobileScreen ? 68 : 92);
  const lineup = <PlayerLineup items={items} avatarSize={avatarSize} />;

  const revealBanner = banner ? (
    <View style={[styles.banner, banner.tint === "advance" && styles.bannerAdvance, banner.tint === "out" && styles.bannerOut]}>
      <Text style={styles.bannerText}>{banner.text}</Text>
    </View>
  ) : null;

  const answerArea = humanQualified ? (
    <View style={styles.spectator}>
      <PixelIcon name="star" size={24} />
      <Text style={styles.qualifiedMsg}>You've qualified to the next round!</Text>
    </View>
  ) : !humanInPool ? (
    <View style={styles.spectator}>
      <PixelIcon name="eyes" size={28} />
      <Text style={styles.spectatorText}>You're out. Watching the rest play out…</Text>
      <SoundPressable style={styles.homeBtn} onPress={() => onLeaveGame ? onLeaveGame() : router.replace("/")}>
        <Text style={styles.homeBtnText}>Leave Game</Text>
      </SoundPressable>
    </View>
  ) : isMC ? (
    <AnswerOptions
      options={shuffledOptions}
      onPick={(opt) => s.submitHuman(opt)}
      locked={s.humanLocked}
      humanPick={typeof humanSub?.value === "string" ? humanSub.value : undefined}
      reveal={reveal ? { correctAnswer: q.answer } : undefined}
    />
  ) : q.type === "numeric" ? (
    <NumericAnswer
      key={q.id}
      unit={q.unit}
      onSubmit={(v) => s.submitHuman(v)}
      locked={s.humanLocked}
      submittedValue={humanSub ? String(humanSub.value) : undefined}
      reveal={reveal ? { correctAnswer: q.answer, humanGuess: humanSub ? (q.unit.toLowerCase() === "year" ? String(humanSub.value) : Number(humanSub.value).toLocaleString()) : "No answer", distance: reveal.rows.find((r) => r.playerId === "human")?.distance } : undefined}
    />
  ) : (
    <ListAnswer
      onAdd={(t) => s.addListEntry(t)}
      entries={listViews}
      validCount={validCount}
      totalPossible={q.totalPossible}
      disabled={!!reveal}
    />
  );

  // MC: fixed non-scrolling layout so all 4 options are always visible
  if (isMC) {
    return (
      <View style={styles.stage}>
        {header}
        <View style={styles.mcBody}>
          {bradyBlock}
          {lineup}
          {revealBanner}
          <View style={styles.mcAnswers}>{answerArea}</View>
        </View>
      </View>
    );
  }

  // Numeric / list: keep scrollable for keyboard input
  return (
    <View style={styles.stage}>
      {header}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {bradyBlock}
        {lineup}
        {revealBanner}
        <View style={styles.answerArea}>{answerArea}</View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, paddingHorizontal: spacing(3), paddingTop: spacing(1) },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing(1) },
  // MC fixed layout — no scroll, space distributed evenly
  mcBody: { flex: 1, gap: spacing(1), paddingBottom: spacing(5) },
  mcAnswers: { marginTop: "auto" },
  scroll: { flex: 1 },
  scrollContent: { gap: spacing(2), paddingBottom: spacing(6) },
  roundTitle: { fontSize: typography.size.md, fontFamily: typography.fonts.display, color: palette.ink },
  category: { fontSize: typography.size.xs, color: palette.inkSoft, fontFamily: typography.fonts.body, marginTop: 2 },
  brady: { alignItems: "center", gap: spacing(1.5), paddingBottom: spacing(1) },
  questionCard: {
    backgroundColor: palette.stage,
    borderRadius: radii.lg,
    padding: spacing(2),
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
    borderWidth: 2,
    borderColor: palette.hairline,
    ...shadow.md,
  },
  visualWrap: { alignItems: "center", marginBottom: spacing(1) },
  prompt: { fontSize: typography.size.md, fontFamily: typography.fonts.display, color: palette.ink, textAlign: "center" },
  promptR2: { fontSize: typography.size.lg },
  questionCardR2: { padding: spacing(3) },
  banner: {
    alignSelf: "center",
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radii.pill,
    backgroundColor: palette.stage,
    ...shadow.sm,
  },
  bannerAdvance: { backgroundColor: "#E6FBF0" },
  bannerOut: { backgroundColor: "#FFECEC" },
  bannerText: { fontSize: typography.size.sm, fontFamily: typography.fonts.display, color: palette.ink },
  answerArea: { paddingTop: spacing(1) },
  spectator: { paddingVertical: spacing(2), alignItems: "center", gap: spacing(2) },
  qualifiedMsg: { color: palette.correct, fontSize: typography.size.md, fontFamily: typography.fonts.display, textAlign: "center" },
  spectatorText: { color: palette.inkSoft, fontSize: typography.size.sm, fontFamily: typography.fonts.body, textAlign: "center" },
  homeBtn: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: palette.hairline,
    backgroundColor: palette.stage,
  },
  homeBtnText: { color: palette.inkSoft, fontFamily: typography.fonts.display, fontSize: typography.size.sm },
});
