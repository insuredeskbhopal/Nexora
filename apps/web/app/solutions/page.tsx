"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";

const SOLUTIONS = [
  {
    id: "procurement",
    title: "Global Procurement & RFQ Management",
    tag: "Supply Chain",
    icon: "inventory_2",
    summary: "Coordinate 14-day government and enterprise tender cycles from intake to signed contract.",
    problem: "Procurement teams spend 40+ hours per RFQ manually parsing 200-page specs and verifying vendor compliance.",
    solution: "Nexora deconstructs tenders with OCR, deploys tri-agent analysis for technical feasibility, margins, and legal indemnity, and holds for VP signoff.",
    metric: "82% reduction in RFP response time",
  },
  {
    id: "finance",
    title: "Multi-Bank Reconciliation & AML Audits",
    tag: "Fintech & Banking",
    icon: "account_balance",
    summary: "Reconcile thousands of daily wire transactions across SWIFT, Stripe, and SAP general ledgers.",
    problem: "Manual spreadsheet reconciliation leads to delayed close cycles, human ledger errors, and missed AML flags.",
    solution: "Autonomous financial agents run 3-way matches, verify cryptographic audit hashes, and enforce strict human approval for high-value transactions.",
    metric: "100% auditable non-repudiation log",
  },
  {
    id: "support",
    title: "Stateful SLA Ticket Escalation",
    tag: "Customer Operations",
    icon: "support_agent",
    summary: "Long-running multi-day customer escalations with zero server compute consumed while sleeping.",
    problem: "Standard webhooks timeout after 30 seconds; multi-day customer feedback loops require complex custom cron infrastructure.",
    solution: "Nexora serializes execution memory into durable Postgres state, pauses safely, and resumes automatically when customer webhooks trigger.",
    metric: "Zero state loss across 30+ day threads",
  },
  {
    id: "devops",
    title: "Autonomous Cloud Incident Triage",
    tag: "Engineering & IT",
    icon: "dns",
    summary: "Correlate Datadog anomalies, identify culprit git commits, and stage automated canary rollbacks.",
    problem: "On-call engineers are woken up at 3 AM to parse gigabytes of unstructured stack traces.",
    solution: "DevOps agent diagnoses container crashes, verifies canary error rates, rolls back deployments via GitHub Actions, and posts incident timeline in Slack.",
    metric: "MTTR reduced from 45m to 2.4 minutes",
  },
];

