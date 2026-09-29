import { describe, expect, it } from "vitest";
import { verifyAndPrintTarget } from "../scripts/safe-migrate.js";

describe("@agentic/db migration safety", () => {
  it("correctly accepts the dedicated project database agentic_dev on localhost", () => {
    const target = verifyAndPrintTarget(
      "postgresql://agentic:secret@localhost:5432/agentic_dev",
      "development",
    );
    expect(target.host).toBe("localhost");
    expect(target.database).toBe("agentic_dev");
  });
});
