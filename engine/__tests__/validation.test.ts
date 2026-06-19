import { describe, expect, it } from "vitest";
import type { ListQuestion } from "../types";
import {
  normalizeEntry,
  numericDistance,
  parseNumericInput,
  validateListEntries,
} from "../validation";

describe("normalizeEntry", () => {
  it("is case/accent/whitespace insensitive", () => {
    expect(normalizeEntry("  Côte d'Ivoire ")).toBe("cote d'ivoire");
    expect(normalizeEntry("SOUTH   africa")).toBe("south africa");
  });
});

describe("parseNumericInput", () => {
  it("strips commas/spaces and parses", () => {
    expect(parseNumericInput("1,200,000")).toBe(1200000);
    expect(parseNumericInput(" 42 ")).toBe(42);
    expect(parseNumericInput("-5.5")).toBe(-5.5);
  });
  it("rejects empty / non-numeric as null (timeout)", () => {
    expect(parseNumericInput("")).toBeNull();
    expect(parseNumericInput("abc")).toBeNull();
    expect(parseNumericInput("12x")).toBeNull();
  });
});

describe("numericDistance", () => {
  it("is absolute difference", () => {
    expect(numericDistance(1000, 900)).toBe(100);
    expect(numericDistance(1000, 1200)).toBe(200);
  });
});

const closed: ListQuestion = {
  id: "F-01",
  round: "final",
  type: "list",
  prompt: "Name animals",
  timeSec: 20,
  acceptable: ["Dog", "Cat", "Bird"],
  totalPossible: 3,
};

const open: ListQuestion = {
  id: "F-03",
  round: "final",
  type: "list",
  prompt: "Animals starting with B",
  timeSec: 20,
  acceptable: ["Bear", "Bat"],
  totalPossible: "open",
  openDictionaryKey: "F-03",
};

describe("validateListEntries", () => {
  it("counts unique valid, flags duplicates + invalid, no penalty", () => {
    const r = validateListEntries(closed, ["dog", "DOG", "cat", "fish"]);
    expect(r.validCount).toBe(2);
    expect(r.valid).toEqual(["dog", "cat"]);
    expect(r.duplicates).toEqual(["DOG"]);
    expect(r.invalid).toEqual(["fish"]);
  });

  it("open prompts also match a bundled supplement", () => {
    const base = validateListEntries(open, ["Bear", "Bobcat"]);
    expect(base.validCount).toBe(1); // Bobcat not in baseline

    const withDict = validateListEntries(open, ["Bear", "Bobcat"], {
      "F-03": ["Bobcat", "Beaver"],
    });
    expect(withDict.validCount).toBe(2);
  });
});