export default function SolutionsPage() {
  const [teamSize, setTeamSize] = useState(25);
  const [opsPerWeek, setOpsPerWeek] = useState(200);

  const hoursSavedPerYear = Math.round(teamSize * opsPerWeek * 0.45 * 52);
  const costSavingsPerYear = Math.round(hoursSavedPerYear * 65);

  return (
    <>
      <Navbar currentTab="Solutions" />

      <main className="w-full pt-20 bg-surface relative min-h-screen">
        {/* HERO */}
        <section className="relative w-full overflow-hidden px-gutter-sm md:px-gutter lg:px-gutter-lg pt-space-xl pb-space-3xl">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary-container/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
          <div className="absolute top-[480px] right-10 w-[550px] h-[350px] bg-tertiary-container/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

          <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-space-xs px-space-md py-space-2xs rounded-full bg-surface-container-low shadow-sm mb-space-lg">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                Enterprise Blueprint Library
              </span>
            </div>

            <h1 className="font-headline-xl text-headline-xl md:text-display text-on-surface max-w-4xl tracking-tight leading-[1.1] mb-space-md">
              Hard automations built for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                real business stakes.
              </span>
            </h1>

            <p className="font-body-xl text-body-xl text-on-surface-variant max-w-3xl mb-space-xl">
              When workflows span weeks, cross multiple legacy systems, and carry severe financial consequences, standard automation scripts fail. Nexora was engineered precisely for these scenarios.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-space-md w-full sm:w-auto mb-space-2xl">
              <Link
                className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs font-label-md text-label-md bg-on-surface text-surface px-space-lg py-space-sm rounded-lg shadow-md hover:bg-primary transition-all duration-300"
                href="/#build"
              >
                <span>Deploy A Solution Blueprint</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link
                className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs font-label-md text-label-md bg-surface-container-lowest text-on-surface px-space-lg py-space-sm rounded-lg shadow-sm hover:bg-surface-container-low transition-all duration-200"
                href="/pricing"
              >
                <span className="material-symbols-outlined text-primary text-[20px]">calculate</span>
                <span>Calculate Enterprise ROI</span>
              </Link>
            </div>
          </div>
        </section>

        {/* DETAILED SOLUTION BLUEPRINTS */}
        <section className="w-full py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg bg-surface-container-low/40">
          <div className="max-w-[1280px] mx-auto space-y-space-2xl">
            {SOLUTIONS.map((sol, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={sol.id}
                  id={sol.id}
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center p-space-xl rounded-3xl bg-surface-container-lowest shadow-md border border-outline-variant/15`}
                >
                  <div className={`lg:col-span-7 ${isEven ? "" : "lg:order-2"}`}>
                    <div className="flex items-center gap-space-xs mb-space-xs">
                      <span className="px-space-xs py-space-2xs rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">
                        {sol.tag}
                      </span>
                      <span className="font-code-inline text-[11px] text-on-surface-variant">
                        Durable Blueprint #0{index + 1}
                      </span>
                    </div>

                    <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs font-semibold">
                      {sol.title}
                    </h2>
                    <p className="font-body-lg text-body-lg text-on-surface-variant mb-space-lg">
                      {sol.summary}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md mb-space-lg">
                      <div className="p-space-md rounded-xl bg-surface-container-low">
                        <span className="font-label-sm text-label-sm uppercase tracking-wider text-error font-semibold block mb-1">
                          The Friction
                        </span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {sol.problem}
                        </p>
                      </div>
                      <div className="p-space-md rounded-xl bg-surface-container-low">
                        <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold block mb-1">
                          The Nexora Blueprint
                        </span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {sol.solution}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-space-xs text-primary font-label-md text-label-md font-semibold">
                      <span className="material-symbols-outlined text-[20px]">trending_up</span>
                      <span>Verified Impact: {sol.metric}</span>
                    </div>
                  </div>

                  <div className={`lg:col-span-5 p-space-lg rounded-2xl bg-surface-container-low flex flex-col justify-center ${isEven ? "" : "lg:order-1"}`}>
                    <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center mb-space-md shadow-md">
                      <span className="material-symbols-outlined text-[28px]">{sol.icon}</span>
                    </div>
                    <span className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-space-2xs">
                      Included Swarm Actors:
                    </span>
                    <ul className="space-y-space-2xs font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                      <li className="flex items-center gap-space-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                        <span>Document OCR &amp; Vector Parser</span>
                      </li>
                      <li className="flex items-center gap-space-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                        <span>Ledger &amp; Margin Heuristic Worker</span>
                      </li>
                      <li className="flex items-center gap-space-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                        <span>Slack Interactive Approval Gateway</span>
                      </li>
                      <li className="flex items-center gap-space-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                        <span>Durable State Serialization Engine</span>
                      </li>
                    </ul>
                    <Link
                      href="/#build"
                      className="inline-flex items-center justify-center gap-space-xs py-space-xs px-space-md rounded-lg bg-on-surface text-surface font-label-md text-label-md hover:bg-primary transition-colors text-center"
                    >
                      <span>Clone This Blueprint</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* INTERACTIVE ROI CALCULATOR */}
        <section className="w-full py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-space-2xl">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-2xs block">
                Impact Quantifier
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs font-semibold">
                Calculate your team&apos;s efficiency return.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                See how replacing fragmented scripts and manual workflows with Nexora swarms transforms operational margins.
              </p>
            </div>

            <div className="max-w-4xl mx-auto rounded-3xl bg-surface-container-lowest p-space-xl shadow-xl border border-outline-variant/15 grid grid-cols-1 md:grid-cols-2 gap-space-xl items-center">
              {/* Sliders */}
              <div className="space-y-space-lg">
                <div>
                  <div className="flex items-center justify-between mb-space-xs">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Operations Team Size:
                    </span>
                    <span className="font-code-inline text-code-inline text-primary font-semibold">
                      {teamSize} people
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="200"
                    value={teamSize}
                    onChange={(e) => setTeamSize(Number(e.target.value))}
                    className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-space-xs">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Complex Operations per Week:
                    </span>
                    <span className="font-code-inline text-code-inline text-primary font-semibold">
                      {opsPerWeek} ops
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="1000"
                    step="10"
                    value={opsPerWeek}
                    onChange={(e) => setOpsPerWeek(Number(e.target.value))}
                    className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  *Based on average 45-minute manual effort per workflow and standard $65/hr fully-loaded enterprise operational cost.
                </p>
              </div>

              {/* Result Callout */}
              <div className="p-space-xl rounded-2xl bg-surface-container-low text-center flex flex-col justify-center">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-xs">
                  Estimated Annual Savings
                </span>
                <div className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight mb-space-xs">
                  ₹{(costSavingsPerYear * 83).toLocaleString("en-IN")}
                </div>
                <span className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                  (~${costSavingsPerYear.toLocaleString("en-US")} USD equivalent)
                </span>
                <div className="p-space-sm rounded-lg bg-surface font-code-inline text-code-inline text-primary">
                  {hoursSavedPerYear.toLocaleString()} Engineering Hours Reclaimed
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="w-full py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg text-center bg-surface-container-lowest">
          <div className="max-w-2xl mx-auto">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-2xs block">
              Tailored Architecture
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-sm font-semibold">
              Have an impossible enterprise workflow?
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-space-xl">
              Our solutions architects will help you design a customized multi-agent topology tailored to your exact compliance, security, and legacy protocols.
            </p>
            <Link
              href="/#build"
              className="inline-flex items-center justify-center gap-space-xs font-label-md text-label-md bg-primary-container text-on-primary px-space-xl py-space-sm rounded-lg shadow-md hover:bg-primary hover:shadow-lg transition-all"
            >
              <span>Build Custom Solution</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
