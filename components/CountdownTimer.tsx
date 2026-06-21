import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { palette, radii, typography } from "../theme";

// Preload both beep assets once so playback is instant when the second ticks.
let _tickAudio: HTMLAudioElement | null = null;
let _finalAudio: HTMLAudioElement | null = null;
function getTickAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!_tickAudio) {
    const src = require("../audio/ribhavagrawal-point-smooth-beep-230573.mp3");
    _tickAudio = new Audio(typeof src === "string" ? src : src?.uri ?? String(src));
    _tickAudio.volume = 0.4;
    _tickAudio.load();
  }
  return _tickAudio;
}
function getFinalAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!_finalAudio) {
    const src = require("../audio/freesound_community-beep-6-96243.mp3");
    _finalAudio = new Audio(typeof src === "string" ? src : src?.uri ?? String(src));
    _finalAudio.volume = 0.4;
    _finalAudio.load();
  }
  return _finalAudio;
}
function playBeep(audio: HTMLAudioElement | null) {
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

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
      // Countdown beeps: smooth beep at 4/3/2, final beep at 1
      if (secs === 4 || secs === 3 || secs === 2) playBeep(getTickAudio());
      else if (secs === 1) playBeep(getFinalAudio());
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
