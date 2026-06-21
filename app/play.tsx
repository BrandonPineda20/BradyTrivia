import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SoundPressable } from "../components/SoundPressable";
import { SafeAreaView } from "react-native-safe-area-context";

import { BradyHost } from "../components/BradyHost";
import { FloatingBrains } from "../components/FloatingBrains";
import { PixelIcon } from "../components/PixelIcon";
import { Avatar } from "../components/Avatar";
import { LobbyView } from "../components/LobbyView";
import { ResultsView } from "../components/ResultsView";
import { RoundStage } from "../components/RoundStage";
import { resolveEpisodeSeed } from "../config/demo";
import { QUESTION_BANK } from "../content";
import { unlockAudio } from "../audio/sfx";
import { resetFanfare } from "../components/ResultsView";
import { useGameStore } from "../store/gameStore";
import { useProgressionStore } from "../store/progressionStore";
import { useProfileStore } from "../store/profileStore";
import { flagFor, outlineFor } from "../theme/r2-assets";
import { palette, radii, shadow, spacing, typography } from "../theme";

const CONTENT = {
  round1: QUESTION_BANK.round1,
  round2: QUESTION_BANK.round2.filter((q) => {
    if (!q.asset || q.asset.kind === "none") return false;
    if (q.asset.kind === "country_outline") return !!outlineFor(q.asset.country);
    return !!flagFor(q.asset.country);
  }),
  round3: QUESTION_BANK.round3,
  final: QUESTION_BANK.final,
};

const ROUND_TITLE: Record<string, string> = {
  "1": "Round 1: General Trivia",
  "2": "Round 2: Flags & Geography",
  "3": "Round 3: Numeric Estimate",
  final: "Final: Name As Many",
};

const PREDICTION_XP = 50;

