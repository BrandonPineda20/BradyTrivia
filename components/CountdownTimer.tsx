import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { palette, radii, typography } from "../theme";

/** Countdown timer (§4.1) with an urgent pulse + tick in the final seconds (§3.2). */
export function CountdownTimer({ remainingMs, totalMs }: { remainingMs: number; totalMs: number }) {
  const remaining = Math.max(0, remainingMs);
  const secs = Math.ceil(remaining / 1000);
  const frac = totalMs > 0 ? remaining / totalMs : 0;
  const urgent = frac <= 0.34;
  const color = urgent ? palette.incorrect : palette.primary;

  const scale = useRef(new Animated.Value(1)).current;
  const lastSec = useRef(secs);

  useEffect(() => {
    if (secs !== lastSec.current) {
      lastSec.current = secs;
      if (urgent && secs > 0 && secs <= 5) {
        scale.setValue(1.3);
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4, tension: 120 }).start();
      }
    }
  }, [secs, urgent, scale]);

  return (
    <View style={styles.wrap}>
      <Animated.Text style={[styles.num, { color, transform: [{ scale }] }]}>{secs}</Animated.Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(0, Math.min(1, frac)) * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", width: 120 },
  num: { fontSize: typography.size.xxl, fontFamily: typography.fonts.display, lineHeight: 44 },
  track: { marginTop: 4, width: "100%", height: 8, borderRadius: radii.pill, backgroundColor: palette.surface, overflow: "hidden" },
  fill: { height: "100%", borderRadius: radii.pill },
});
