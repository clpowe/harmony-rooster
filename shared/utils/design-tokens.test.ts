import { describe, expect, it } from "vitest";
import { readDesignTokens } from "./design-tokens";

describe("readDesignTokens", () => {
  it("resolves aliases and interpolates the explicit hue of a neutral color", () => {
    const { tokens, media } = readDesignTokens(`
      :root {
        --white: oklch(100% 0 0);
        --surface: var(--white);
        --red: oklch(58% 0.217 27.33);
        --full: color-mix(in oklch, var(--red) 16%, var(--surface));
        --duration: 160ms;
      }
      @media (prefers-reduced-motion: reduce) {
        :root { --duration: 0ms; }
      }
    `);

    expect(tokens["--surface"]).toEqual({ value: "var(--white)", resolved: "oklch(100% 0 0)" });
    expect(tokens["--full"]?.resolved).toBe("oklch(93.28% 0.03472 4.3728)");
    expect(media).toEqual({ "(prefers-reduced-motion: reduce)": { "--duration": "0ms" } });
  });

  it("rejects circular aliases", () => {
    expect(() => readDesignTokens(":root { --a: var(--b); --b: var(--a); }")).toThrow(
      "Unresolved design token",
    );
  });
});
