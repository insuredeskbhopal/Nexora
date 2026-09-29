"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";

export default function DevelopersPage() {
  const [activeCodeTab, setActiveCodeTab] = useState<"sdk" | "curl" | "cli">("sdk");

  const sdkCode = `import { NexoraClient } from "@agentic/sdk";

// Initialize sovereign enterprise client
const client = new NexoraClient({
  apiKey: process.env.NEXORA_API_KEY!,
  workspaceId: "ws_enterprise_sovereign_01",
});

// 1. Compile natural language objective into a verified AST
const plan = await client.workflows.compile({
  prompt: "Parse Ministry RFQs, run tri-agent feasibility, and alert VP on Slack if > ₹2L",
  guardrails: { maxRiskLevel: "CONTROLLED" },
});

console.log("Compiled AST Graph ID:", plan.ast.workflowId);

// 2. Dispatch durable stateful execution run
const run = await client.runs.start({
  workflowId: plan.ast.workflowId,
  inputs: { tenderId: "TNDR-2026-99" },
  idempotencyKey: "idemp_rfq_99a",
});

// 3. Listen for Human Signoff Gateway
client.runs.onSignalRequired(run.id, async (signal) => {
  console.log("Action blocked for human verification:", signal.prompt);
  // Approve via SDK or Slack Bot
  await client.runs.sendSignal(run.id, "approve", {
    approvedBy: "marcus.vance@company.com",
    notes: "Verified against Q3 budget cap",
  });
});`;

  const curlCode = `# 1. Compile Natural Language to AST
curl -X POST https://api.nexora.dev/v1/workspaces/ws_01/workflows/compile \\
  -H "Authorization: Bearer nex_live_secret_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Sync closed won HubSpot deals into Postgres invoice ledger"
  }'

# 2. Trigger Durable Run
curl -X POST https://api.nexora.dev/v1/workspaces/ws_01/runs \\
  -H "Authorization: Bearer nex_live_secret_key" \\
  -H "Idempotency-Key: req_run_9921" \\
  -H "Content-Type: application/json" \\
  -d '{
    "workflowId": "wf_hubspot_postgres_sync",
    "inputs": { "since": "2026-09-28T00:00:00Z" }
  }'

# 3. Query Immutable Cryptographic Timeline
curl https://api.nexora.dev/v1/workspaces/ws_01/runs/run_8812/timeline \\
  -H "Authorization: Bearer nex_live_secret_key"`;

  const cliCode = `# Install Nexora Developer CLI globally
npm install -g @agentic/cli

# Authenticate local environment
nexora auth login

# Compile a natural language instruction into local schema AST
nexora compile "Ingest daily Stripe refunds and alert on Slack" --output ./pipeline.json

# Test connector credentials in isolated sandbox
nexora connectors test --account acc_salesforce_prod

# Execute workflow locally with mock state
nexora run ./pipeline.json --dry-run --verbose`;

  return (
    <>
      <Navbar currentTab="Developers" />

      <main className="w-full pt-20 bg-surface relative min-h-screen">
        {/* HERO */}
        <section className="relative w-full overflow-hidden px-gutter-sm md:px-gutter lg:px-gutter-lg pt-space-xl pb-space-3xl">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary-container/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
          <div className="absolute top-[480px] right-10 w-[550px] h-[350px] bg-tertiary-container/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

          <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-space-xs px-space-md py-space-2xs rounded-full bg-surface-container-low shadow-sm mb-space-lg">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                Nexora Developer Platform
              </span>
            </div>

            <h1 className="font-headline-xl text-headline-xl md:text-display text-on-surface max-w-4xl tracking-tight leading-[1.1] mb-space-md">
              Engineered for developers who{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                refuse black boxes.
              </span>
            </h1>

            <p className="font-body-xl text-body-xl text-on-surface-variant max-w-3xl mb-space-xl">
              Build with full programmatic control. Every automation is compiled to a transparent JSON AST graph, versioned in Git, and executed by a stateful distributed runtime.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-space-md w-full sm:w-auto mb-space-2xl">
              <Link
                className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs font-label-md text-label-md bg-on-surface text-surface px-space-lg py-space-sm rounded-lg shadow-md hover:bg-primary transition-all duration-300"
                href="#code-sample"
              >
                <span className="material-symbols-outlined text-[18px]">terminal</span>
                <span>Get Started with SDK</span>
              </Link>
              <Link
                className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs font-label-md text-label-md bg-surface-container-lowest text-on-surface px-space-lg py-space-sm rounded-lg shadow-sm hover:bg-surface-container-low transition-all duration-200"
                href="/pricing"
              >
                <span>View Free Developer Tier</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        {/* INTERACTIVE CODE SAMPLES */}
        <section id="code-sample" className="w-full py-space-2xl px-gutter-sm md:px-gutter lg:px-gutter-lg bg-surface-container-low/40">
          <div className="max-w-[1280px] mx-auto">
            <div className="rounded-2xl bg-surface-container-lowest shadow-xl overflow-hidden border border-outline-variant/15">
              {/* Tab Header */}
              <div className="flex items-center justify-between px-space-md py-space-sm bg-surface-container-low border-b border-outline-variant/15">
                <div className="flex items-center gap-space-xs">
                  <span className="w-3 h-3 rounded-full bg-red-400"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                  <span className="w-3 h-3 rounded-full bg-green-400"></span>
                  <span className="ml-2 font-code-inline text-code-inline text-on-surface-variant">
                    @agentic/sdk v0.1.0 • Node.js / TypeScript
                  </span>
                </div>
                <div className="flex items-center gap-space-xs">
                  {(["sdk", "curl", "cli"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveCodeTab(tab)}
                      className={`px-space-sm py-space-2xs rounded-lg font-label-sm text-label-sm uppercase tracking-wider transition-colors ${
                        activeCodeTab === tab
                          ? "bg-surface-container-lowest text-primary font-semibold shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Viewer */}
              <div className="p-space-xl bg-on-surface text-surface overflow-x-auto font-code-inline text-code-inline leading-relaxed">
                <pre className="text-primary-fixed">
                  {activeCodeTab === "sdk" && sdkCode}
                  {activeCodeTab === "curl" && curlCode}
                  {activeCodeTab === "cli" && cliCode}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* DEVELOPER CORE CAPABILITIES */}
        <section className="w-full py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-space-2xl">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-2xs block">
                Architecture Standard
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs font-semibold">
                Built to live inside modern engineering stacks.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Deploy pipelines as code. Manage configurations via YAML or JSON. Integrate with CI/CD and self-host on your own infrastructure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
              <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/15 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-space-md">
                    <span className="material-symbols-outlined text-[24px]">terminal</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-space-xs">
                    CLI &amp; Local Dev Loop
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Test workflows locally before promoting to production. Mock third-party responses, dry-run compensation sagas, and inspect graph execution step-by-step.
                  </p>
                </div>
                <div className="mt-space-md pt-space-xs border-t border-outline-variant/15">
                  <span className="font-code-inline text-[11px] text-primary">nexora test --local</span>
                </div>
              </div>

              <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/15 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-space-md">
                    <span className="material-symbols-outlined text-[24px]">verified</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-space-xs">
                    Cryptographic Audit Signatures
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Every step execution produces a SHA-256 hash linked to previous steps in an append-only timeline. Prove non-repudiation for financial and compliance auditors.
                  </p>
                </div>
                <div className="mt-space-md pt-space-xs border-t border-outline-variant/15">
                  <span className="font-code-inline text-[11px] text-primary">HMAC-SHA256 Chaining</span>
                </div>
              </div>

              <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/15 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-space-md">
                    <span className="material-symbols-outlined text-[24px]">cloud</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-space-xs">
                    Self-Hosting &amp; Air-Gapped VPC
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Deploy Nexora completely inside your AWS, GCP, or Azure VPC using our official Helm charts or Docker Compose bundle. Zero external data egress.
                  </p>
                </div>
                <div className="mt-space-md pt-space-xs border-t border-outline-variant/15">
                  <span className="font-code-inline text-[11px] text-primary">Kubernetes Helm / Docker</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="w-full py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg text-center bg-surface-container-lowest">
          <div className="max-w-2xl mx-auto">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-2xs block">
              Quickstart Ready
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-sm font-semibold">
              Start building in 5 minutes.
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-space-xl">
              Install the SDK, generate an API key from the sandbox, and start dispatching autonomous swarms.
            </p>
            <Link
              href="/#build"
              className="inline-flex items-center justify-center gap-space-xs font-label-md text-label-md bg-primary-container text-on-primary px-space-xl py-space-sm rounded-lg shadow-md hover:bg-primary hover:shadow-lg transition-all"
            >
              <span>Get Free API Key</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
