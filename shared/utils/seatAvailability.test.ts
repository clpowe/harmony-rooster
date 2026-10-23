import { describe, expect, it } from "vitest";
import { getSeatAvailability } from "./seatAvailability";

describe("getSeatAvailability", () => {
  it("measures occupied seats while labeling remaining seats", () => {
    const seats = getSeatAvailability(6, 18);
    expect(seats.percentOccupied).toBeCloseTo(66.6667, 3);
    expect(seats.description).toBe("6 of 18 seats available; 12 filled");
    expect(seats.state).toBe("open");
  });

  it("distinguishes limited availability, the final seat, and a full session", () => {
    expect(getSeatAvailability(3, 18).state).toBe("limited");
    expect(getSeatAvailability(1, 18).label).toBe("1 seat left");
    expect(getSeatAvailability(0, 18)).toMatchObject({
      state: "full",
      isFull: true,
      percentOccupied: 100,
      label: "No seats left",
    });
  });

  it("clamps negative and over-capacity values without creating misleading widths", () => {
    expect(getSeatAvailability(-4, 18)).toMatchObject({ available: 0, percentOccupied: 100 });
    expect(getSeatAvailability(24, 18)).toMatchObject({ available: 18, percentOccupied: 0 });
    expect(getSeatAvailability(4.8, 18.9)).toMatchObject({ available: 4, capacity: 18 });
  });

  it.each([
    [5, 0],
    [5, -2],
    [5, Number.NaN],
    [5, Number.POSITIVE_INFINITY],
    [Number.NaN, 18],
    [Number.POSITIVE_INFINITY, 18],
  ])("fails closed for unusable capacity data (%s, %s)", (available, capacity) => {
    const seats = getSeatAvailability(available, capacity);
    expect(seats.isFull).toBe(true);
    expect(Number.isFinite(seats.percentOccupied)).toBe(true);
    expect(seats.percentOccupied).toBeGreaterThanOrEqual(0);
    expect(seats.percentOccupied).toBeLessThanOrEqual(100);
  });
});
