import { useState } from "react";
import { Pressable, type PressableProps } from "react-native";
import { playClick } from "../audio/sfx";

/** Drop-in Pressable that plays the button click sound on commit (finger up).
 *  - Dims to 65% opacity while actively pressed (reverts if finger slides off).
 *  - Dims to 82% opacity on desktop hover.
 *  For callers that pass a style function, pressed/hover state is merged on top. */
export function SoundPressable({ onPress, onPressIn, style, ...rest }: PressableProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      {...rest}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPressIn={onPressIn}
      onPress={(e) => {
        playClick();
        onPress?.(e);
      }}
      style={(state) => {
        const base = typeof style === "function" ? style(state) : style;
        return [
          base,
          hovered && !state.pressed && { opacity: 0.82 },
          state.pressed && { opacity: 0.65 },
        ];
      }}
    />
  );
}
