import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readme = readFileSync(
  new URL("../README.md", import.meta.url),
  "utf8",
);

const adopting = readme
  .split(/^## /m)
  .find((section) => section.startsWith("Adopting this template"));

describe("adopter setup docs", () => {
  it("requires 'Allow GitHub Actions to create and approve pull requests'", () => {
    expect(adopting).toContain(
      "Allow GitHub Actions to create and approve pull requests",
    );
  });

  it("says why: the implement workflow opens its draft PR with GITHUB_TOKEN", () => {
    expect(adopting).toMatch(/agent-implement\.yml/);
    expect(adopting).toMatch(/GITHUB_TOKEN/);
    expect(adopting).toMatch(/draft PR/);
  });

  it("tells the adopter where the setting lives", () => {
    expect(adopting).toMatch(/Settings.*Actions.*General/s);
  });
});
