import { describe, expect, it } from "vitest";
import { cn } from "./index.js";

describe("@agentic/ui cn utility", () => {
  it("correctly merges conditional classes and resolves tailwind collisions", () => {
    const result = cn(
      "px-2 py-1",
      true && "bg-blue-500",
      false && "text-red-500",
      "px-4",
    );
    expect(result).toBe("py-1 bg-blue-500 px-4");
  });
});
