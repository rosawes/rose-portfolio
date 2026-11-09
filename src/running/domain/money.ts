/**
 * Money helpers. All amounts are integer CENTS.
 *
 * Why cents? Floating-point numbers can't represent most decimals exactly
 * (0.1 + 0.2 !== 0.3), so adding up dollars as floats slowly drifts. Integers don't.
 */

/** "$1,234.56" / "1234.5" / "7000" → cents. Null for invalid, negative, or >2 decimals. */
export function parseMoneyToCents(input: string): number | null {
  const cleaned = input.trim().replace(/^\$/, "").replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const [dollars, fraction = ""] = cleaned.split(".");
  const cents = Number(dollars) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}

/** 700000 → "$7,000"; 123456 → "$1,234.56". */
export function formatCents(cents: number): string {
  const whole = cents % 100 === 0;
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  });
}

/** Adds "+" when the amount is a lower bound: "$7,000+". */
export function formatRaised(cents: number, isMinimum: boolean): string {
  return `${formatCents(cents)}${isMinimum ? "+" : ""}`;
}
