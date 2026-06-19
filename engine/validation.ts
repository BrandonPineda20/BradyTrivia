/**
 * Answer validation (spec §4.5, §4.6, §8.4–8.5). Pure helpers shared by humans
 * and bots so there is one authoritative notion of "correct".
 */
import type { ListQuestion, MCQuestion } from "./types";

/** Normalize a free-text entry for case-insensitive, accent-insensitive matching. */
export function normalizeEntry(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // strip diacritics (é → e)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " "); // collapse internal whitespace
}

/** R1/R2: a tapped option is correct iff it equals the answer. */
export function isMcCorrect(question: MCQuestion, value: string): boolean {
  return value === question.answer;
}

/**
 * R3 input rules (§4.5): digits only; strip commas/spaces; allow a leading sign
 * and a single decimal point. Empty / non-numeric → null (treated as timeout).
 */
export function parseNumericInput(raw: string): number | null {
  const cleaned = raw.replace(/[,\s]/g, "");
  if (cleaned === "") return null;
  if (!/^[+-]?\d+(\.\d+)?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** R3 closeness: pure absolute distance (§4.5, no tolerance band). */
export function numericDistance(answer: number, guess: number): number {
  return Math.abs(answer - guess);
}

export type ListValidation = {
  valid: string[]; // unique valid entries (original casing kept for reveal)
  invalid: string[]; // not in the acceptable set
  duplicates: string[]; // repeats of an already-valid entry
  validCount: number; // = valid.length
};

/**
 * Final round (§4.6): count unique, valid entries, case-insensitively.
 * Closed prompts match against `acceptable`. Open prompts (`totalPossible: "open"`)
 * also match a bundled supplement list keyed by `openDictionaryKey` (§8.5);
 * the sheet's `acceptable` already seeds a baseline. Duplicates and invalid
 * entries don't count and don't penalize.
 */
export function validateListEntries(
  question: ListQuestion,
  entries: string[],
  supplements?: Record<string, string[]>,
): ListValidation {
  const accepted = new Set(question.acceptable.map(normalizeEntry));
  if (question.totalPossible === "open" && question.openDictionaryKey) {
    for (const w of supplements?.[question.openDictionaryKey] ?? []) {
      accepted.add(normalizeEntry(w));
    }
  }

  const seenValid = new Set<string>();
  const valid: string[] = [];
  const invalid: string[] = [];
  const duplicates: string[] = [];

  for (const raw of entries) {
    const norm = normalizeEntry(raw);
    if (!norm) continue;
    if (accepted.has(norm)) {
      if (seenValid.has(norm)) duplicates.push(raw);
      else {
        seenValid.add(norm);
        valid.push(raw);
      }
    } else {
      invalid.push(raw);
    }
  }

  return { valid, invalid, duplicates, validCount: valid.length };
}
