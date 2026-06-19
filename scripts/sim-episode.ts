/**
 * Headless episode simulator (M2 "playable in a bare UI").
 *
 * Loads the real baked question bank and plays a full *Last One Standing*
 * episode end-to-end, printing the round-by-round flow, eliminations, the final
 * list battle, the champion, and placements. Proves the engine works against
 * real content before any UI exists.
 *
 * Run: npm run sim            (default seed)
 *      npm run sim -- 42      (specific seed)
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runEpisode, type EpisodeContent } from "../engine/episode";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, "..");
const bank = JSON.parse(
  readFileSync(resolve(ROOT, "content/generated/bank.json"), "utf8"),
);

const content: EpisodeContent = {
  round1: bank.round1,
  round2: bank.round2,
  round3: bank.round3,
  final: bank.final,
};

const seed = Number(process.argv[2] ?? 7);
const result = runEpisode({ seed, content, humanName: "You" });

const byId = new Map(result.players.map((p) => [p.id, p]));
const name = (id: string) => byId.get(id)?.name ?? id;
const tag = (id: string) => (byId.get(id)?.kind === "human" ? " (you)" : "");

console.log(`\n🎬  BradyYourTutor — Last One Standing   [seed ${seed}]\n`);
console.log("Lobby (1 human + 4 bots):");
for (const p of result.players) {
  console.log(
    `  • ${p.name}${p.kind === "human" ? " (you)" : ""}  ·  skill ${(p.skill ?? 0).toFixed(2)}`,
  );
}

const roundTitles: Record<number, string> = {
  1: "Round 1 · General Trivia",
  2: "Round 2 · Flags & Geography",
  3: "Round 3 · Numeric Estimate",
};
for (const r of result.rounds) {
  console.log(`\n${roundTitles[r.round as number]}  (${r.startingPool.length} in)`);
  console.log(`  questions played : ${r.questions.length}`);
  console.log(`  advanced         : ${r.advanced.map((id) => name(id) + tag(id)).join(", ")}`);
  console.log(`  ❌ eliminated     : ${name(r.eliminatedId)}${tag(r.eliminatedId)}`);
}

console.log(
  `\nFinal · Name As Many  (${result.final.finalists.map((id) => name(id) + tag(id)).join("  vs  ")})`,
);
for (const pr of result.final.prompts) {
  const counts = pr.submissions
    .map((s) => `${name(s.playerId)}=${s.validCount}`)
    .join(", ");
  const outcome = pr.winnerId ? `→ ${name(pr.winnerId)}` : "→ tie (sudden death)";
  console.log(`  ${pr.suddenDeath ? "⚡ " : ""}${pr.questionId}: ${counts}  ${outcome}`);
}

console.log(`\n🏆 Champion: ${name(result.championId)}${tag(result.championId)}\n`);
console.log("Final placements:");
for (const p of [...result.players].sort((a, b) => (a.placement ?? 9) - (b.placement ?? 9))) {
  console.log(`  ${p.placement}. ${p.name}${p.kind === "human" ? " (you)" : ""}`);
}
console.log("");
