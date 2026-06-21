import { Pressable, StyleSheet, Text, type ViewStyle } from "react-native";

import { playSfx } from "../audio/sfx";
import { palette, radii, shadow, spacing, typography } from "../theme";

type Variant = "primary" | "accent" | "ghost";

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: ViewStyle;
  fontSize?: number;
};

/** Chunky rounded brand button ("YouTube-thumbnail energy", §3.1) with depth + press. */
export function PrimaryButton({ title, onPress, variant = "primary", disabled, style, fontSize }: Props) {
  const elevated = variant !== "ghost";
  return (
    <Pressable
      onPress={(e) => { playSfx("tap"); onPress?.(e as any); }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && styles.primary,
        variant === "accent" && styles.accent,
        variant === "ghost" && styles.ghost,
        elevated && (pressed ? shadow.press : shadow.md),
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === "accent" && { color: palette.onAccent },
          variant === "ghost" && { color: palette.ink },
          fontSize != null && { fontSize },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(4),
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: palette.primary },
  accent: { backgroundColor: palette.accent },
  ghost: { backgroundColor: "transparent", borderWidth: 2, borderColor: palette.hairline },
  pressed: { transform: [{ translateY: 1 }, { scale: 0.985 }] },
  disabled: { opacity: 0.45 },
  label: {
    color: palette.onPrimary,
    fontSize: typography.size.lg,
    fontFamily: typography.fonts.display,
    letterSpacing: 1.5,
  },
});
