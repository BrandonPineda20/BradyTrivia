import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

import { glow } from "../theme";

/**
 * Stage-light glow (signature brand motif). A soft yellow radial gradient that
 * sits *behind* the host / champion so they feel spotlit on the white stage.
 * Decorative + non-interactive; place it as an absolutely-centered sibling.
 */
export function Spotlight({ size = 320, color = glow.core, intensity = 0.55 }: { size?: number; color?: string; intensity?: number }) {
  return (
    <View pointerEvents="none" style={[styles.wrap, { width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="spot" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={intensity} />
            <Stop offset="55%" stopColor={color} stopOpacity={intensity * 0.22} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#spot)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  // Anchored to the parent's center (top/left 50%) then pulled back by half its size.
  wrap: { position: "absolute", top: "50%", left: "50%" },
});
