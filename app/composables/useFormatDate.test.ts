import { describe, expect, it } from "vite-plus/test";
import { formatDate, useFormatDate } from "./useFormatDate";

describe("formatDate", () => {
  it.each([
    ["2026-05-01", "Friday May 1st"],
    ["2026-05-02", "Saturday May 2nd"],
    ["2026-05-03", "Sunday May 3rd"],
    ["2026-05-04", "Monday May 4th"],
    ["2026-05-11", "Monday May 11th"],
    ["2026-05-21", "Thursday May 21st"],
    ["2026-05-22", "Friday May 22nd"],
    ["2026-05-23", "Saturday May 23rd"],
  ])("formats %s with the correct ordinal suffix", (input, expected) => {
    expect(formatDate(input)).toBe(expected);
  });

  it("uses the calendar portion of an ISO timestamp without a timezone date shift", () => {
    expect(formatDate("2026-05-01T00:30:00.000Z")).toBe("Friday May 1st");
  });

  it.each(["", "May 1, 2026", "0000-00-00"])(
    "returns an empty string for unsupported input %j",
    (input) => {
      expect(formatDate(input)).toBe("");
    },
  );

  it("exposes the same formatter from the composable", () => {
    expect(useFormatDate().formatDate).toBe(formatDate);
  });
});
