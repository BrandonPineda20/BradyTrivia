import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SoundPressable } from "../components/SoundPressable";
import { SafeAreaView } from "react-native-safe-area-context";

import { BradyHost } from "../components/BradyHost";
import { FloatingBrains } from "../components/FloatingBrains";
import { PixelIcon } from "../components/PixelIcon";
import { LobbyView } from "../components/LobbyView";
import { ResultsView } from "../components/ResultsView";
import { RoundStage } from "../components/RoundStage";
import { resolveEpisodeSeed } from "../config/demo";
import { QUESTION_BANK } from "../content";
import { unlockAudio } from "../audio/sfx";
import { resetFanfare } from "../components/ResultsView";
import { useGameStore } from "../store/gameStore";
import { useProfileStore } from "../store/profileStore";
import { palette, radii, spacing, typography } from "../theme";

const CONTENT = {
  round1: QUESTION_BANK.round1,
  round2: QUESTION_BANK.round2.filter((q) => q.asset && q.asset.kind !== "none"),
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
    unlockAudio();   // ensure mobile audio is unblocked from this gesture
    resetFanfare();  // allow fanfare to play for this new game
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

  const inGame = phase === "round-intro" || phase === "question" || phase === "reveal";

  return (
    <SafeAreaView style={styles.stage}>
      {inGame && <FloatingBrains />}
      {phase !== "results" && (
        <>
          <Pressable style={styles.devHome} onPress={() => router.replace("/")}>
            <Text style={styles.devHomeText}>Dev only home button</Text>
          </Pressable>
          <Pressable style={styles.devSkip} onPress={() => useGameStore.getState().devSkipRound()}>
            <Text style={styles.devHomeText}>Dev only skip round</Text>
          </Pressable>
        </>
      )}
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
  const router = useRouter();
  const s = useGameStore();
  const remaining = s.pool.length;
  const elimPlace = s.round === 2 ? 5 : s.round === 3 ? 4 : s.round === "final" ? 3 : null;
  const elim = elimPlace ? s.players.find((p) => p.placement === elimPlace) : undefined;
  const humanEliminated = elim?.kind === "human";
  return (
    <View style={styles.intro}>
      <BradyHost expression="tension" size={120} />
      <Text style={styles.introRound}>{ROUND_TITLE[String(s.round)]}</Text>
      <Text style={styles.introSub}>
        {remaining} {remaining === 1 ? "player" : "players"} remain
      </Text>
      {elim ? (
        <View style={styles.elimRow}>
          <PixelIcon name="x_mark" size={16} />
          <Text style={styles.elim}>{humanEliminated ? "You were" : `${elim.name} was`} eliminated</Text>
        </View>
      ) : (
        <Text style={styles.go}>Here we go!</Text>
      )}
      {humanEliminated && (
        <SoundPressable style={styles.homeBtn} onPress={() => router.replace("/")}>
          <Text style={styles.homeBtnText}>Go Home</Text>
        </SoundPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: palette.stage },
  devHome: { position: "absolute", top: 48, left: 12, zIndex: 999, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "rgba(0,0,0,0.45)", borderRadius: 6 },
  devSkip: { position: "absolute", top: 82, left: 12, zIndex: 999, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "rgba(180,0,0,0.55)", borderRadius: 6 },
  devHomeText: { color: "#fff", fontSize: 11, fontFamily: "monospace" },
  intro: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing(2), padding: spacing(5) },
  introRound: { fontSize: typography.size.xxl, fontFamily: typography.fonts.display, color: palette.ink, textAlign: "center" },
  introSub: { fontSize: typography.size.lg, color: palette.primary, fontFamily: typography.fonts.body },
  elimRow: { flexDirection: "row", alignItems: "center", gap: spacing(1.5), marginTop: spacing(2) },
  elim: { fontSize: typography.size.lg, color: palette.incorrect, fontFamily: typography.fonts.display },
  go: { fontSize: typography.size.lg, color: palette.inkSoft, fontFamily: typography.fonts.body, marginTop: spacing(2) },
  homeBtn: {
    marginTop: spacing(3),
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(2.5),
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: palette.hairline,
  },
  homeBtnText: { color: palette.inkSoft, fontFamily: typography.fonts.display, fontSize: typography.size.sm },
});
