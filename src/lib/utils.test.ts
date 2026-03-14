import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("text-sm", "font-bold")).toBe("text-sm font-bold");
  });

  it("resolves Tailwind conflicts (last wins)", () => {
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("handles undefined and null inputs", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });

  it("handles empty string input", () => {
    expect(cn("", "text-sm")).toBe("text-sm");
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });

  it("merges padding conflicts", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("keeps non-conflicting classes", () => {
    expect(cn("text-sm", "bg-red-500", "p-4")).toBe(
      "text-sm bg-red-500 p-4"
    );
  });
});
