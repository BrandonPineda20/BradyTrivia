import { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

import { palette } from "../theme";

const COLORS = [palette.accent, palette.primary, palette.correct, palette.incorrect, "#9b5de5", "#00bbf9"];

/** Confetti burst for the champion celebration (§3.2 / §4.8). Pure Animated, web-safe. */
export function Confetti({ count = 60 }: { count?: number }) {
  const { width, height } = Dimensions.get("window");
  const pieces = useRef(
    Array.from({ length: count }, (_, i) => ({
      startX: Math.random() * width,
      drift: (Math.random() - 0.5) * 160,
      delay: Math.random() * 700,
      duration: 2200 + Math.random() * 1600,
      spin: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540),
      color: COLORS[i % COLORS.length],
      size: 6 + Math.random() * 8,
      anim: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    const anims = pieces.map((p) =>
      Animated.timing(p.anim, { toValue: 1, duration: p.duration, delay: p.delay, useNativeDriver: true }),
    );
    Animated.parallel(anims).start();
  }, [pieces]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => {
        const translateY = p.anim.interpolate({ inputRange: [0, 1], outputRange: [-40, height + 60] });
        const translateX = p.anim.interpolate({ inputRange: [0, 1], outputRange: [p.startX, p.startX + p.drift] });
        const rotate = p.anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${p.spin}deg`] });
        const opacity = p.anim.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] });
        return (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size * 0.6,
              borderRadius: 2,
              backgroundColor: p.color,
              transform: [{ translateX }, { translateY }, { rotate }],
              opacity,
            }}
          />
        );
      })}
    </View>
  );
}
