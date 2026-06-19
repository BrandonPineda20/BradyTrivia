/**
 * Game engine (M2). Pure, deterministic given a seed, independent of UI (§11.3).
 *
 * Will hold the round/elimination state machine + unified elimination rules
 * (§4.2), bot AI (§5.2), scoring/validation, and a seedable RNG.
 */
export * from "./types";
export * from "./rng";
export * from "./config";
export * from "./validation";
export * from "./scoring";
export * from "./bots";
export * from "./elimination";
export * from "./episode";
export * from "./progression";
export { BOT_NAMES } from "./names";
