import { Pressable, type PressableProps } from "react-native";
import { playClick } from "../audio/sfx";

/** Drop-in Pressable that plays the button click sound on every press. */
export function SoundPressable({ onPress, onPressIn, ...rest }: PressableProps) {
  return (
    <Pressable
      {...rest}
      onPressIn={(e) => {
        playClick();
        onPressIn?.(e);
      }}
      onPress={onPress}
    />
  );
}
