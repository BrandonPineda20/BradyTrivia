import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { getCountdownTickAudio, getCountdownFinalAudio } from "../audio/sfx";
import { palette, radii, typography } from "../theme";

function playBeep(audio: HTMLAudioElement | null) {
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

/** Countdown timer (§4.1) with an urgent pulse + perfectly-timed beeps in the
 *  final 4 seconds. Pass deadlineAt so beeps are scheduled via setTimeout against
 *  the real wall clock rather than relying on the 120ms polling interval. */
export function CountdownTimer({
  remainingMs,
  totalMs,
  deadlineAt,
}: {
  remainingMs: number;
  totalMs: number;
  deadlineAt: number;
}) {
  const remaining = Math.max(0, remainingMs);
  const secs = Math.ceil(remaining / 1000);
  const frac = totalMs > 0 ? remaining / totalMs : 0;
  const urgent = frac <= 0.34;
  const color = urgent ? palette.incorrect : palette.primary;

  const scale = useRef(new Animated.Value(1)).current;
  const lastSec = useRef(secs);
  const timerIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Schedule all 4 beeps precisely against the real deadline whenever a new
  // question starts (deadlineAt changes). Clear any previous timers first.
  useEffect(() => {
    if (typeof window === "undefined") return;
    timerIds.current.forEach(clearTimeout);
    timerIds.current = [];

    const now = Date.now();
    const schedule: Array<[number, "tick" | "final"]> = [
      [deadlineAt - 4200, "tick"],
      [deadlineAt - 3000, "tick"],
      [deadlineAt - 2000, "tick"],
      [deadlineAt - 1000, "final"],
    ];

    for (const [fireAt, kind] of schedule) {
      const delay = fireAt - now;
      if (delay < 0) continue; // already past, skip
      timerIds.current.push(
        setTimeout(() => {
          playBeep(kind === "tick" ? getCountdownTickAudio() : getCountdownFinalAudio());
        }, delay)
      );
    }

    return () => {
      timerIds.current.forEach(clearTimeout);
      timerIds.current = [];
    };
  }, [deadlineAt]);

  // Visual pulse on each second tick in the urgent zone.
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
