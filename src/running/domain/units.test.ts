import { describe, expect, it } from "vitest";
import { formatDuration, formatMiles, formatPace, MARATHON_M, metersToMiles, pacePerMile, parseDuration } from "./units";

describe("distance", () => {
  it("converts a marathon to 26.2 miles", () => {
    expect(metersToMiles(MARATHON_M)).toBeCloseTo(26.219, 3);
    expect(formatMiles(MARATHON_M)).toBe("26.2");
  });
  it("formats with thousands separators", () => {
    expect(formatMiles(1609.344 * 1234.56)).toBe("1,234.6");
  });
});

describe("pace", () => {
  it("is moving seconds per mile", () => {
    // 5 miles in 45:00 → 9:00 /mi
    expect(pacePerMile(1609.344 * 5, 45 * 60)).toBeCloseTo(540, 6);
    expect(formatPace(540)).toBe("9:00");
  });
  it("rounds to the nearest second without producing :60", () => {
    expect(formatPace(539.6)).toBe("9:00");
    expect(formatPace(522.4)).toBe("8:42");
  });
  it("returns null / dash for zero distance", () => {
    expect(pacePerMile(0, 100)).toBeNull();
    expect(formatPace(null)).toBe("–");
  });
});

describe("formatDuration", () => {
  it("formats hours, minutes, seconds", () => {
    expect(formatDuration(14280)).toBe("3:58:00");
    expect(formatDuration(2712)).toBe("45:12");
    expect(formatDuration(59.6)).toBe("1:00");
  });
});

describe("parseDuration", () => {
  it.each([
    ["3:58:12", 14292],
    ["45:30", 2730],
    ["75:00", 4500],
    ["45", 2700],
    ["45.5", 2730],
    [" 1:02:03 ", 3723],
  ])("parses %s", (input, seconds) => {
    expect(parseDuration(input)).toBe(seconds);
  });
  it.each(["", "abc", "1:75", "1:60:00", "0", "0:00", "1:2:3:4", "-5", "1::2"])("rejects %s", (input) => {
    expect(parseDuration(input)).toBeNull();
  });
});
