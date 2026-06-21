import { Image, Platform, StyleSheet, Text, View } from "react-native";

import type { MCQuestion } from "../engine/types";
import { palette, radii, spacing, typography } from "../theme";
import { flagFor, outlineFor } from "../theme/r2-assets";

/** Web-only grayscale (§8.4 greyed flag). Native shows color until a native filter lands (post-MVP). */
const GREY = Platform.OS === "web" ? ({ filter: "grayscale(100%) contrast(1.04)" } as object) : null;

/**
 * Round 2 visual (§8.4): renders greyed / zoomed flag, or country outline, derived
 * from a reusable asset set rather than hand-drawn images. Reads question.asset.
 */
export function R2Visual({ question, width = 240 }: { question: MCQuestion; width?: number }) {
  const asset = question.asset;
  if (!asset || asset.kind === "none") return null;

  if (asset.kind === "country_outline") {
    const src = outlineFor(asset.country);
    if (!src) return <Missing label={asset.describes} />;
    const s = Math.round(width * 0.82);
    return (
      <View style={[styles.outlineBox, { width: s, height: s }]}>
        <Image source={src} style={styles.fill} resizeMode="contain" />
      </View>
    );
  }

  const src = flagFor(asset.country);
  if (!src) return <Missing label={asset.describes} />;
  const h = Math.round(width * 0.62);

  // full_flag: show the complete flag at natural proportions, no zoom or grey.
  if (asset.kind === "full_flag") {
    return (
      <View style={[styles.flagBox, { width, height: h }]}>
        <Image source={src} resizeMode="contain" style={styles.fill} />
      </View>
    );
  }

  return (
    <View style={[styles.flagBox, { width, height: h }]}>
      <Image
        source={src}
        resizeMode="cover"
        style={[styles.fill, asset.kind === "greyed_flag" ? GREY : styles.zoom]}
      />
    </View>
  );
}

function Missing({ label }: { label: string }) {
  return (
    <View style={styles.missing}>
      <Text style={styles.missingText}>🏳️ {label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { width: "100%", height: "100%" },
  flagBox: {
    borderRadius: radii.md,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: palette.surface,
    backgroundColor: palette.surface,
    alignSelf: "center",
  },
  // Center-crop zoom (§8.4 "eyeball"); per-country focal tuning is a later polish pass.
  zoom: { transform: [{ scale: 2.4 }] },
  outlineBox: { alignSelf: "center", alignItems: "center", justifyContent: "center" },
  missing: { padding: spacing(3), backgroundColor: palette.surface, borderRadius: radii.md, alignSelf: "center" },
  missingText: { color: palette.inkSoft, fontSize: typography.size.sm, textAlign: "center" },
});
