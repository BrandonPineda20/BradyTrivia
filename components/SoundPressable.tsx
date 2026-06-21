import { Pressable, type PressableProps } from "react-native";
import { playClick } from "../audio/sfx";

/** Drop-in Pressable that plays the button click sound when the press is committed (finger up). */
export function SoundPressable({ onPress, onPressIn, ...rest }: PressableProps) {
  return (
    <Pressable
      {...rest}
      onPressIn={onPressIn}
      onPress={(e) => {
        playClick();
        onPress?.(e);
      }}
    />
  );
}
