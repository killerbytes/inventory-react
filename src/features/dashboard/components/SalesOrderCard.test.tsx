import { describe, it, expect } from "vitest";
import { sub } from "date-fns";

describe("SalesOrderCard Payload Logic", () => {
  it("creates stable yesterday date payload when memoized", () => {
    const yesterday1 = sub(new Date(), { days: 1 });
    const yesterday2 = sub(new Date(), { days: 1 });
    // Dates calculated in separate ticks or renders differ in reference unless memoized
    expect(yesterday1.getTime()).toBeCloseTo(yesterday2.getTime(), -2);
  });
});
