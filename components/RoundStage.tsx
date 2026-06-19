import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { normalizeEntry } from "../engine/validation";
import { useGameStore } from "../store/gameStore";
import { palette, radii, shadow, spacing, typography } from "../theme";
import { AnswerOptions } from "./AnswerOptions";
import { BradyHost } from "./BradyHost";
import { CountdownTimer } from "./CountdownTimer";
import { ListAnswer, type ListEntryView } from "./ListAnswer";
import { NumericAnswer } from "./NumericAnswer";
import { R2Visual } from "./R2Visual";
import { PlayerLineup, type LineupItem } from "./PlayerLineup";
import { SpeechBubble } from "./SpeechBubble";

const ROUND_TITLE: Record<string, string> = {
  "1": "Round 1 · General Trivia",
  "2": "Round 2 · Flags & Geography",
  "3": "Round 3 · Numeric Estimate",
  final: "Final · Name As Many",
};

export function RoundStage({ now }: { now: number }) {
  const s = useGameStore();
  const q = s.current;
  const byId = useMemo(
    () => Object.fromEntries(s.players.map((p) => [p.id, p])),
    [s.players],
  );

  // Live list-entry validation (final).
  const accepted = useMemo(() => {
    if (!q || q.type !== "list") return null;
    const set = new Set(q.acceptable.map(normalizeEntry));
    if (q.totalPossible === "open" && q.openDictionaryKey) {
      for (const w of s.supplements?.[q.openDictionaryKey] ?? []) set.add(normalizeEntry(w));
    }
    return set;
  }, [q, s.supplements]);

  if (!q) return null;

  const reveal = s.phase === "reveal" ? s.reveal : null;
  const humanInPool = s.pool.includes("human");
  const totalMs = Math.max(1, s.deadlineAt - s.questionStartAt);
  const remainingMs = s.deadlineAt - now;
  const prompt = q.type === "list" ? q.prompt : q.question;
  const category = q.type === "list" ? "" : q.category;

  // Lineup view-models (reveal discipline: no green/red until reveal).
  const items: LineupItem[] = s.pool.map((id) => {
    const p = byId[id];
    const base = { id, name: p.name, avatar: p.avatar, isHuman: p.kind === "human" };
    if (reveal) {
      const row = reveal.rows.find((r) => r.playerId === id)!;
      let ring: string = palette.neutral;
      let captionColor: string = palette.inkSoft;
      if (q.type === "multiple_choice") {
        ring = row.correct ? palette.correct : palette.incorrect;
        captionColor = row.correct ? palette.correct : palette.incorrect;
      } else if (row.isWinner) {
        ring = palette.correct;
        captionColor = palette.correct;
      }
      if (row.isWinner) ring = palette.accent;
      return {
        ...base,
        ringColor: ring,
        badge: row.isWinner ? "★" : undefined,
        badgeColor: palette.accent,
        caption: row.display,
        captionColor,
      };
    }
    const locked = !!s.locked[id] || (id === "human" && s.humanLocked);
    return {
      ...base,
      ringColor: locked ? palette.primary : palette.neutral,
      caption: locked ? "Locked in" : "Thinking…",
      captionColor: locked ? palette.primary : palette.neutral,
    };
  });

  // Reveal banner.
  let banner: { text: string; tint: "advance" | "out" | "neutral" } | null = null;
  if (reveal) {
    const w = reveal.winnerId;
    if (q.type === "list") {
      banner = w
        ? { text: `🏆 ${byId[w].name} wins the episode!`, tint: "advance" }
        : { text: "Tie! Sudden death...", tint: "neutral" };
    } else if (w) {
      const next = s.round === 1 ? "Round 2" : s.round === 2 ? "Round 3" : "the Final";
      if (s.pool.length === 2) {
        const loser = s.pool.find((id) => id !== w)!;
        banner = { text: `${byId[w].name} advances · ${byId[loser].name} eliminated`, tint: "out" };
      } else {
        banner = { text: `${byId[w].name} advances to ${next}!`, tint: "advance" };
      }
    } else {
      banner = { text: "Nobody got it — next question!", tint: "neutral" };
    }
  }

  // Human list entries with live valid flags.
  let listViews: ListEntryView[] = [];
  let validCount = 0;
  if (q.type === "list" && accepted) {
    const seen = new Set<string>();
    for (const e of s.listEntries) {
      const n = normalizeEntry(e);
      const valid = accepted.has(n) && !seen.has(n);
      if (valid) seen.add(n);
      listViews.push({ text: e, valid });
    }
    validCount = seen.size;
  }
  const humanSub = s.locked["human"];

  return (
    <View style={styles.stage}>
      {/* Header: round + timer */}
      <View style={styles.header}>
        <View>
          <Text style={styles.roundTitle}>{ROUND_TITLE[String(s.round)]}</Text>
          {category ? <Text style={styles.category}>{category}</Text> : null}
        </View>
        {!reveal ? <CountdownTimer remainingMs={remainingMs} totalMs={totalMs} /> : null}
      </View>

      {/* Brady + question prompt */}
      <View style={styles.brady}>
        <BradyHost expression={s.hostExpression} size={118} />
        {reveal ? (
          <SpeechBubble text={s.hostLine} tint={s.hostTint} />
        ) : (
          <View style={styles.questionCard}>
            {q.type === "multiple_choice" && q.asset && q.asset.kind !== "none" ? (
              <View style={styles.visualWrap}>
                <R2Visual question={q} width={230} />
              </View>
            ) : null}
            <Text style={styles.prompt}>{prompt}</Text>
          </View>
        )}
      </View>

      {/* Lineup */}
      <PlayerLineup items={items} avatarSize={q.type === "list" ? 64 : 52} />

      {/* Reveal banner */}
      {banner ? (
        <View
          style={[
            styles.banner,
            banner.tint === "advance" && styles.bannerAdvance,
            banner.tint === "out" && styles.bannerOut,
          ]}
        >
          <Text style={styles.bannerText}>{banner.text}</Text>
        </View>
      ) : null}

      {/* Answer area */}
      <View style={styles.answerArea}>
        {!humanInPool ? (
          <View style={styles.spectator}>
            <Text style={styles.spectatorText}>👀 You're spectating — auto-playing the bots…</Text>
          </View>
        ) : q.type === "multiple_choice" ? (
          <AnswerOptions
            options={q.options}
            onPick={(opt) => s.submitHuman(opt)}
            locked={s.humanLocked}
            humanPick={typeof humanSub?.value === "string" ? humanSub.value : undefined}
            reveal={reveal ? { correctAnswer: q.answer } : undefined}
          />
        ) : q.type === "numeric" ? (
          <NumericAnswer
            unit={q.unit}
            onSubmit={(v) => s.submitHuman(v)}
            locked={s.humanLocked}
            submittedValue={humanSub ? String(humanSub.value) : undefined}
            reveal={
              reveal
                ? {
                    correctAnswer: q.answer,
                    humanGuess: humanSub ? String(humanSub.value) : "—",
                    distance: reveal.rows.find((r) => r.playerId === "human")?.distance,
                  }
                : undefined
            }
          />
        ) : (
          <ListAnswer
            onAdd={(t) => s.addListEntry(t)}
            entries={listViews}
            validCount={validCount}
            totalPossible={q.totalPossible}
            disabled={!!reveal}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, paddingHorizontal: spacing(4), paddingTop: spacing(2), gap: spacing(3) },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  roundTitle: { fontSize: typography.size.md, fontWeight: typography.weight.heavy, color: palette.ink },
  category: { fontSize: typography.size.xs, color: palette.inkSoft, fontWeight: typography.weight.medium, marginTop: 2 },
  brady: { alignItems: "center", gap: spacing(2) },
  questionCard: {
    backgroundColor: palette.stage,
    borderRadius: radii.lg,
    padding: spacing(4),
    maxWidth: 480,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: palette.hairline,
    ...shadow.md,
  },
  visualWrap: { alignItems: "center", marginBottom: spacing(3) },
  prompt: { fontSize: typography.size.lg, fontWeight: typography.weight.heavy, color: palette.ink, textAlign: "center" },
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
  bannerText: { fontSize: typography.size.sm, fontWeight: typography.weight.heavy, color: palette.ink },
  answerArea: { flex: 1, justifyContent: "flex-start", paddingTop: spacing(2) },
  spectator: { padding: spacing(5), alignItems: "center" },
  spectatorText: { color: palette.inkSoft, fontSize: typography.size.md, fontWeight: typography.weight.medium },
});
