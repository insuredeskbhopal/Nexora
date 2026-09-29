export interface Span {
  setAttribute(key: string, value: string | number | boolean): this;
  recordException(exception: Error): void;
  end(): void;
}

export interface Tracer {
  startSpan<T>(name: string, fn: (span: Span) => Promise<T> | T): Promise<T>;
}

export interface MetricCounter {
  add(value: number, attributes?: Record<string, string | number>): void;
}

export interface MetricHistogram {
  record(value: number, attributes?: Record<string, string | number>): void;
}

export interface MetricsProvider {
  createCounter(name: string, description?: string): MetricCounter;
  createHistogram(
    name: string,
    unit?: string,
    description?: string,
  ): MetricHistogram;
}

export interface ObservabilityProvider {
  tracer: Tracer;
  metrics: MetricsProvider;
  shutdown(): Promise<void>;
}

class NoopSpan implements Span {
  setAttribute(): this {
    return this;
  }
  recordException(): void {}
  end(): void {}
}

class NoopCounter implements MetricCounter {
  add(): void {}
}

class NoopHistogram implements MetricHistogram {
  record(): void {}
}

class NoopObservabilityProvider implements ObservabilityProvider {
  public tracer: Tracer = {
    async startSpan<T>(
      _name: string,
      fn: (span: Span) => Promise<T> | T,
    ): Promise<T> {
      const span = new NoopSpan();
      try {
        return await fn(span);
      } finally {
        span.end();
      }
    },
  };

  public metrics: MetricsProvider = {
    createCounter(): MetricCounter {
      return new NoopCounter();
    },
    createHistogram(): MetricHistogram {
      return new NoopHistogram();
    },
  };

  async shutdown(): Promise<void> {
    // No-op shutdown
  }
}

/**
 * Initializes the observability boundary for a service.
 */
export function initObservability(options: {
  serviceName: string;
  enabled?: boolean;
}): ObservabilityProvider {
  // Phase 0: Returns clean typed boundary ready for full OpenTelemetry collector integration
  return new NoopObservabilityProvider();
}
