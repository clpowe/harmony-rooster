import { describe, expect, it } from "vite-plus/test";
import catchError from "./catchError";

describe("catchError", () => {
  it("returns resolved data without an error", async () => {
    await expect(catchError(Promise.resolve({ id: "value_123" }))).resolves.toEqual([
      undefined,
      { id: "value_123" },
    ]);
  });

  it("returns the original rejection in the error tuple", async () => {
    const error = new Error("request failed");

    const result = await catchError(Promise.reject(error));

    expect(result).toEqual([error]);
  });
});
