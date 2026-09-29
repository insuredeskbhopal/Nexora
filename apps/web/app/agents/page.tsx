"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";

interface AgentItem {
  id: string;
  name: string;
  icon: string;
  badge: string;
  description: string;
  capabilities: string[];
  payloadExample: string;
}

const AGENT_ROSTER: AgentItem[] = [
  {
    id: "research",
    name: "Research Agent",
    icon: "travel_explore",
    badge: "Information Retrieval",
    description: "Autonomously scours public regulatory filings, SEC databases, supplier registries, and web sources.",
    capabilities: [
      "Vector search across enterprise knowledge bases",
      "Dynamic entity disambiguation",
      "Deep web synthesis with citation preservation",
    ],
    payloadExample: '{ "vendor": "Apex Technologies", "sanctionsClear": true, "secFilingsFound": 14 }',
  },
  {
    id: "finance",
    name: "Finance & Ledger Agent",
    icon: "account_balance",
    badge: "Ledger Reconciliation",
    description: "Performs mathematical validation, 3-way matching between purchase orders, invoices, and bank statements.",
    capabilities: [
      "Precision decimal balance verification",
      "Threshold escalation triggers (> ₹1,00,000)",
      "Multi-currency exchange normalization",
    ],
    payloadExample: '{ "invoiceTotal": 482000, "poMatch": "PO-99120", "variancePercent": 0.00 }',
  },
  {
    id: "document",
    name: "Document & Contract Agent",
    icon: "description",
    badge: "Clause Analysis",
    description: "Extracts structured JSON data from 200+ page contracts, messy PDFs, scanned receipts, and invoices.",
    capabilities: [
      "Vision OCR with layout coordinate preservation",
      "Arbitration & indemnification clause extraction",
      "Signature field validity checking",
    ],
    payloadExample: '{ "clausesExtracted": 42, "indemnityCap": "1x Annual Fees", "signer": "Marcus Vance" }',
  },
  {
    id: "data",
    name: "Data Reconciliation Agent",
    icon: "database",
    badge: "State Synchronization",
    description: "Maintains bidirectional synchronization across PostgreSQL, MongoDB, Snowflake, and Salesforce.",
    capabilities: [
      "Zero data mutation collisions",
      "Distributed lock acquisition",
      "Optimistic concurrency verification",
    ],
    payloadExample: '{ "recordsSynced": 1284, "source": "Postgres", "target": "Salesforce", "conflicts": 0 }',
  },
  {
    id: "security",
    name: "Verification & Safety Agent",
    icon: "shield",
    badge: "Sovereign Guardrails",
    description: "Scans all outbound actions for prompt injection, sensitive PII leaks, and unauthorized API mutations.",
    capabilities: [
      "Deterministic policy enforcement",
      "Automatic token masking in log streams",
      "Human-in-the-loop escalation routing",
    ],
    payloadExample: '{ "policyViolation": false, "piiMaskedCount": 3, "humanSignoffTriggered": true }',
  },
  {
    id: "devops",
    name: "DevOps & Infrastructure Agent",
    icon: "terminal",
    badge: "Cluster Operations",
    description: "Monitors health checks, network latencies, container failovers, and self-heals broken webhooks.",
    capabilities: [
      "Automated exponential backoff retries",
      "Token refresh and OAuth re-auth triggers",
      "Zero-downtime execution resumption",
    ],
    payloadExample: '{ "clusterHealth": "100%", "failoverHandled": "OAuthTokenRefresh", "recoveryMs": 320 }',
  },
];

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<AgentItem>(AGENT_ROSTER[0] as AgentItem);
  const [simStep, setSimStep] = useState(1);

  return (
    <>
      <Navbar currentTab="Agents" />

      <main className="w-full pt-20 bg-transparent relative min-h-screen">
        {/* HERO */}
        <section className="relative w-full overflow-hidden px-gutter-sm md:px-gutter lg:px-gutter-lg pt-space-xl pb-space-3xl">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary-container/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
          <div className="absolute top-[480px] right-10 w-[550px] h-[350px] bg-tertiary-container/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

          <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-space-xs px-space-md py-space-2xs rounded-full bg-surface-container-low shadow-sm mb-space-lg">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                Autonomous Multi-Agent Architecture
              </span>
            </div>

            <h1 className="font-headline-xl text-headline-xl md:text-display text-on-surface max-w-4xl tracking-tight leading-[1.1] mb-space-md">
              Specialized swarms with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                sovereign guardrails.
              </span>
            </h1>

            <p className="font-body-xl text-body-xl text-on-surface-variant max-w-3xl mb-space-xl">
              One giant LLM cannot safely run an entire company. Nexora coordinates domain-specialized agents that operate under structured protocols with strict separation of powers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-space-md w-full sm:w-auto mb-space-2xl">
              <Link
                className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs font-label-md text-label-md bg-on-surface text-surface px-space-lg py-space-sm rounded-lg shadow-md hover:bg-primary transition-all duration-300"
                href="/#build"
              >
                <span>Deploy Agent Swarm</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link
                className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs font-label-md text-label-md bg-surface-container-lowest text-on-surface px-space-lg py-space-sm rounded-lg shadow-sm hover:bg-surface-container-low transition-all duration-200"
                href="/integrations"
              >
                <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
                <span>View Agent Tools</span>
              </Link>
            </div>
          </div>
        </section>

        {/* AGENT ROSTER SHOWCASE */}
        <section className="w-full py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg bg-surface-container-low/40">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-space-2xl">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-2xs block">
                The Roster
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs font-semibold">
                Domain-specialized for enterprise execution.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Each agent has its own scoped sandbox, tool allowances, and verification requirements. Click any agent below to inspect its operational model.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
              {/* Left: Agent Selection List */}
              <div className="lg:col-span-5 space-y-space-xs">
                {AGENT_ROSTER.map((agent) => {
                  const isSelected = selectedAgent.id === agent.id;
                  return (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => setSelectedAgent(agent)}
                      className={`w-full text-left p-space-md rounded-xl transition-all flex items-center justify-between border ${
                        isSelected
                          ? "bg-surface-container-lowest border-primary/40 shadow-md ring-1 ring-primary/20"
                          : "bg-surface-container-low/60 border-transparent hover:bg-surface-container-lowest hover:border-outline-variant/30"
                      }`}
                    >
                      <div className="flex items-center gap-space-sm">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-primary-container text-on-primary"
                              : "bg-surface-container-high text-primary"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[22px]">{agent.icon}</span>
                        </div>
                        <div>
                          <span className="font-headline-sm text-headline-sm text-[16px] text-on-surface font-semibold block">
                            {agent.name}
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            {agent.badge}
                          </span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                        chevron_right
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right: Selected Agent Deep Dive */}
              <div className="lg:col-span-7 p-space-xl rounded-2xl bg-surface-container-lowest shadow-xl border border-outline-variant/15">
                <div className="flex items-center justify-between pb-space-md mb-space-md border-b border-outline-variant/15">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px]">{selectedAgent.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        {selectedAgent.name}
                      </h3>
                      <span className="font-code-inline text-[11px] text-primary">
                        Sandbox Isolation: ACTIVE
                      </span>
                    </div>
                  </div>
                  <span className="px-space-xs py-space-2xs rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">
                    {selectedAgent.badge}
                  </span>
                </div>

                <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">
                  {selectedAgent.description}
                </p>

                <div className="mb-space-lg">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold block mb-space-xs">
                    Verified Capabilities:
                  </span>
                  <div className="space-y-space-xs">
                    {selectedAgent.capabilities.map((cap) => (
                      <div key={cap} className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                        <span className="font-body-sm text-body-sm text-on-surface">{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold block mb-space-xs">
                    Structured ACP Output Payload:
                  </span>
                  <div className="p-space-md rounded-xl bg-on-surface text-surface font-code-inline text-code-inline overflow-x-auto">
                    <pre className="text-primary-fixed">{selectedAgent.payloadExample}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE SWARM SIMULATOR */}
        <section className="w-full py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-space-2xl">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-2xs block">
                Live Swarm Coordination
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs font-semibold">
                Watch agents hand off tasks deterministically.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Step through a 4-phase enterprise procurement operation to observe inter-agent context sharing without prompt drift.
              </p>
            </div>

            <div className="max-w-4xl mx-auto rounded-2xl bg-surface-container-lowest shadow-xl p-space-xl border border-outline-variant/15">
              {/* Stepper Controls */}
              <div className="grid grid-cols-4 gap-space-xs mb-space-xl">
                {[
                  { num: 1, title: "1. Ingest & OCR" },
                  { num: 2, title: "2. Tri-Agent Analysis" },
                  { num: 3, title: "3. Director Signoff" },
                  { num: 4, title: "4. Database Commit" },
                ].map((s) => (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => setSimStep(s.num)}
                    className={`py-space-xs px-space-sm rounded-lg text-center font-label-sm text-label-sm transition-all ${
                      simStep === s.num
                        ? "bg-primary-container text-on-primary font-semibold shadow-md"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>

              {/* Simulation Stage Cards */}
              <div className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/20">
                {simStep === 1 && (
                  <div>
                    <div className="flex items-center gap-space-xs text-primary mb-space-xs">
                      <span className="material-symbols-outlined text-[20px]">description</span>
                      <span className="font-headline-sm text-headline-sm font-semibold">
                        Document Agent: Parsing Contract Bundle
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                      Extracted 84 line items from 182-page Ministry RFQ PDF. Normalized vendor requirements and extracted target budget threshold: ₹4,82,000.
                    </p>
                    <div className="font-code-inline text-code-inline text-primary">
                      Status: Payload validated against JSON Schema • Handing off to Swarm Fanout
                    </div>
                  </div>
                )}

                {simStep === 2 && (
                  <div>
                    <div className="flex items-center gap-space-xs text-primary mb-space-xs">
                      <span className="material-symbols-outlined text-[20px]">hub</span>
                      <span className="font-headline-sm text-headline-sm font-semibold">
                        Parallel Tri-Agent Analysis (Research + Finance + Security)
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                      Three agents running concurrently on isolated compute threads. Research confirms vendor reputation score (98%). Finance verifies 32% margin projection. Security confirms zero sanctions match.
                    </p>
                    <div className="font-code-inline text-code-inline text-primary">
                      Status: All 3 sub-agents returned 100% agreement • Routing to Human Gateway
                    </div>
                  </div>
                )}

                {simStep === 3 && (
                  <div>
                    <div className="flex items-center gap-space-xs text-error mb-space-xs">
                      <span className="material-symbols-outlined text-[20px]">verified_user</span>
                      <span className="font-headline-sm text-headline-sm font-semibold">
                        Human Gateway: Senior Director Signoff
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                      Because transaction value exceeds ₹1,00,000 threshold, the Swarm suspends write operations. Interactive Slack card pushed to VP Operations Marcus Vance.
                    </p>
                    <div className="font-code-inline text-code-inline text-green-700 font-semibold">
                      Status: Digital Signature verified via Slack webhook (Day 5, 14:22 UTC)
                    </div>
                  </div>
                )}

                {simStep === 4 && (
                  <div>
                    <div className="flex items-center gap-space-xs text-green-700 mb-space-xs">
                      <span className="material-symbols-outlined text-[20px]">task_alt</span>
                      <span className="font-headline-sm text-headline-sm font-semibold">
                        Data Agent: Two-Phase Commit Finalized
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                      Salesforce opportunity marked CLOSED_WON. ERP vendor contract serialized. Cryptographic audit seal signed with master envelope key.
                    </p>
                    <div className="font-code-inline text-code-inline text-primary">
                      Status: Total execution elapsed: 14 days • State preserved with zero drift
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="w-full py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg text-center bg-surface-container-lowest">
          <div className="max-w-2xl mx-auto">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-2xs block">
              Autonomous Operations
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-sm font-semibold">
              Orchestrate your enterprise swarm today.
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-space-xl">
              Configure specialized agents, connect enterprise databases, and deploy workflows with complete governance.
            </p>
            <Link
              href="/#build"
              className="inline-flex items-center justify-center gap-space-xs font-label-md text-label-md bg-primary-container text-on-primary px-space-xl py-space-sm rounded-lg shadow-md hover:bg-primary hover:shadow-lg transition-all"
            >
              <span>Build Swarm Workflow</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
