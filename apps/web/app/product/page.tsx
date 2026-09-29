"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";

export default function ProductPage() {
  const [activeAstTab, setActiveAstTab] = useState<"intent" | "ast" | "risk">("ast");

  const sampleIntent = `Every weekday at 9:00 AM:
1. Fetch new RFQ proposals from Ministry Procurement API
2. Extract bill-of-materials and compliance milestones from PDF specs
3. Parallel check vendor availability via SAP and margin threshold in Postgres
4. If total value exceeds ₹2,00,000, request VP Operations Slack signoff
5. On approval, generate cryptographic audit seal and submit response`;

  const sampleAst = `{
  "version": "2.4.0",
  "workflowId": "wf_rfq_procurement_sovereign",
  "trigger": {
    "type": "CRON",
    "expression": "0 9 * * 1-5",
    "timezone": "Asia/Kolkata"
  },
  "concurrency": {
    "maxActive": 5,
    "strategy": "QUEUE_STRICT"
  },
  "pipeline": [
    {
      "stepId": "fetch_tender_specs",
      "type": "CONNECTOR_ACTION",
      "connector": "ministry_portal_v2",
      "action": "list_new_rfqs",
      "idempotencyKey": "hash(payload.tender_id)",
      "retryPolicy": { "maxAttempts": 4, "backoffMs": 1500 }
    },
    {
      "stepId": "parallel_synthesis",
      "type": "SWARM_FANOUT",
      "subTasks": ["sap_inventory_match", "postgres_margin_eval"]
    },
    {
      "stepId": "governance_gateway",
      "type": "HUMAN_APPROVAL",
      "condition": "payload.total_value > 200000",
      "approverRole": "VP_OPERATIONS",
      "timeout": "48h",
      "fallbackAction": "ESCALATE_TO_BOARD"
    }
  ]
}`;

  const sampleRisk = [
    { rule: "Database Mutation Scope", level: "SAFE", desc: "Read-only isolation on Postgres pricing schemas" },
    { rule: "Financial Threshold Barrier", level: "CONTROLLED", desc: "Irreversible transaction exceeds ₹2,00,000 trigger" },
    { rule: "External Webhook Ingress", level: "SAFE", desc: "HMAC-SHA256 signature verification enforced" },
    { rule: "PII & Secret Sanitization", level: "VERIFIED", desc: "Zero cleartext credentials stored in timeline execution logs" },
  ];

  return (
    <>
      <Navbar currentTab="Product" />

      <main className="w-full pt-20 bg-transparent relative min-h-screen">
        {/* HERO SECTION */}
        <section className="relative w-full overflow-hidden px-gutter-sm md:px-gutter lg:px-gutter-lg pt-space-xl pb-space-3xl">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary-container/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
          <div className="absolute top-[480px] right-10 w-[550px] h-[350px] bg-tertiary-container/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

          <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center">
            {/* Sovereign Badge */}
            <div className="inline-flex items-center gap-space-xs px-space-md py-space-2xs rounded-full bg-surface-container-low shadow-sm mb-space-lg">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                Nexora Core Engine Architecture
              </span>
            </div>

            <h1 className="font-headline-xl text-headline-xl md:text-display text-on-surface max-w-4xl tracking-tight leading-[1.1] mb-space-md">
              A deterministic engine for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                non-deterministic AI.
              </span>
            </h1>

            <p className="font-body-xl text-body-xl text-on-surface-variant max-w-3xl mb-space-xl">
              Traditional orchestrators break when tasks are ambiguous. Chatbots hallucinate when actions carry real consequences. Nexora unites both into a verifiable, stateful execution runtime.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-space-md w-full sm:w-auto mb-space-2xl">
              <Link
                className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs font-label-md text-label-md bg-on-surface text-surface px-space-lg py-space-sm rounded-lg shadow-md hover:bg-primary transition-all duration-300"
                href="/#build"
              >
                <span>Launch Interactive Sandbox</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link
                className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs font-label-md text-label-md bg-surface-container-lowest text-on-surface px-space-lg py-space-sm rounded-lg shadow-sm hover:bg-surface-container-low transition-all duration-200"
                href="/developers"
              >
                <span className="material-symbols-outlined text-primary text-[20px]">code</span>
                <span>Read Architecture Docs</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 5-STAGE COMPILATION PIPELINE */}
        <section className="w-full py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg bg-surface-container-low/50">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-space-2xl">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-2xs block">
                Compilation Lifecycle
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs font-semibold">
                From natural prompt to executable state machine.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Every prompt passes through a 5-layer mathematical compiler before a single byte touches production APIs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-space-md">
              {[
                {
                  step: "01",
                  title: "Semantic Parsing",
                  desc: "Deconstructs business goals into structured intents, entity boundaries, and measurable milestones.",
                  icon: "psychology",
                },
                {
                  step: "02",
                  title: "Tool Discovery",
                  desc: "Scans authenticated connector accounts, validates required scopes, and resolves OAuth tokens.",
                  icon: "hub",
                },
                {
                  step: "03",
                  title: "AST Graphing",
                  desc: "Constructs a directed acyclic graph (DAG) with concurrency branches, fallbacks, and retry budgets.",
                  icon: "account_tree",
                },
                {
                  step: "04",
                  title: "Risk Analyzer",
                  desc: "Quantifies blast radius, flags irreversible writes, and auto-injects human approval barriers.",
                  icon: "security",
                },
                {
                  step: "05",
                  title: "Durable Deploy",
                  desc: "Serializes the execution topology to immutable Postgres storage ready for millisecond dispatch.",
                  icon: "rocket_launch",
                },
              ].map((stage) => (
                <div
                  key={stage.step}
                  className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-space-md">
                      <span className="font-headline-md text-headline-md font-semibold text-primary-container">
                        {stage.step}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">{stage.icon}</span>
                      </div>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs font-semibold">
                      {stage.title}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {stage.desc}
                    </p>
                  </div>
                  <div className="mt-space-md pt-space-xs border-t border-outline-variant/15">
                    <span className="font-code-inline text-[11px] text-primary">Static Verification</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INTERACTIVE AST COMPILER PLAYGROUND */}
        <section className="w-full py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-space-2xl">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-2xs block">
                Interactive Inspector
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs font-semibold">
                Transparent inside and out.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                No black boxes. Inspect exactly how natural language instructions compile into concrete executable AST graphs with audit-ready guardrails.
              </p>
            </div>

            <div className="rounded-2xl bg-surface-container-lowest shadow-xl overflow-hidden border border-outline-variant/20">
              {/* Tab Bar */}
              <div className="flex items-center justify-between px-space-md py-space-sm bg-surface-container-low border-b border-outline-variant/20">
                <div className="flex items-center gap-space-xs">
                  <span className="w-3 h-3 rounded-full bg-red-400"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                  <span className="w-3 h-3 rounded-full bg-green-400"></span>
                  <span className="ml-2 font-code-inline text-code-inline text-on-surface-variant">
                    nexora-compiler --target ast_v2
                  </span>
                </div>
                <div className="flex items-center gap-space-xs">
                  {(["intent", "ast", "risk"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveAstTab(tab)}
                      className={`px-space-sm py-space-2xs rounded-lg font-label-sm text-label-sm uppercase tracking-wider transition-colors ${
                        activeAstTab === tab
                          ? "bg-surface-container-lowest text-primary font-semibold shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content Display */}
              <div className="p-space-xl">
                {activeAstTab === "intent" && (
                  <div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant block mb-space-xs">
                      Natural Language Prompt Input:
                    </span>
                    <div className="p-space-md rounded-xl bg-surface-container-low font-code-inline text-code-inline text-on-surface leading-relaxed whitespace-pre-wrap">
                      {sampleIntent}
                    </div>
                  </div>
                )}

                {activeAstTab === "ast" && (
                  <div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant block mb-space-xs">
                      Deterministic AST Execution Topology (JSON):
                    </span>
                    <div className="p-space-md rounded-xl bg-on-surface text-surface font-code-inline text-code-inline overflow-x-auto leading-relaxed">
                      <pre className="text-primary-fixed">{sampleAst}</pre>
                    </div>
                  </div>
                )}

                {activeAstTab === "risk" && (
                  <div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant block mb-space-xs">
                      Static Policy &amp; Blast Radius Verification Matrix:
                    </span>
                    <div className="space-y-space-sm">
                      {sampleRisk.map((item) => (
                        <div
                          key={item.rule}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-space-md rounded-xl bg-surface-container-low gap-space-xs"
                        >
                          <div>
                            <span className="font-body-md text-body-md font-semibold text-on-surface block">
                              {item.rule}
                            </span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">
                              {item.desc}
                            </span>
                          </div>
                          <span
                            className={`px-space-xs py-space-2xs rounded-full font-label-sm text-label-sm font-semibold shrink-0 ${
                              item.level === "CONTROLLED"
                                ? "bg-error-container text-on-error-container"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {item.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: SAGA COMPENSATION & CRASH RECOVERY */}
        <section className="w-full py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg bg-surface-container-low/40">
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
            <div className="lg:col-span-6">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-2xs block">
                Durable Persistence
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs font-semibold">
                Saga compensation with zero data corruption.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-space-lg">
                When external third-party APIs fail mid-operation, Nexora doesn’t leave your systems in a fractured state. It executes automatic reverse compensation actions in strict reverse order.
              </p>
              <div className="space-y-space-sm">
                <div className="flex items-start gap-space-sm">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-primary text-[16px]">replay</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface">
                    <span className="font-semibold">Automatic rollback hooks:</span> Revert CRM deal stages, cancel pre-authorized holds, and delete temporary cloud storage artifacts.
                  </p>
                </div>
                <div className="flex items-start gap-space-sm">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-primary text-[16px]">lock_clock</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface">
                    <span className="font-semibold">Idempotency guarantees:</span> Unique execution tokens ensure retried webhooks never double-bill or duplicate notifications.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 p-space-xl rounded-2xl bg-surface-container-lowest shadow-xl">
              <div className="flex items-center justify-between pb-space-md mb-space-md border-b border-outline-variant/15">
                <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  Live Saga Compensation Flow
                </span>
                <span className="font-code-inline text-[11px] text-tertiary">Distributed Coordinator</span>
              </div>
              <div className="space-y-space-sm font-code-inline text-code-inline">
                <div className="p-space-sm rounded-lg bg-surface flex items-center justify-between text-green-700">
                  <span>1. Stripe Hold Authorization</span>
                  <span>SUCCESS (+₹4,82,000)</span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface flex items-center justify-between text-green-700">
                  <span>2. Salesforce Opportunity Stage Up</span>
                  <span>SUCCESS (Stage: Contract Sent)</span>
                </div>
                <div className="p-space-sm rounded-lg bg-error-container/40 flex items-center justify-between text-error font-semibold">
                  <span>3. DocuSign Envelope Dispatch</span>
                  <span>NETWORK_TIMEOUT_504</span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-container-high text-primary flex items-center justify-between">
                  <span>↳ SAGA ROLLBACK: Revert Salesforce Stage</span>
                  <span>EXECUTED</span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-container-high text-primary flex items-center justify-between">
                  <span>↳ SAGA ROLLBACK: Void Stripe Authorization</span>
                  <span>EXECUTED</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="w-full py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg text-center bg-surface-container-lowest">
          <div className="max-w-2xl mx-auto">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-2xs block">
              Experience The Engine
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-sm font-semibold">
              Ready to see real autonomous execution?
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-space-xl">
              Describe what you need built and let the Nexora compiler generate the complete architecture in seconds.
            </p>
            <Link
              href="/#build"
              className="inline-flex items-center justify-center gap-space-xs font-label-md text-label-md bg-primary-container text-on-primary px-space-xl py-space-sm rounded-lg shadow-md hover:bg-primary hover:shadow-lg transition-all"
            >
              <span>Build Your First Pipeline</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
