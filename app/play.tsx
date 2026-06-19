import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BradyHost } from "../components/BradyHost";
import { LobbyView } from "../components/LobbyView";
import { ResultsView } from "../components/ResultsView";
import { RoundStage } from "../components/RoundStage";
import { resolveEpisodeSeed } from "../config/demo";
import { QUESTION_BANK } from "../content";
import { useGameStore } from "../store/gameStore";
import { useProfileStore } from "../store/profileStore";
import { palette, spacing, typography } from "../theme";

const CONTENT = {
  round1: QUESTION_BANK.round1,
  round2: QUESTION_BANK.round2,
  round3: QUESTION_BANK.round3,
  final: QUESTION_BANK.final,
};

const ROUND_TITLE: Record<string, string> = {
  "1": "Round 1 · General Trivia",
  "2": "Round 2 · Flags & Geography",
  "3": "Round 3 · Numeric Estimate",
  final: "Final · Name As Many",
};

/** The game: drives the store in real time and switches views by phase. */
export default function Play() {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const phase = useGameStore((s) => s.phase);

  const startEpisode = () => {
    const { name, avatar } = useProfileStore.getState();
    useGameStore.getState().start({
      seed: resolveEpisodeSeed().seed, // ?demo=1 / ?seed=N curate the pitch run; else random
      content: CONTENT,
      humanName: name || "You",
      humanAvatar: avatar ?? undefined,
    });
  };

  useEffect(() => {
    startEpisode();
    const id = setInterval(() => {
      const n = Date.now();
      setNow(n);
      useGameStore.getState().tick(n);
    }, 120);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.stage}>
      {(phase === "idle" || phase === "lobby") && <LobbyView />}
      {phase === "round-intro" && <RoundIntro />}
      {(phase === "question" || phase === "reveal") && <RoundStage now={now} />}
      {phase === "results" && (
        <ResultsView onPlayAgain={startEpisode} onHome={() => router.replace("/")} />
      )}
    </SafeAreaView>
  );
}

/** Round intro / transition card (§7.6). */
function RoundIntro() {
  const s = useGameStore();
  const remaining = s.pool.length;
  const elimPlace = s.round === 2 ? 5 : s.round === 3 ? 4 : s.round === "final" ? 3 : null;
  const elim = elimPlace ? s.players.find((p) => p.placement === elimPlace) : undefined;
  return (
    <View style={styles.intro}>
      <BradyHost expression="tension" size={120} />
      <Text style={styles.introRound}>{ROUND_TITLE[String(s.round)]}</Text>
      <Text style={styles.introSub}>
        {remaining} {remaining === 1 ? "player" : "players"} remain
      </Text>
      {elim ? (
        <Text style={styles.elim}>
          ❌ {elim.kind === "human" ? "You were" : `${elim.name} was`} eliminated
        </Text>
      ) : (
        <Text style={styles.go}>Here we go!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: palette.stage },
  intro: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing(2), padding: spacing(5) },
  introRound: { fontSize: typography.size.xl, fontWeight: typography.weight.heavy, color: palette.ink, textAlign: "center" },
  introSub: { fontSize: typography.size.md, color: palette.primary, fontWeight: typography.weight.medium },
  elim: { fontSize: typography.size.md, color: palette.incorrect, fontWeight: typography.weight.heavy, marginTop: spacing(2) },
  go: { fontSize: typography.size.md, color: palette.inkSoft, fontWeight: typography.weight.medium, marginTop: spacing(2) },
});
