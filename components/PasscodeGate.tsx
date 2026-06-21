import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useGateStore } from "../store/gateStore";
import { unlockAudio } from "../audio/sfx";
import { palette, radii, shadow, spacing, typography } from "../theme";
import { BradyHost } from "./BradyHost";
import { PrimaryButton } from "./PrimaryButton";

/**
 * Demo passcode gate (spec §16). Rendered full-screen in place of the whole app
 * until the visitor enters the shared code — see app/_layout.tsx. Kept as a plain
 * component (not a route) so there are no navigation races with the gate guard.
 */
export function PasscodeGate() {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const submit = () => {
    unlockAudio(); // prime mobile audio from this user gesture
    const ok = useGateStore.getState().tryUnlock(code);
    if (!ok) {
      setError(true);
      setCode("");
    }
    // On success the store flips `unlocked` → RootLayout swaps in the app.
  };

  return (
    <SafeAreaView style={styles.stage}>
      <View style={styles.card}>
        <View style={styles.kickerPill}>
          <Text style={styles.kicker}>A MAGNET GAMES PRODUCTION</Text>
        </View>
        <BradyHost expression="asking" size={110} />
        <Text style={styles.title}>BradyYourTutor</Text>
        <View style={styles.underline} />
        <Text style={styles.sub}>Private preview — enter the passcode to continue.</Text>

        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={code}
          onChangeText={(t) => {
            setCode(t);
            if (error) setError(false);
          }}
          placeholder="Passcode"
          placeholderTextColor={palette.neutral}
          autoCapitalize="characters"
          autoCorrect={false}
          autoFocus
          returnKeyType="go"
          onSubmitEditing={submit}
          maxLength={24}
        />
        {error ? <Text style={styles.errorText}>Incorrect passcode — try again.</Text> : null}

        <PrimaryButton title="Enter" variant="accent" onPress={submit} style={styles.btn} />

        <Text style={styles.fine}>Shared in confidence — please don't redistribute this link.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: palette.stageTint, alignItems: "center", justifyContent: "center", padding: spacing(5) },
  card: { width: "100%", maxWidth: 380, alignItems: "center", gap: spacing(2) },
  kickerPill: { backgroundColor: palette.surface, borderRadius: radii.pill, paddingHorizontal: spacing(3), paddingVertical: spacing(1) },
  kicker: { color: palette.inkSoft, fontSize: typography.size.xs, letterSpacing: 2, fontFamily: typography.fonts.display },
  title: { color: palette.ink, fontSize: typography.size.xxl, fontFamily: typography.fonts.display, letterSpacing: -0.5, marginTop: spacing(1) },
  underline: { width: 56, height: 5, borderRadius: radii.pill, backgroundColor: palette.accent },
  sub: { color: palette.inkSoft, fontSize: typography.size.md, fontFamily: typography.fonts.body, textAlign: "center", marginTop: spacing(1), marginBottom: spacing(2) },
  input: {
    width: "100%",
    backgroundColor: palette.stage,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: palette.hairline,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3.5),
    fontSize: typography.size.xl,
    fontFamily: typography.fonts.display,
    color: palette.ink,
    textAlign: "center",
    letterSpacing: 4,
    ...shadow.sm,
  },
  inputError: { borderColor: palette.incorrect },
  errorText: { color: palette.incorrect, fontSize: typography.size.sm, fontFamily: typography.fonts.display },
  btn: { marginTop: spacing(2), alignSelf: "stretch" },
  fine: { color: palette.neutral, fontSize: typography.size.xs, fontFamily: typography.fonts.body, textAlign: "center", marginTop: spacing(3) },
});
