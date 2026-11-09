import { describe, expect, it } from "vitest";
import { formatCents, formatRaised, parseMoneyToCents } from "./money";

describe("parseMoneyToCents", () => {
  it.each([
    ["7000", 700000],
    ["$7,000", 700000],
    ["1234.5", 123450],
    ["1234.56", 123456],
    ["0.01", 1],
  ])("parses %s", (input, cents) => {
    expect(parseMoneyToCents(input)).toBe(cents);
  });
  it.each(["", "-5", "1.234", "abc", "$", "1,2,3.4.5"])("rejects %s", (input) => {
    expect(parseMoneyToCents(input)).toBeNull();
  });
  it("avoids floating-point drift", () => {
    // 0.1 + 0.2 as floats is 0.30000000000000004; in cents it's exact.
    expect(parseMoneyToCents("0.1")! + parseMoneyToCents("0.2")!).toBe(30);
  });
});

describe("formatting", () => {
  it("drops .00 for whole dollars", () => {
    expect(formatCents(700000)).toBe("$7,000");
    expect(formatCents(123456)).toBe("$1,234.56");
  });
  it("marks lower bounds with +", () => {
    expect(formatRaised(700000, true)).toBe("$7,000+");
    expect(formatRaised(0, false)).toBe("$0");
  });
});
