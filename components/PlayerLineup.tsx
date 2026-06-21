import { StyleSheet, Text, View } from "react-native";

import type { AvatarConfig } from "../engine/types";
import { palette, radii, spacing, typography } from "../theme";
import { Contestant } from "./Contestant";

export type LineupItem = {
  id: string;
  name: string;
  avatar: AvatarConfig;
  isHuman: boolean;
  ringColor?: string;
  dimmed?: boolean;
  badge?: string;
  badgeColor?: string;
  sparkle?: boolean;
  /** Status line under the contestant — e.g. "Locked in", "Thinking…", or the revealed answer. */
  caption?: string;
  captionColor?: string;
};

/** The 5-contestant white-stage lineup (§5.1, §7): full-body figures standing in a
 *  room, like the videos. Status never reveals correctness mid-question. */
export function PlayerLineup({
  items,
  avatarSize = 48,
}: {
  items: LineupItem[];
  avatarSize?: number;
}) {
  return (
    <View style={styles.room}>
      <View style={styles.floor} />
      <View style={styles.floorLine} />
      <View style={styles.row}>
        {items.map((p, i) => (
          <View key={p.id} style={[styles.slot, i > 0 && styles.slotOverlap]}>
            <Contestant
              config={p.avatar}
              name={p.name}
              size={avatarSize}
              ringColor={p.ringColor}
              dimmed={p.dimmed}
              badge={p.badge}
              badgeColor={p.badgeColor}
              sparkle={p.sparkle}
            />
            <Text
              numberOfLines={1}
              style={[styles.name, p.isHuman && styles.human, p.dimmed && styles.dim]}
            >
              {p.isHuman ? "You" : p.name}
            </Text>
            {p.caption ? (
              <Text numberOfLines={1} style={[styles.caption, p.captionColor ? { color: p.captionColor } : null]}>
                {p.caption}
              </Text>
            ) : (
              <View style={styles.captionSpacer} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Game-show "room": soft back wall with a floor band the contestants stand on.
  room: {
    width: "100%",
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    overflow: "visible",
    paddingTop: 24,
    paddingHorizontal: 0,
  },
  floor: { position: "absolute", left: 0, right: 0, bottom: 0, height: "30%", backgroundColor: palette.surfaceAlt },
  floorLine: { position: "absolute", left: 0, right: 0, bottom: "30%", height: 2, backgroundColor: palette.hairline },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    flexWrap: "nowrap",
    paddingHorizontal: spacing(1),
  },
  slot: { alignItems: "center", minWidth: 0, flex: 1 },
  slotOverlap: {},
  name: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: typography.fonts.display,
    fontWeight: typography.weight.heavy,
    color: palette.ink,
    textAlign: "center",
    width: "100%",
  },
  human: { color: palette.primary },
  dim: { color: palette.neutral },
  caption: {
    marginTop: 1,
    fontSize: 9,
    fontWeight: typography.weight.medium,
    color: palette.neutral,
    height: 12,
    textAlign: "center",
    width: "100%",
  },
  captionSpacer: { height: 12, marginTop: 1 },
});
