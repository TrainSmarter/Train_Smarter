import { describe, it, expect } from "vitest";
import manifest from "./manifest";

describe("manifest", () => {
  const result = manifest();

  it("returns correct app name", () => {
    expect(result.name).toBe("Train Smarter");
    expect(result.short_name).toBe("Train Smarter");
  });

  it("uses teal brand color as theme_color", () => {
    expect(result.theme_color).toBe("#0D9488");
  });

  it("uses standalone display mode", () => {
    expect(result.display).toBe("standalone");
  });

  it("starts from root URL", () => {
    expect(result.start_url).toBe("/");
  });

  it("includes 192x192 and 512x512 PNG icons", () => {
    const icons = result.icons as Array<{
      src: string;
      sizes: string;
      type: string;
    }>;
    expect(icons).toHaveLength(2);

    expect(icons[0]).toEqual({
      src: "/icon-192.png",
      sizes: "192x192",
      type: "image/png",
    });

    expect(icons[1]).toEqual({
      src: "/icon-512.png",
      sizes: "512x512",
      type: "image/png",
    });
  });

  it("has white background color", () => {
    expect(result.background_color).toBe("#ffffff");
  });

  it("includes a German description", () => {
    expect(result.description).toContain("Trainingsmanagement");
  });
});
