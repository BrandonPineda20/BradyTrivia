/**
 * Brand asset registry (spec §3.2 / §6.2).
 *
 * The Brady host art, logo lockups, and other brand imagery live behind this
 * registry so a commissioned/branded set (or art Brady's team provides) can drop
 * in 1:1 later. Components must read art from here, never via hardcoded require()
 * paths.
 *
 * M0 status: every slot points at a placeholder. The AI-generated 2D Brady
 * caricature expression set (§6.2) is produced in M3 and wired in here.
 */
import type { ImageSourcePropType } from "react-native";

// Placeholder until the real transparent-PNG expression set lands (§6.2).
const placeholder = require("../assets/icon.png") as ImageSourcePropType;

/** Real Brady host photo — rendered as his circular avatar (see components/BradyHost). */
export const bradyPhoto = require("../assets/brady-host.jpg") as ImageSourcePropType;

/** Required Brady expression states (one consistent character) — see §6.2. */
export type HostExpression =
  | "idle" // idle / intro
  | "asking" // asking a question
  | "tension" // building tension during countdown
  | "correct" // celebrating a correct answer
  | "wrong" // reacting to a wrong answer
  | "champion" // crowning the champion
  | "neutral"; // between questions

export const hostArt: Record<HostExpression, ImageSourcePropType> = {
  idle: placeholder,
  asking: placeholder,
  tension: placeholder,
  correct: placeholder,
  wrong: placeholder,
  champion: placeholder,
  neutral: placeholder,
};

export const brandAssets = {
  logo: placeholder, // BradyYourTutor lockup (placeholder)
  magnetGames: placeholder, // "A Magnet Games Production" lockup (placeholder)
  favicon: require("../assets/favicon.png") as ImageSourcePropType,
};

/**
 * Host rendering mode. "svg" uses the built-in stylized caricature (the M3
 * placeholder host). To swap in the real AI-generated 2D Brady caricature (§6.2):
 * point each `hostArt` slot above at its transparent PNG and flip this to "image".
 * No component changes required — `BradyHost` reads only from here.
 */
export const HOST_ART_MODE: "svg" | "image" = "svg";
