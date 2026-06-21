/**
 * Typed content schema (spec §8.3) — maps 1:1 from the xlsx sheets.
 * Generated JSON in content/generated/ conforms to these types.
 */

export type Difficulty = "Easy" | "Medium" | "Hard";

/** Round 2 visual-asset descriptor — drives the §8.4 derive-don't-hand-draw pipeline. */
export type FlagOrOutlineAsset = {
  /** "none" for plain Geography Q rows (no image). */
  kind: "zoomed_flag" | "greyed_flag" | "country_outline" | "full_flag" | "none";
  /** The "Asset Needed" text from the sheet (what the image should show). */
  describes: string;
  /** Best-effort subject country (usually the correct answer); picks the source flag/outline. */
  country?: string;
};

/** Round 1 (`Round 1 - Trivia`) and Round 2 (`Round 2 - Flags+Geo`). */
export type MCQuestion = {
  id: string;
  round: 1 | 2;
  type: "multiple_choice";
  /** R1: subject category. R2: the sheet `Type` (Zoomed Flag, Greyed Flag, …). */
  category: string;
  question: string;
  options: string[]; // 4 options, in A–D order
  answer: string; // equals exactly one option
  difficulty?: Difficulty;
  asset?: FlagOrOutlineAsset; // R2 only
};

/** Round 3 (`Round 3 - Numeric`). */
export type NumericQuestion = {
  id: string;
  round: 3;
  type: "numeric";
  category: string;
  question: string;
  answer: number;
  unit: string;
  notes?: string;
  difficulty?: Difficulty;
};

/** Final round (`Final Round - List`). */
export type ListQuestion = {
  id: string;
  round: "final";
  type: "list";
  prompt: string;
  timeSec: number;
  /** Split on ";", trimmed. Match case-insensitively at runtime. */
  acceptable: string[];
  totalPossible: number | "open";
  /** Set when totalPossible === "open"; engine maps it to a bundled word list (§8.5). */
  openDictionaryKey?: string;
};

export type AnyQuestion = MCQuestion | NumericQuestion | ListQuestion;

export type QuestionBank = {
  generatedAt: string;
  source: string;
  counts: {
    round1: number;
    round2: number;
    round3: number;
    final: number;
    total: number;
  };
  round1: MCQuestion[];
  round2: MCQuestion[];
  round3: NumericQuestion[];
  final: ListQuestion[];
};
