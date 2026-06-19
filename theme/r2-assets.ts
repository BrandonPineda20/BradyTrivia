/**
 * Round 2 visual asset registry (spec §8.4) — "derive, don't hand-draw".
 *
 * A reusable set of clean flag PNGs (flagcdn, public domain) + country silhouette
 * PNGs (mapsicon, MIT) keyed by ISO 3166-1 alpha-2 code. The R2 questions name a
 * country (the correct answer); we map it to a code and render greyed / zoomed /
 * outline from these. Swap the source set here without touching components.
 */
import type { ImageSourcePropType } from "react-native";

/** R2 answer country name → ISO2 code (matches bundled filenames). */
export const COUNTRY_CODE: Record<string, string> = {
  Canada: "ca",
  Japan: "jp",
  Brazil: "br",
  "United Kingdom": "gb",
  "United States": "us",
  Germany: "de",
  India: "in",
  "South Africa": "za",
  Turkey: "tr",
  Mexico: "mx",
  Indonesia: "id",
  Greece: "gr",
  China: "cn",
  France: "fr",
  Australia: "au",
  Switzerland: "ch",
  "South Korea": "kr",
  Italy: "it",
  Chile: "cl",
  Egypt: "eg",
  Russia: "ru",
  Spain: "es",
};

export const FLAGS: Record<string, ImageSourcePropType> = {
  ca: require("../assets/flags/ca.png"),
  jp: require("../assets/flags/jp.png"),
  br: require("../assets/flags/br.png"),
  gb: require("../assets/flags/gb.png"),
  us: require("../assets/flags/us.png"),
  de: require("../assets/flags/de.png"),
  in: require("../assets/flags/in.png"),
  za: require("../assets/flags/za.png"),
  tr: require("../assets/flags/tr.png"),
  mx: require("../assets/flags/mx.png"),
  id: require("../assets/flags/id.png"),
  gr: require("../assets/flags/gr.png"),
  cn: require("../assets/flags/cn.png"),
  fr: require("../assets/flags/fr.png"),
  au: require("../assets/flags/au.png"),
  ch: require("../assets/flags/ch.png"),
  kr: require("../assets/flags/kr.png"),
};

export const OUTLINES: Record<string, ImageSourcePropType> = {
  it: require("../assets/outlines/it.png"),
  us: require("../assets/outlines/us.png"),
  fr: require("../assets/outlines/fr.png"),
  in: require("../assets/outlines/in.png"),
  jp: require("../assets/outlines/jp.png"),
  br: require("../assets/outlines/br.png"),
  gb: require("../assets/outlines/gb.png"),
  au: require("../assets/outlines/au.png"),
  cl: require("../assets/outlines/cl.png"),
  eg: require("../assets/outlines/eg.png"),
  mx: require("../assets/outlines/mx.png"),
  ru: require("../assets/outlines/ru.png"),
  es: require("../assets/outlines/es.png"),
};

export function flagFor(country?: string): ImageSourcePropType | undefined {
  const code = country ? COUNTRY_CODE[country] : undefined;
  return code ? FLAGS[code] : undefined;
}

export function outlineFor(country?: string): ImageSourcePropType | undefined {
  const code = country ? COUNTRY_CODE[country] : undefined;
  return code ? OUTLINES[code] : undefined;
}
