import { StyleSheet, Text, View } from "react-native";

import type { AvatarConfig } from "../engine/types";
import { palette, spacing, typography } from "../theme";
import { Avatar } from "./Avatar";

export type LineupItem = {
  id: string;
  name: string;
  avatar: AvatarConfig;
  isHuman: boolean;
  ringColor?: string;
  dimmed?: boolean;
  badge?: string;
  badgeColor?: string;
  /** Status line under the avatar — e.g. "Locked in", "Thinking…", or the revealed answer. */
  caption?: string;
  captionColor?: string;
};

/** The 5-avatar white-stage lineup (§5.1, §7). Status never reveals correctness mid-question. */
export function PlayerLineup({
  items,
  avatarSize = 56,
}: {
  items: LineupItem[];
  avatarSize?: number;
}) {
  return (
    <View style={styles.row}>
      {items.map((p) => (
        <View key={p.id} style={[styles.slot, { width: avatarSize + 28 }]}>
          <Avatar
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
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: spacing(1),
  },
  slot: { alignItems: "center", paddingHorizontal: spacing(1) },
  name: {
    marginTop: spacing(1.5),
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