/** The game: drives the store in real time and switches views by phase. */
export default function Play() {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const phase = useGameStore((s) => s.phase);
  const humanEliminated = useGameStore((s) => s.humanEliminated);
  const predictionLocked = useGameStore((s) => !!s.championPrediction);
  const eliminationPoolSize = useGameStore((s) => s.eliminationPoolSize);
  const poolLength = useGameStore((s) => s.pool.length);
  const round = useGameStore((s) => s.round);

  // Prediction picker is visible while: eliminated, not locked, pool hasn't shrunk further
  const votingWindowOpen =
    humanEliminated &&
    !predictionLocked &&
    eliminationPoolSize !== null &&
    poolLength >= eliminationPoolSize;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  // showPicker stays true until the user locks in OR pool shrinks (auto-dismiss)
  const [showPicker, setShowPicker] = useState(false);
  const applyingRef = useRef(false);

  // Open picker as soon as human is eliminated
  useEffect(() => {
    if (humanEliminated && !predictionLocked) setShowPicker(true);
  }, [humanEliminated]);

  // Auto-dismiss picker when voting window closes (another player eliminated)
  useEffect(() => {
    if (showPicker && !votingWindowOpen && !predictionLocked) {
      setShowPicker(false);
    }
  }, [votingWindowOpen, showPicker, predictionLocked]);

  // Dismiss picker when user locks in or game reaches results
  useEffect(() => {
    if (predictionLocked || phase === "results") setShowPicker(false);
  }, [predictionLocked, phase]);

  const handleLockPrediction = () => {
    if (!selectedId) return;
    useGameStore.getState().setChampionPrediction(selectedId);
  };

  const handleGoHome = async () => {
    if (applyingRef.current) return;
    applyingRef.current = true;
    try {
      // Read episodeApplied from store directly — not from React closure which can be stale
      if (!useGameStore.getState().episodeApplied) {
        useGameStore.getState().markEpisodeApplied();
        const summary = useGameStore.getState().getEarlyLeaveSummary();
        const result = await useProgressionStore.getState().applyEpisode(summary);
        useProgressionStore.getState().setPendingXpDisplay({
          xpEarned: result.xpEarned,
          totalXp: result.totalXp,
          level: result.level,
          title: result.title,
          xpToNext: result.xpToNext,
          nextTitle: result.nextTitle,
          progress: result.progress,
        });
      }
      router.replace("/");
    } catch {
      applyingRef.current = false; // allow retry if something failed
    }
  };

  const startEpisode = () => {
    unlockAudio();
    resetFanfare();
    const { name, avatar } = useProfileStore.getState();
    useGameStore.getState().start({
      seed: resolveEpisodeSeed().seed,
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
      {phase === "round-intro" && <RoundIntro onGoHome={handleGoHome} />}
      {(phase === "question" || phase === "reveal") && <RoundStage now={now} onLeaveGame={humanEliminated ? handleGoHome : undefined} />}
      {phase === "results" && (
        <ResultsView onPlayAgain={startEpisode} onHome={() => router.replace("/")} />
      )}

      {/* Prediction picker modal — persists across phase changes until locked or window closes */}
      <Modal visible={showPicker} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerCard}>
            <BradyHost expression="tension" size={72} />
            <Text style={styles.pickerTitle}>Who will win?</Text>
            <Text style={styles.pickerSub}>Guess correctly and stay to earn +{PREDICTION_XP} XP</Text>
            <PickerList selectedId={selectedId} onSelect={setSelectedId} />
            <SoundPressable
              style={[styles.lockBtn, !selectedId && styles.lockBtnDisabled]}
              onPress={handleLockPrediction}
            >
              <Text style={styles.lockBtnText}>Lock in Pick</Text>
            </SoundPressable>
            <View style={styles.pickerFooter}>
              <SoundPressable style={styles.skipBtn} onPress={() => setShowPicker(false)}>
                <Text style={styles.skipBtnText}>Skip. Just spectate</Text>
              </SoundPressable>
              <Text style={styles.pickerFooterDivider}>|</Text>
              <SoundPressable style={styles.skipBtn} onPress={() => { setShowPicker(false); handleGoHome(); }}>
                <Text style={styles.skipBtnText}>Leave game</Text>
              </SoundPressable>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

/** Renders the selectable player list inside the picker modal. */
function PickerList({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string) => void }) {
  const players = useGameStore((s) => s.players);
  const pool = useGameStore((s) => s.pool);
  const remainingPlayers = players.filter((p) => pool.includes(p.id));
  return (
    <View style={styles.pickerList}>
      {remainingPlayers.map((p) => (
        <Pressable
          key={p.id}
          style={[styles.pickerRow, selectedId === p.id && styles.pickerRowSelected]}
          onPress={() => onSelect(p.id)}
        >
          <Avatar config={p.avatar} size={36} />
          <Text style={[styles.pickerName, selectedId === p.id && styles.pickerNameSelected]}>
            {p.name}
          </Text>
          {selectedId === p.id && <PixelIcon name="check" size={16} />}
        </Pressable>
      ))}
    </View>
  );
}

/** Round intro / transition card (§7.6). */
function RoundIntro({ onGoHome }: { onGoHome: () => void }) {
  const s = useGameStore();
  const remaining = s.pool.length;
  const elimPlace = s.round === 2 ? 5 : s.round === 3 ? 4 : s.round === "final" ? 3 : null;
  const elim = elimPlace ? s.players.find((p) => p.placement === elimPlace) : undefined;
  const humanEliminated = elim?.kind === "human";
  const predictionLocked = !!s.championPrediction;

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

      {humanEliminated && predictionLocked && (
        <View style={styles.predictionConfirm}>
          <PixelIcon name="star" size={16} />
          <Text style={styles.predictionConfirmText}>
            You picked{" "}
            <Text style={{ fontFamily: typography.fonts.display }}>
              {s.players.find((p) => p.id === s.championPrediction)?.name}
            </Text>
            {" "}— stay for results to earn +{PREDICTION_XP} XP!
          </Text>
        </View>
      )}

      {humanEliminated && (
        <SoundPressable style={styles.homeBtn} onPress={onGoHome}>
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

  // Prediction picker modal
  pickerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "flex-end" },
  pickerCard: { backgroundColor: palette.stage, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing(5), alignItems: "center", gap: spacing(2.5), width: "100%", paddingBottom: spacing(8) },
  pickerTitle: { fontSize: typography.size.xl, fontFamily: typography.fonts.display, color: palette.ink },
  pickerSub: { fontSize: typography.size.xs, color: palette.inkSoft, fontFamily: typography.fonts.body, textAlign: "center" },
  pickerList: { width: "100%", gap: spacing(1.5) },
  pickerRow: { flexDirection: "row", alignItems: "center", gap: spacing(2), paddingVertical: spacing(2), paddingHorizontal: spacing(3), borderRadius: radii.md, borderWidth: 1.5, borderColor: palette.hairline, backgroundColor: "#fff" },
  pickerRowSelected: { borderColor: palette.primary, backgroundColor: palette.primarySoft },
  pickerName: { flex: 1, fontSize: typography.size.md, fontFamily: typography.fonts.body, color: palette.ink },
  pickerNameSelected: { fontFamily: typography.fonts.display, color: palette.primary },
  lockBtn: { backgroundColor: palette.primary, borderRadius: radii.pill, paddingVertical: spacing(2.5), alignItems: "center", marginTop: spacing(1), width: "100%" },
  lockBtnDisabled: { opacity: 0.4 },
  lockBtnText: { fontSize: typography.size.md, fontFamily: typography.fonts.display, color: "#fff" },
  pickerFooter: { flexDirection: "row", alignItems: "center", gap: spacing(2) },
  pickerFooterDivider: { color: palette.hairline, fontSize: typography.size.xs },
  skipBtn: { paddingVertical: spacing(1.5) },
  skipBtnText: { fontSize: typography.size.xs, color: palette.inkSoft, fontFamily: typography.fonts.body },

  // Prediction confirmed (inline in RoundIntro)
  predictionConfirm: { flexDirection: "row", alignItems: "center", gap: spacing(1.5), backgroundColor: palette.primarySoft, borderRadius: radii.pill, paddingVertical: spacing(1.5), paddingHorizontal: spacing(3), marginTop: spacing(1) },
  predictionConfirmText: { fontSize: typography.size.xs, fontFamily: typography.fonts.body, color: palette.primary, flexShrink: 1 },

  // Go Home button
  homeBtn: { marginTop: spacing(3), paddingHorizontal: spacing(6), paddingVertical: spacing(2.5), borderRadius: radii.pill, borderWidth: 2, borderColor: palette.hairline },
  homeBtnText: { color: palette.inkSoft, fontFamily: typography.fonts.display, fontSize: typography.size.sm },

  // Leave XP modal
});
