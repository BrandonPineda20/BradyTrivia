import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

// 9 brains in a 3×3 grid, evenly covering the screen
const BRAINS = [
  { left: "8%",  top: "10%", size: 26, period: 7000,  phase: 0,    dy: 18, dx: 8,  opacity: 0.07 },
  { left: "42%", top: "8%",  size: 20, period: 9000,  phase: 1500, dy: 14, dx: 10, opacity: 0.06 },
  { left: "78%", top: "12%", size: 30, period: 8000,  phase: 800,  dy: 20, dx: 7,  opacity: 0.07 },
  { left: "5%",  top: "42%", size: 22, period: 10000, phase: 2000, dy: 16, dx: 12, opacity: 0.06 },
  { left: "45%", top: "45%", size: 28, period: 7500,  phase: 600,  dy: 22, dx: 9,  opacity: 0.05 },
  { left: "80%", top: "40%", size: 18, period: 8500,  phase: 3000, dy: 14, dx: 11, opacity: 0.07 },
  { left: "10%", top: "74%", size: 24, period: 9500,  phase: 1200, dy: 18, dx: 8,  opacity: 0.06 },
  { left: "46%", top: "78%", size: 32, period: 7000,  phase: 4000, dy: 20, dx: 10, opacity: 0.05 },
  { left: "76%", top: "72%", size: 22, period: 8000,  phase: 500,  dy: 16, dx: 7,  opacity: 0.07 },
];

function Brain({ left, top, size, period, phase, dy, dx, opacity }: typeof BRAINS[0]) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(phase),
        Animated.timing(anim, { toValue: 1, duration: period / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: period / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, dy] });
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, dx] });

  return (
    <Animated.Text
      style={[styles.brain, { left, top, fontSize: size, opacity, transform: [{ translateY }, { translateX }] }]}
    >
      🧠
    </Animated.Text>
  );
}

export function FloatingBrains() {
  return (
    <View style={styles.container} pointerEvents="none">
      {BRAINS.map((b, i) => <Brain key={i} {...b} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
  brain: { position: "absolute" },
});
