import { describe, expect, it } from "vitest";
import { initObservability } from "./index.js";

describe("@agentic/observability", () => {
  it("initializes observability provider and executes span trace boundary", async () => {
    const obs = initObservability({ serviceName: "test-service" });
    let executed = false;

    const result = await obs.tracer.startSpan("test.span", (span) => {
      span.setAttribute("test.key", "value");
      executed = true;
      return 42;
    });

    expect(executed).toBe(true);
    expect(result).toBe(42);
  });

  it("provides counter and histogram metric collectors", () => {
    const obs = initObservability({ serviceName: "test-service" });
    const counter = obs.metrics.createCounter("http_requests_total");
    const histogram = obs.metrics.createHistogram(
      "http_request_duration_seconds",
    );

    expect(() => counter.add(1)).not.toThrow();
    expect(() => histogram.record(0.12)).not.toThrow();
  });
});
