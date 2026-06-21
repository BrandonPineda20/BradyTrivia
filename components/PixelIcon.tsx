import { SvgXml } from "react-native-svg";

/**
 * Tiny pixel-art icons rendered as SVG. Each icon is defined as a row-string
 * grid where "X" = filled pixel and "." = transparent. A second character
 * layer (e.g. "O") can carry an accent colour.
 */

const S = 3; // px per pixel

function grid(
  rows: string[],
  fill: string,
  accent?: { char: string; color: string },
): string {
  const w = rows[0].length * S;
  const h = rows.length * S;
  const rects = rows
    .flatMap((row, y) =>
      [...row].flatMap((ch, x) => {
        const rx = x * S, ry = y * S;
        if (ch === "X") return [`<rect x="${rx}" y="${ry}" width="${S}" height="${S}" fill="${fill}"/>`];
        if (accent && ch === accent.char) return [`<rect x="${rx}" y="${ry}" width="${S}" height="${S}" fill="${accent.color}"/>`];
        return [];
      }),
    )
    .join("");
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
}

// ── Icon definitions ────────────────────────────────────────────────────────

const ICONS = {
  trophy: grid([
    ".XXXXXX.",
    "XXXXXXXX",
    "XXXXXXXX",
    "XXXXXXXX",
    ".XXXXXX.",
    "..XXXX..",
    "...XX...",
    ".XXXXXX.",
  ], "#FFD23F"),

  crown: grid([
    "X..X..X.",
    "X.XXX.X.",
    "XXXXXXXX",
    "XXXXXXXX",
    ".XXXXXX.",
  ], "#FFD23F", { char: "O", color: "#FF488E" }),

  crown_gems: grid([
    "X.OXO.X.",
    "X.XXX.X.",
    "XXXXXXXX",
    "XXXXXXXX",
    ".XXXXXX.",
  ], "#FFD23F", { char: "O", color: "#FF488E" }),

  eyes: grid([
    ".XXX..XXX.",
    "XXXXXXXXXX",
    "XX.XXXX.XX",
    "XXXXXXXXXX",
    ".XXX..XXX.",
  ], "#1a1a2e", { char: "O", color: "#ffffff" }),

  star: grid([
    "...X...",
    ".XXXXX.",
    "XXXXXXX",
    ".XXXXX.",
    "..XXX..",
    ".X...X.",
    "X.....X",
  ], "#FFD23F"),

  confetti: grid([
    "X...O...",
    ".X..X..O",
    "..X..O..",
    "O..X..X.",
    "...O..X.",
    ".O...X..",
    "X....O..",
  ], "#5199e4", { char: "O", color: "#FF488E" }),

  controller: grid([
    ".XXXXXXXX.",
    "XXXXXXXXXX",
    "XX.X.OOXXX",
    "XXXXXXXXXX",
    ".XXXXXXXX.",
  ], "#3c4f5c", { char: "O", color: "#5199e4" }),

  person: grid([
    ".XXXX.",
    ".XXXX.",
    "XXXXXX",
    ".XXXX.",
    "XX..XX",
    "XX..XX",
    "XX..XX",
  ], "#3c4f5c"),

  speaker_on: grid([
    "..X.....",
    ".XX.X...",
    "XXX.XX..",
    "XXX.XX..",
    ".XX.X...",
    "..X.....",
  ], "#3c4f5c"),

  speaker_off: grid([
    "..X..X..",
    ".XX.X.X.",
    "XXX..X..",
    "XXX..X..",
    ".XX.X.X.",
    "..X..X..",
  ], "#3c4f5c"),

  x_mark: grid([
    "XX....XX",
    ".XX..XX.",
    "..XXXX..",
    "..XXXX..",
    ".XX..XX.",
    "XX....XX",
  ], "#c0392b"),

  check: grid([
    "......XX",
    ".....XX.",
    "....XX..",
    "XX.XX...",
    ".XXX....",
    "..X.....",
  ], "#2e7d4f"),

  // ── Badge icons ─────────────────────────────────────────────────────────────

  lock: grid([
    "..XXX..",
    ".X...X.",
    ".X...X.",
    "XXXXXXX",
    "X.....X",
    "XX.X.XX",
    "X.....X",
    "XXXXXXX",
  ], "#8a9bb0"),

  backpack: grid([
    "...XX...",
    "..XXXX..",
    ".XXXXXX.",
    "XXXXXXXX",
    "X.XXXX.X",
    "X.XXXX.X",
    "X.XXXX.X",
    "XXXXXXXX",
  ], "#5199e4"),

  globe: grid([
    "..XXXX..",
    ".X.XX.X.",
    "XXXXXXXX",
    "X......X",
    "XXXXXXXX",
    ".X.XX.X.",
    "..XXXX..",
  ], "#5199e4"),

  target: grid([
    "..XXXX..",
    ".X....X.",
    "X.XXXX.X",
    "X.XOOX.X",
    "X.XOOX.X",
    "X.XXXX.X",
    ".X....X.",
    "..XXXX..",
  ], "#3c4f5c", { char: "O", color: "#c0392b" }),

  notepad: grid([
    "XXXXXXX",
    "X.....X",
    "X.XXX.X",
    "X.....X",
    "X.XXX.X",
    "X.....X",
    "X.XXX.X",
    "XXXXXXX",
  ], "#5199e4"),

  diamond: grid([
    "...XX...",
    "..XXXX..",
    ".XXXXXX.",
    "XXXXXXXX",
    ".XXXXXX.",
    "..XXXX..",
    "...XX...",
  ], "#42e0d8"),
};

export type PixelIconName = keyof typeof ICONS;

export function PixelIcon({
  name,
  size = 24,
}: {
  name: PixelIconName;
  size?: number;
}) {
  return <SvgXml xml={ICONS[name]} width={size} height={size} />;
}
