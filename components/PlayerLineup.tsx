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
        {items.map((p) => (
          <View key={p.id} style={styles.slot}>
            <Contestant
              config={p.avatar}
              name={p.name}
              size={avatarSize}
              ringColor={p.ringColor}
              dimmed={p.dimmed}
              badge={p.badge}
              badgeColor={p.badgeColor}
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
    overflow: "hidden",
    paddingTop: spacing(3),
    paddingHorizontal: spacing(1),
  },
  floor: { position: "absolute", left: 0, right: 0, bottom: 0, height: "34%", backgroundColor: palette.surfaceAlt },
  floorLine: { position: "absolute", left: 0, right: 0, bottom: "34%", height: 2, backgroundColor: palette.hairline },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: spacing(1),
  },
  slot: { alignItems: "center", paddingHorizontal: spacing(0.5) },
  name: {
    marginTop: spacing(1),
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: palette.inkSoft,
    maxWidth: 76,
    textAlign: "center",
  },
  human: { color: palette.primary, fontWeight: typography.weight.heavy },
  dim: { color: palette.neutral },
  caption: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: typography.weight.medium,
    color: palette.neutral,
    height: 14,
  },
  captionSpacer: { height: 14, marginTop: 2 },
});
