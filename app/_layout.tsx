import { BebasNeue_400Regular, useFonts } from "@expo-google-fonts/bebas-neue";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { PasscodeGate } from "../components/PasscodeGate";
import { useGateStore } from "../store/gateStore";
import { useProfileStore } from "../store/profileStore";
import { useProgressionStore } from "../store/progressionStore";
import { useSettingsStore } from "../store/settingsStore";
import { palette } from "../theme";

export default function RootLayout() {
  const gateLoaded = useGateStore((s) => s.loaded);
  const unlocked = useGateStore((s) => s.unlocked);
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });

  useEffect(() => {
    useGateStore.getState().load();
    useProfileStore.getState().load();
    useProgressionStore.getState().load();
    useSettingsStore.getState().load();
  }, []);

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: palette.stage }} />;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {/* Demo passcode gate (§16): until resolved+unlocked, the whole app is held
          behind the gate so the unlisted link can't be casually shared. */}
      {!gateLoaded ? (
        <View style={{ flex: 1, backgroundColor: palette.stage }} />
      ) : !unlocked ? (
        <PasscodeGate />
      ) : (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: palette.stage },
          }}
        />
      )}
    </SafeAreaProvider>
  );
}
