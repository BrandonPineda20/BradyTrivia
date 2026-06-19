/**
 * Content build script (spec §8.2): xlsx -> typed JSON.
 *
 * Reads content/brady_trivia_question_bank.xlsx, maps each sheet to the §8.3
 * schema, validates every row, and writes content/generated/*.json. Exits
 * non-zero (with a list of problems) if anything fails to parse cleanly, so it
 * doubles as the "validate all 200 questions" gate for M1.
 *
 * Run: npm run build:content
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = resolve(ROOT, "content/brady_trivia_question_bank.xlsx");
const OUT_DIR = resolve(ROOT, "content/generated");

const SHEETS = {
  r1: "Round 1 - Trivia",
  r2: "Round 2 - Flags+Geo",
  r3: "Round 3 - Numeric",
  final: "Final Round - List",
};

const ASSET_KIND = {
  "Zoomed Flag": "zoomed_flag",
  "Greyed Flag": "greyed_flag",
  "Country Outline": "country_outline",
  "Geography Q": "none",
};

const errors = [];
const fail = (id, msg) => errors.push(`[${id}] ${msg}`);
const s = (v) => (v === null || v === undefined ? "" : String(v).trim());

function parseDifficulty(v) {
  const d = s(v);
  return d === "Easy" || d === "Medium" || d === "Hard" ? d : undefined;
}

function loadRows(wb, sheetName) {
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error(`Missing sheet: "${sheetName}"`);
  // First row is the header; defval keeps empty cells as "", raw:false formats numbers as text.
  return XLSX.utils.sheet_to_json(ws, { defval: "", raw: false });
}

const OPTION_KEYS = ["Option A", "Option B", "Option C", "Option D"];

function parseR1(rows) {
  return rows.map((r) => {
    const id = s(r.ID);
    const options = OPTION_KEYS.map((k) => s(r[k]));
    const answer = s(r["Correct Answer"]);
    if (!/^R1-\d+$/.test(id)) fail(id || "R1-?", "bad id format");
    if (options.filter(Boolean).length !== 4) fail(id, "expected 4 non-empty options");
    if (!options.includes(answer)) fail(id, `answer "${answer}" not among options`);
    return {
      id,
      round: 1,
      type: "multiple_choice",
      category: s(r.Category),
      question: s(r.Question),
      options,
      answer,
      ...(parseDifficulty(r.Difficulty) ? { difficulty: parseDifficulty(r.Difficulty) } : {}),
    };
  });
}

function parseR2(rows) {
  return rows.map((r) => {
    const id = s(r.ID);
    const type = s(r.Type);
    const options = OPTION_KEYS.map((k) => s(r[k]));
    const answer = s(r["Correct Answer"]);
    const kind = ASSET_KIND[type];
    if (!/^R2-\d+$/.test(id)) fail(id || "R2-?", "bad id format");
    if (!(type in ASSET_KIND)) fail(id, `unknown Type "${type}"`);
    if (options.filter(Boolean).length !== 4) fail(id, "expected 4 non-empty options");
    if (!options.includes(answer)) fail(id, `answer "${answer}" not among options`);
    const asset =
      kind && kind !== "none"
        ? { kind, describes: s(r["Asset Needed"]), country: answer || undefined }
        : { kind: "none", describes: s(r["Asset Needed"]) };
    return {
      id,
      round: 2,
      type: "multiple_choice",
      category: type, // preserve the sub-type (Zoomed Flag, etc.)
      question: s(r.Prompt),
      options,
      answer,
      asset,
      ...(parseDifficulty(r.Difficulty) ? { difficulty: parseDifficulty(r.Difficulty) } : {}),
    };
  });
}

function parseR3(rows) {
  return rows.map((r) => {
    const id = s(r.ID);
    const raw = s(r["Correct Answer"]).replace(/,/g, "");
    const answer = Number(raw);
    const unit = s(r.Unit);
    const notes = s(r.Notes);
    if (!/^R3-\d+$/.test(id)) fail(id || "R3-?", "bad id format");
    if (!Number.isFinite(answer)) fail(id, `non-numeric answer "${raw}"`);
    if (!unit) fail(id, "missing unit");
    return {
      id,
      round: 3,
      type: "numeric",
      category: s(r.Category),
      question: s(r.Question),
      answer,
      unit,
      ...(notes ? { notes } : {}),
      ...(parseDifficulty(r.Difficulty) ? { difficulty: parseDifficulty(r.Difficulty) } : {}),
    };
  });
}

function parseFinal(rows) {
  return rows.map((r) => {
    const id = s(r.ID);
    const prompt = s(r.Prompt);
    const timeSec = Number(s(r["Time (s)"])) || 20;
    const acceptable = s(r["Acceptable Answers"])
      .split(";")
      .map((x) => x.trim())
      .filter(Boolean);
    const tpRaw = s(r["Total Possible"]);
    let totalPossible;
    let openDictionaryKey;
    if (/^open$/i.test(tpRaw)) {
      totalPossible = "open";
      openDictionaryKey = id; // per-prompt bundled word list, keyed by id (§8.5)
    } else {
      const n = parseInt(tpRaw.replace(/[^\d]/g, ""), 10); // handles "~20", "~23"
      totalPossible = Number.isFinite(n) ? n : acceptable.length;
    }
    if (!/^F-\d+$/.test(id)) fail(id || "F-?", "bad id format");
    if (!prompt) fail(id, "missing prompt");
    if (acceptable.length === 0) fail(id, "no acceptable answers");
    return {
      id,
      round: "final",
      type: "list",
      prompt,
      timeSec,
      acceptable,
      totalPossible,
      ...(openDictionaryKey ? { openDictionaryKey } : {}),
    };
  });
}

function main() {
  const wb = XLSX.read(readFileSync(SRC), { type: "buffer" });
  const round1 = parseR1(loadRows(wb, SHEETS.r1));
  const round2 = parseR2(loadRows(wb, SHEETS.r2));
  const round3 = parseR3(loadRows(wb, SHEETS.r3));
  const final = parseFinal(loadRows(wb, SHEETS.final));

  const expect = (name, arr, n) => {
    if (arr.length !== n) fail(name, `expected ${n} rows, got ${arr.length}`);
  };
  expect("Round1", round1, 50);
  expect("Round2", round2, 50);
  expect("Round3", round3, 50);
  expect("Final", final, 50);

  const allIds = [...round1, ...round2, ...round3, ...final].map((q) => q.id);
  const dupes = [...new Set(allIds.filter((id, i) => allIds.indexOf(id) !== i))];
  if (dupes.length) fail("ALL", `duplicate ids: ${dupes.join(", ")}`);

  if (errors.length) {
    console.error(`\n❌ Content validation failed (${errors.length} issue(s)):`);
    for (const e of errors) console.error("  - " + e);
    process.exit(1);
  }

  const total = round1.length + round2.length + round3.length + final.length;
  const bank = {
    generatedAt: new Date().toISOString(),
    source: "content/brady_trivia_question_bank.xlsx",
    counts: {
      round1: round1.length,
      round2: round2.length,
      round3: round3.length,
      final: final.length,
      total,
    },
    round1,
    round2,
    round3,
    final,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  const write = (name, data) =>
    writeFileSync(resolve(OUT_DIR, name), JSON.stringify(data, null, 2) + "\n");
  write("bank.json", bank);
  write("round1.json", round1);
  write("round2.json", round2);
  write("round3.json", round3);
  write("final.json", final);

  console.log(`\n✅ Content build OK — ${total}/200 questions parsed cleanly`);
  console.table(bank.counts);
  console.log(`→ wrote ${"content/generated"}/{bank,round1,round2,round3,final}.json`);
}

main();
