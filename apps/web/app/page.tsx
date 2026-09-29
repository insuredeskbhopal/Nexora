"use client";

import React, { useState } from "react";

export default function HomePage() {
  const [commandPrompt, setCommandPrompt] = useState("");
  const [activeTab, setActiveTab] = useState("product");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);

  const handleBuildSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandPrompt.trim()) return;

    setIsSubmitting(true);
    setSubmitFeedback("Nexora AI Architecture Compiler initialized! Generating topology...");
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitFeedback("Pipeline plan generated. Ready for review & execution.");
    }, 1200);
  };

  return (
    <>
      {/* HEADER NAVIGATION */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-200">
        <div className="h-20 max-w-[1280px] mx-auto px-gutter-sm md:px-gutter lg:px-gutter-lg flex items-center justify-between">
          <div className="w-full flex items-center justify-between px-space-md py-space-xs rounded-full bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_2px_12px_rgba(13,15,18,0.04)] ring-1 ring-outline-variant/30">
            <div className="flex items-center gap-space-sm">
              <a className="flex items-center gap-space-xs" href="#">
                <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.2)]">
                  <span className="material-symbols-outlined text-on-primary text-[20px]">hub</span>
                </div>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">Nexora</span>
              </a>
            </div>

            <nav className="hidden lg:flex items-center gap-space-lg">
              {["product", "agents", "integrations", "solutions", "developers", "pricing"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`capitalize transition-colors font-label-md text-label-md ${
                    activeTab === tab ? "text-primary font-semibold" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-space-md">
              <a
                className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors px-space-xs py-space-2xs"
                href="#interactive-demo"
              >
                Sign in
              </a>
              <a
                className="inline-flex items-center justify-center font-label-md text-label-md bg-primary-container text-on-primary px-space-md py-space-xs rounded-lg shadow-[0_4px_16px_rgba(37,99,235,0.22)] hover:bg-primary hover:shadow-[0_8px_24px_rgba(37,99,235,0.35)] transition-all"
                href="#build"
              >
                Start Building
              </a>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="w-full pt-20 bg-surface relative min-h-screen">
        <div className="flex flex-col w-full">
          {/* SECTION 1: HERO & SPATIAL EXECUTION MAP */}
          <section className="relative w-full overflow-hidden px-gutter-sm md:px-gutter lg:px-gutter-lg pt-space-xl pb-space-3xl">
            {/* Ambient Radial Glow Backdrop */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary-container/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
            <div className="absolute top-[480px] right-10 w-[550px] h-[350px] bg-tertiary-container/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

            <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center">
              {/* Sovereign Eyebrow Tag */}
              <div className="inline-flex items-center gap-space-xs px-space-md py-space-2xs rounded-full bg-surface-container-low shadow-sm mb-space-lg">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-ping"></span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                  Nexora Operational Architecture 2.0
                </span>
              </div>

              {/* Main Headline with Gradient Focal Accent */}
              <h1 className="font-headline-xl text-headline-xl md:text-display text-on-surface max-w-4xl tracking-tight leading-[1.08] mb-space-md">
                Turn instructions into{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                  autonomous execution.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="font-body-xl text-body-xl text-on-surface-variant max-w-2xl mb-space-xl">
                Tell Nexora what needs to happen. It builds the operation, coordinates AI agents, connects your systems, and executes the work.
              </p>

              {/* Action Button Group */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-space-md w-full sm:w-auto mb-space-sm">
                <a
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs font-label-md text-label-md bg-on-surface text-surface px-space-lg py-space-sm rounded-lg shadow-md hover:bg-primary hover:shadow-xl hover:shadow-primary/20 transition-all duration-300"
                  href="#build"
                >
                  <span>Start Building</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </a>
                <a
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs font-label-md text-label-md bg-surface-container-lowest text-on-surface px-space-lg py-space-sm rounded-lg shadow-sm hover:bg-surface-container-low transition-all duration-200"
                  href="#interactive-demo"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">play_circle</span>
                  <span>See Nexora in Action</span>
                </a>
              </div>

              {/* Subtext Guarantee */}
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-space-2xl">
                From simple automations to complex, long-running operations.
              </p>

              {/* Spatial Execution Canvas / Visual Mockup */}
              <div className="w-full max-w-5xl relative">
                {/* Natural Language Prompt Input Bar floating on top */}
                <div className="relative z-20 max-w-3xl mx-auto -mb-6 px-space-md py-space-sm rounded-xl bg-surface-container-lowest/90 backdrop-blur-xl shadow-xl flex items-center gap-space-sm">
                  <div className="w-7 h-7 rounded-md bg-primary-container/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface text-left truncate flex-1 font-medium">
                    &ldquo;Qualify every new lead, research the company, assign the right salesperson, send a WhatsApp acknowledgement, and escalate if nobody follows up.&rdquo;
                  </p>
                  <span className="shrink-0 px-space-xs py-space-2xs rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">
                    Active Prompt
                  </span>
                </div>

                {/* Synthesized Spatial Execution Grid Map */}
                <div className="relative z-10 w-full pt-space-xl pb-space-lg px-space-lg rounded-2xl bg-surface-container-lowest/80 backdrop-blur-md shadow-2xl overflow-hidden">
                  {/* Top Telemetry Ribbon */}
                  <div className="flex items-center justify-between pb-space-md mb-space-lg bg-surface-container-low/50 -mx-space-lg px-space-lg -mt-space-lg pt-space-md">
                    <div className="flex items-center gap-space-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
                      <span className="font-label-sm text-label-sm text-on-surface font-semibold tracking-wide uppercase">
                        Pipeline: Autonomous Growth Swarm #1084
                      </span>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="px-space-xs py-space-2xs rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-medium">
                        Stateful Execution: Active
                      </span>
                      <span className="px-space-xs py-space-2xs rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                        Latency 180ms
                      </span>
                    </div>
                  </div>

                  {/* Connected Node Stage Flow (Spatial Horizontal Canvas) */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md text-left relative">
                    <div className="hidden md:block absolute top-[52px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-primary-container via-surface-variant to-primary-container/60 -z-0"></div>

                    {/* Stage 1 */}
                    <div className="relative z-10 p-space-md rounded-xl bg-surface shadow-sm hover:shadow-md transition-all group">
                      <div className="flex items-center justify-between mb-space-xs">
                        <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary transition-colors">
                          <span className="material-symbols-outlined text-[18px]">contact_mail</span>
                        </span>
                        <span className="font-label-sm text-label-sm text-primary font-semibold uppercase">Trigger</span>
                      </div>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface text-[16px] leading-[22px] mb-space-2xs font-semibold">
                        New Lead Event
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Webhook listener captured lead #89201 via Typeform.
                      </p>
                      <div className="mt-space-sm pt-space-xs flex items-center gap-space-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                        <span className="font-code-inline text-code-inline text-on-surface-variant">Validated payload</span>
                      </div>
                    </div>

                    {/* Stage 2 */}
                    <div className="relative z-10 p-space-md rounded-xl bg-surface shadow-sm hover:shadow-md transition-all group">
                      <div className="flex items-center justify-between mb-space-xs">
                        <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-[18px]">psychology</span>
                        </span>
                        <span className="font-label-sm text-label-sm text-primary font-semibold uppercase">Multi-Agent</span>
                      </div>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface text-[16px] leading-[22px] mb-space-2xs font-semibold">
                        Deep Enrichment
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Entities scanned across SEC filings, LinkedIn &amp; Apollo.
                      </p>
                      <div className="mt-space-sm pt-space-xs flex items-center gap-space-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                        <span className="font-code-inline text-code-inline text-on-surface-variant">Score: Enterprise (Tier A)</span>
                      </div>
                    </div>

                    {/* Stage 3 */}
                    <div className="relative z-10 p-space-md rounded-xl bg-surface shadow-sm hover:shadow-md transition-all group">
                      <div className="flex items-center justify-between mb-space-xs">
                        <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary transition-colors">
                          <span className="material-symbols-outlined text-[18px]">sync_alt</span>
                        </span>
                        <span className="font-label-sm text-label-sm text-primary font-semibold uppercase">CRM &amp; Comms</span>
                      </div>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface text-[16px] leading-[22px] mb-space-2xs font-semibold">
                        Routing &amp; WhatsApp
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Salesforce contact enriched. WhatsApp sent with calendar.
                      </p>
                      <div className="mt-space-sm pt-space-xs flex items-center gap-space-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                        <span className="font-code-inline text-code-inline text-on-surface-variant">Delivered in 420ms</span>
                      </div>
                    </div>

                    {/* Stage 4 */}
                    <div className="relative z-10 p-space-md rounded-xl bg-surface shadow-sm hover:shadow-md transition-all group">
                      <div className="flex items-center justify-between mb-space-xs">
                        <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase">SLA Monitor</span>
                      </div>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface text-[16px] leading-[22px] mb-space-2xs font-semibold">
                        Stateful Escalate
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        24-hour sleep thread initialized. Auto-escalate if pending.
                      </p>
                      <div className="mt-space-sm pt-space-xs flex items-center gap-space-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                        <span className="font-code-inline text-code-inline text-tertiary font-semibold">T-23:44:12 remaining</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: TRUST THROUGH SIMPLICITY (Conversational Automation) */}
          <section className="w-full bg-surface-container-low/60 py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg" id="interactive-demo">
            <div className="max-w-[1280px] mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-space-2xl">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-2xs block">
                  Effortless Specification
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs">
                  Just tell Nexora what needs to happen.
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  No nodes to wire. No APIs to manually map. No complicated automation builder.
                </p>
              </div>

              {/* Dialogue & Synthesis Canvas */}
              <div className="max-w-4xl mx-auto bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden">
                {/* Window Title Bar */}
                <div className="bg-surface-container px-space-md py-space-xs flex items-center justify-between">
                  <div className="flex items-center gap-space-2xs">
                    <span className="w-3 h-3 rounded-full bg-outline-variant"></span>
                    <span className="w-3 h-3 rounded-full bg-outline-variant"></span>
                    <span className="w-3 h-3 rounded-full bg-outline-variant"></span>
                    <span className="ml-space-xs font-code-inline text-code-inline text-on-surface-variant font-medium">
                      nexora-kernel / conversational-architect
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Autonomous Compiler Active</span>
                </div>

                <div className="p-space-xl flex flex-col gap-space-lg">
                  {/* User Prompt Dialogue Bubble */}
                  <div className="flex items-start justify-end gap-space-sm">
                    <div className="max-w-md p-space-md rounded-2xl rounded-tr-none bg-primary text-on-primary shadow-md">
                      <p className="font-body-md text-body-md">&ldquo;Automate our vendor onboarding.&rdquo;</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-on-surface">person</span>
                    </div>
                  </div>

                  {/* Nexora Assistant Response Bubble */}
                  <div className="flex items-start gap-space-sm">
                    <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-md">
                      <span className="material-symbols-outlined text-[18px]">hub</span>
                    </div>
                    <div className="max-w-xl p-space-md rounded-2xl rounded-tl-none bg-surface-container-low text-on-surface shadow-sm">
                      <p className="font-body-md text-body-md mb-space-sm">
                        I understand. I’ll collect vendor information via secure link, verify corporate documents against registrar databases, request financial controller approval, instantiate the vendor ledger in SAP, and notify the requesting manager via Slack.
                      </p>

                      {/* Expanded Synthesized Plan Card */}
                      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
                        <div className="flex items-center justify-between pb-space-xs mb-space-xs">
                          <span className="font-label-sm text-label-sm font-semibold text-primary uppercase">
                            Generated Pipeline Topology
                          </span>
                          <span className="font-code-inline text-code-inline text-on-surface-variant">5 execution stages</span>
                        </div>
                        <div className="space-y-space-xs">
                          <div className="flex items-center gap-space-xs text-on-surface">
                            <span className="material-symbols-outlined text-primary text-[18px]">task_alt</span>
                            <span className="font-body-sm text-body-sm font-medium">Collect documentation &amp; Tax ID</span>
                          </div>
                          <div className="flex items-center gap-space-xs text-on-surface">
                            <span className="material-symbols-outlined text-primary text-[18px]">task_alt</span>
                            <span className="font-body-sm text-body-sm font-medium">Verify credentials via Global Entity Registry Agent</span>
                          </div>
                          <div className="flex items-center gap-space-xs text-on-surface">
                            <span className="material-symbols-outlined text-primary text-[18px]">task_alt</span>
                            <span className="font-body-sm text-body-sm font-medium">Human-in-the-Loop Gateway for Finance Officer</span>
                          </div>
                          <div className="flex items-center gap-space-xs text-on-surface">
                            <span className="material-symbols-outlined text-primary text-[18px]">task_alt</span>
                            <span className="font-body-sm text-body-sm font-medium">Create ERP record &amp; Slack status confirmation</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Confirmation Button */}
                      <div className="mt-space-md flex items-center gap-space-sm">
                        <a
                          href="#build"
                          className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary shadow-sm hover:shadow-md transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">play_circle</span>
                          <span>Review &amp; Deploy Pipeline</span>
                        </a>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Ready to execute in 2 seconds</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: VISUAL TRANSFORMATION (From Instruction to Operation) */}
          <section className="w-full py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg">
            <div className="max-w-[1280px] mx-auto">
              <div className="max-w-2xl mb-space-2xl">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-2xs block">
                  Architecture Lifecycle
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs">
                  From instruction to operation.
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  Four seamless phases from plain language to 24/7 resilience.
                </p>
              </div>

              {/* 4 Horizontal Phase Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
                {/* Phase 1 */}
                <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-space-md">
                      <span className="font-headline-md text-headline-md font-semibold text-primary-container">01</span>
                      <span className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface">
                        <span className="material-symbols-outlined text-[18px]">chat</span>
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs font-semibold">Describe</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Tell Nexora the outcome in natural human language. You describe what business success looks like without writing boilerplate or pseudocode.
                    </p>
                  </div>
                  <div className="mt-space-lg pt-space-xs">
                    <span className="font-code-inline text-code-inline text-primary">Natural Language Parsing</span>
                  </div>
                </div>

                {/* Phase 2 */}
                <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-space-md">
                      <span className="font-headline-md text-headline-md font-semibold text-primary-container">02</span>
                      <span className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface">
                        <span className="material-symbols-outlined text-[18px]">schema</span>
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs font-semibold">Plan</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Nexora designs the full architecture, logic tree, state machine, failover paths, and selects the optimal tools and APIs for zero downtime.
                    </p>
                  </div>
                  <div className="mt-space-lg pt-space-xs">
                    <span className="font-code-inline text-code-inline text-primary">State Machine Synthesis</span>
                  </div>
                </div>

                {/* Phase 3 */}
                <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-space-md">
                      <span className="font-headline-md text-headline-md font-semibold text-primary-container">03</span>
                      <span className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface">
                        <span className="material-symbols-outlined text-[18px]">verified_user</span>
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs font-semibold">Review</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Inspect the transparent execution plan, agent delegations, and configure exact human approval safeguards before anything commits.
                    </p>
                  </div>
                  <div className="mt-space-lg pt-space-xs">
                    <span className="font-code-inline text-code-inline text-primary">Deterministic Policy Audit</span>
                  </div>
                </div>

                {/* Phase 4 */}
                <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-space-md">
                      <span className="font-headline-md text-headline-md font-semibold text-primary-container">04</span>
                      <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-md">
                        <span className="material-symbols-outlined text-[18px]">bolt</span>
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs font-semibold">Execute</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Nexora deploys, monitors, handles network retries, and maintains stateful memory indefinitely across weeks and months of real operation.
                    </p>
                  </div>
                  <div className="mt-space-lg pt-space-xs">
                    <span className="font-code-inline text-code-inline text-primary">Zero-Loss Persistence</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: HARD AUTOMATIONS (Long-Running Enterprise Process) */}
          <section className="w-full bg-surface-container py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg">
            <div className="max-w-[1280px] mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-2xl gap-space-md">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-2xs block">
                    Long-Running Resilience
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">
                    Built for work that takes more than one step.
                  </h2>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                  Some work finishes in seconds. Some takes days or weeks. Nexora preserves memory, sleeps statefully, and resumes seamlessly.
                </p>
              </div>

              {/* Complex 14-Day Enterprise RFQ Visual */}
              <div className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-xl">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-space-lg mb-space-lg bg-surface-container-low p-space-md rounded-xl">
                  <div>
                    <div className="flex items-center gap-space-xs mb-space-2xs">
                      <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                        14-Day Global Tender &amp; RFQ Pipeline
                      </span>
                      <span className="px-space-xs py-space-2xs rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold">
                        Active Run
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Instance ID: run_rfq_9942a • Initiated by Enterprise Accounts Core
                    </p>
                  </div>
                  <div className="mt-space-sm lg:mt-0 flex items-center gap-space-md">
                    <span className="font-code-inline text-code-inline text-on-surface-variant">Elapsed: 8 days 14 hours</span>
                    <span className="font-code-inline text-code-inline text-primary font-semibold">Step 5 of 7</span>
                  </div>
                </div>

                {/* Sequential Stepper with Status Logic */}
                <div className="space-y-space-md">
                  <div className="flex items-start gap-space-md p-space-sm rounded-xl bg-surface hover:bg-surface-container-low transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-body-md text-body-md font-semibold text-on-surface">Tender Specification Received</span>
                        <span className="font-label-sm text-label-sm text-primary font-semibold">Completed (Day 1)</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">PDF RFQ tender package imported from Ministry Portal (182 pages).</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-space-md p-space-sm rounded-xl bg-surface hover:bg-surface-container-low transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-body-md text-body-md font-semibold text-on-surface">Deep OCR &amp; Vector Clause Synthesis</span>
                        <span className="font-label-sm text-label-sm text-primary font-semibold">Completed (Day 2)</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Extracted 84 mandatory compliance requirements and 12 delivery milestones.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-space-md p-space-sm rounded-xl bg-surface hover:bg-surface-container-low transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-space-2xs">
                        <span className="font-body-md text-body-md font-semibold text-on-surface">Parallel Tri-Agent Analysis</span>
                        <span className="font-label-sm text-label-sm text-primary font-semibold">Completed (Day 4)</span>
                      </div>
                      <div className="flex flex-wrap gap-space-xs mt-space-2xs">
                        <span className="px-space-xs py-space-2xs rounded bg-surface-container text-on-surface font-label-sm text-label-sm">
                          Technical Agent (Architecture Feasibility: 98%)
                        </span>
                        <span className="px-space-xs py-space-2xs rounded bg-surface-container text-on-surface font-label-sm text-label-sm">
                          Finance Agent (Margin Projection: 32.4%)
                        </span>
                        <span className="px-space-xs py-space-2xs rounded bg-surface-container text-on-surface font-label-sm text-label-sm">
                          Legal Agent (SLA Liability Cleared)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-space-md p-space-sm rounded-xl bg-surface hover:bg-surface-container-low transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-body-md text-body-md font-semibold text-on-surface">Human Approval Gateway: Senior Director Signoff</span>
                        <span className="font-label-sm text-label-sm text-primary font-semibold">Approved via Slack (Day 5)</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Signature authenticated by Marcus Vance (VP Operations).</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-space-md p-space-sm rounded-xl bg-primary/5 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center shrink-0 animate-pulse">
                      <span className="material-symbols-outlined text-[18px]">hourglass_empty</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-body-md text-body-md font-semibold text-on-surface">Awaiting Third-Party Vendor Security Pack</span>
                        <span className="font-label-sm text-label-sm text-tertiary font-semibold">State: Sleeping Safely (Day 8)</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Nexora suspended execution. Listening for ISO-27001 webhook receipt. Zero compute consumed while idle.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-space-md p-space-sm rounded-xl opacity-60">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">schedule</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-body-md text-body-md font-semibold text-on-surface">Final Verification &amp; Cryptographic Bundle</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Scheduled (Day 11)</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Automated hashing, e-signature dispatch, and audit trail ledger generation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5: AGENTS (Multi-Agent Orchestration) */}
          <section className="w-full py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg">
            <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
              <div className="lg:col-span-5">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-2xs block">
                  Swarm Coordination
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-sm font-semibold">
                  Agents that work together.
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant mb-space-lg">
                  Nexora coordinates specialized agents for research, finance, documents, data reconciliation, and verification — keeping every role aligned under unified sovereign governance.
                </p>
                <div className="space-y-space-sm">
                  <div className="flex items-start gap-space-sm">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-primary text-[16px]">check</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface">
                      <span className="font-semibold">Context propagation:</span> Agents share clean structured payloads without prompt drift.
                    </p>
                  </div>
                  <div className="flex items-start gap-space-sm">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-primary text-[16px]">check</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface">
                      <span className="font-semibold">Deterministic verification:</span> No single agent finalizes critical write actions in isolation.
                    </p>
                  </div>
                  <div className="flex items-start gap-space-sm">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-primary text-[16px]">check</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface">
                      <span className="font-semibold">Dynamic swarm routing:</span> Auto-assign tasks to specialized sub-agents based on data complexity.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Orchestration Spatial Graphic */}
              <div className="lg:col-span-7 relative p-space-xl rounded-2xl bg-surface-container-low flex flex-col items-center justify-center">
                <div className="relative z-10 w-28 h-28 rounded-2xl bg-on-surface text-surface flex flex-col items-center justify-center shadow-2xl mb-space-xl">
                  <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center mb-space-2xs shadow-md">
                    <span className="material-symbols-outlined text-on-primary text-[24px]">hub</span>
                  </div>
                  <span className="font-label-sm text-label-sm font-semibold tracking-tight">Nexora Core</span>
                  <span className="font-code-inline text-[10px] text-outline-variant">ORCHESTRATOR</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md w-full relative z-10">
                  <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-space-xs mb-space-2xs">
                      <span className="material-symbols-outlined text-primary text-[20px]">travel_explore</span>
                      <span className="font-headline-sm text-headline-sm text-[15px] font-semibold text-on-surface">Research Agent</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Market &amp; entity intelligence across web and internal docs.</p>
                  </div>

                  <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-space-xs mb-space-2xs">
                      <span className="material-symbols-outlined text-primary text-[20px]">account_balance</span>
                      <span className="font-headline-sm text-headline-sm text-[15px] font-semibold text-on-surface">Finance Agent</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Ledger matching, invoices &amp; balance threshold audits.</p>
                  </div>

                  <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-space-xs mb-space-2xs">
                      <span className="material-symbols-outlined text-primary text-[20px]">description</span>
                      <span className="font-headline-sm text-headline-sm text-[15px] font-semibold text-on-surface">Document Agent</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Deep contract parsing and structured JSON extraction.</p>
                  </div>

                  <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-space-xs mb-space-2xs">
                      <span className="material-symbols-outlined text-primary text-[20px]">database</span>
                      <span className="font-headline-sm text-headline-sm text-[15px] font-semibold text-on-surface">Data Agent</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Reconciles mutations across SQL, Mongo, and analytics warehouses.</p>
                  </div>

                  <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-space-xs mb-space-2xs">
                      <span className="material-symbols-outlined text-primary text-[20px]">shield</span>
                      <span className="font-headline-sm text-headline-sm text-[15px] font-semibold text-on-surface">Verification Agent</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Fraud screening, AML adherence, and audit validations.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 6: CONNECT EVERYTHING (The Tool Ecosystem) */}
          <section className="w-full bg-surface-container-low/80 py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg">
            <div className="max-w-[1280px] mx-auto text-center">
              <div className="max-w-2xl mx-auto mb-space-2xl">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-2xs block">
                  Unified Ecosystem
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs font-semibold">
                  Works across the tools your business already uses.
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Plug Nexora into your existing infrastructure. Over 200+ native connectors, internal enterprise protocols, and headless browser workers.
                </p>
              </div>

              {/* Grid of Enterprise Integration Nodes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-space-md">
                {[
                  { name: "Google Workspace", meta: "OAuth2 • Full Read/Write", icon: "mail" },
                  { name: "Slack", meta: "Interactive Blocks & Bots", icon: "forum" },
                  { name: "Salesforce", meta: "SOQL & Bulk REST API", icon: "cloud" },
                  { name: "HubSpot", meta: "Real-time Webhook Sync", icon: "contact_page" },
                  { name: "WhatsApp Cloud", meta: "Meta Business API", icon: "send_to_mobile" },
                  { name: "PostgreSQL", meta: "Direct Pooled Driver", icon: "database" },
                  { name: "Microsoft 365", meta: "Graph API & Sharepoint", icon: "folder" },
                  { name: "Shopify", meta: "Storefront & Admin API", icon: "shopping_bag" },
                  { name: "GitHub", meta: "PRs, Issues & Actions", icon: "code" },
                  { name: "Custom APIs", meta: "REST, GraphQL & gRPC", icon: "terminal" },
                  { name: "Webhooks", meta: "Instant Event Ingest", icon: "webhook" },
                  { name: "Browser AI", meta: "Headless Chromium Cluster", icon: "language" },
                ].map((tool) => (
                  <div
                    key={tool.name}
                    className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col items-center justify-center gap-space-xs hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[28px]">{tool.icon}</span>
                    </div>
                    <span className="font-headline-sm text-headline-sm text-[15px] font-semibold text-on-surface">{tool.name}</span>
                    <span className="font-code-inline text-[11px] text-on-surface-variant">{tool.meta}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 7: HUMAN CONTROL */}
          <section className="w-full py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg">
            <div className="max-w-[1280px] mx-auto">
              <div className="max-w-2xl mb-space-2xl">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-2xs block">
                  Deterministic Safeguards
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs font-semibold">
                  Autonomous where it should be. Human when it matters.
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  Speed without recklessness. Nexora enforces strict threshold boundaries that guarantee irreversible operations receive verified human approval.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
                {/* Left: Financial Approval Interactive Artifact */}
                <div className="lg:col-span-6 p-space-xl rounded-2xl bg-surface-container-lowest shadow-xl">
                  <div className="flex items-center justify-between pb-space-md mb-space-md bg-surface-container-low p-space-sm rounded-xl">
                    <div className="flex items-center gap-space-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-error-container"></span>
                      <span className="font-label-sm text-label-sm font-semibold text-on-surface">Human Signoff Triggered</span>
                    </div>
                    <span className="font-code-inline text-code-inline text-on-surface-variant">TxID #PAY-88219</span>
                  </div>
                  <div className="space-y-space-md mb-space-xl">
                    <div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Payment Authorization Request</span>
                      <div className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">₹4,82,000</div>
                    </div>
                    <div className="grid grid-cols-2 gap-space-sm">
                      <div className="p-space-sm rounded-lg bg-surface">
                        <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Beneficiary Vendor</span>
                        <span className="font-body-sm text-body-sm font-semibold text-on-surface">ABC Industries Ltd.</span>
                      </div>
                      <div className="p-space-sm rounded-lg bg-surface">
                        <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Triggered By</span>
                        <span className="font-body-sm text-body-sm font-semibold text-on-surface">Finance Agent #4</span>
                      </div>
                    </div>
                    <div className="p-space-sm rounded-lg bg-surface-container-low text-on-surface">
                      <div className="flex items-center gap-space-xs text-tertiary mb-1">
                        <span className="material-symbols-outlined text-[18px]">info</span>
                        <span className="font-label-sm text-label-sm font-semibold">Governance Guardrail Flag</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Amount exceeds the ₹1,00,000 unassisted execution limit specified in Company Financial Rulebook #2.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-space-md">
                    <button
                      type="button"
                      onClick={() => alert("Approval granted: Signoff recorded into immutable audit log.")}
                      className="flex-1 py-space-sm px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-primary shadow-md hover:shadow-lg transition-all text-center"
                    >
                      Approve Payment
                    </button>
                    <button
                      type="button"
                      onClick={() => alert("Audit snapshot: Verified invoice matched with purchase order #PO-901.")}
                      className="flex-1 py-space-sm px-space-md rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-variant transition-colors text-center"
                    >
                      Review Details
                    </button>
                  </div>
                </div>

                {/* Right: Governance Policy Matrix */}
                <div className="lg:col-span-6 p-space-xl rounded-2xl bg-surface-container-low shadow-sm">
                  <div className="flex items-center justify-between mb-space-lg">
                    <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Active Governance Policy Matrix</h3>
                    <span className="font-code-inline text-code-inline text-primary">Ruleset: Enterprise Sovereign</span>
                  </div>
                  <div className="space-y-space-sm">
                    <div className="flex items-center justify-between p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
                      <div className="flex items-center gap-space-sm">
                        <span className="material-symbols-outlined text-primary text-[20px]">manage_search</span>
                        <span className="font-body-md text-body-md font-medium text-on-surface">Deep Market Research &amp; Intelligence</span>
                      </div>
                      <span className="px-space-xs py-space-2xs rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">
                        Automatic
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
                      <div className="flex items-center gap-space-sm">
                        <span className="material-symbols-outlined text-primary text-[20px]">sync</span>
                        <span className="font-body-md text-body-md font-medium text-on-surface">CRM Enrichment &amp; Contact Tagging</span>
                      </div>
                      <span className="px-space-xs py-space-2xs rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">
                        Automatic
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
                      <div className="flex items-center gap-space-sm">
                        <span className="material-symbols-outlined text-tertiary text-[20px]">sms</span>
                        <span className="font-body-md text-body-md font-medium text-on-surface">Customer Direct Messaging</span>
                      </div>
                      <span className="px-space-xs py-space-2xs rounded-full bg-tertiary/10 text-tertiary font-label-sm text-label-sm font-semibold">
                        Controlled Safeguards
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
                      <div className="flex items-center gap-space-sm">
                        <span className="material-symbols-outlined text-primary-container text-[20px]">payments</span>
                        <span className="font-body-md text-body-md font-medium text-on-surface">Payments &amp; Wire Transfers (&gt; ₹1,00,000)</span>
                      </div>
                      <span className="px-space-xs py-space-2xs rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold">
                        Human Approval Req.
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
                      <div className="flex items-center gap-space-sm">
                        <span className="material-symbols-outlined text-error text-[20px]">delete_forever</span>
                        <span className="font-body-md text-body-md font-medium text-on-surface">Production DB Table Drop or Truncate</span>
                      </div>
                      <span className="px-space-xs py-space-2xs rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
                        Hard Blocked
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 8: RECOVERY & STATE PRESERVATION */}
          <section className="w-full bg-surface-container py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg">
            <div className="max-w-[1280px] mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-space-2xl">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-2xs block">
                  Self-Healing Execution
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs font-semibold">
                  It doesn’t just run. It knows when to stop.
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  Nexora keeps state so operations can pause, wait, retry, and continue without ever starting over.
                </p>
              </div>

              <div className="max-w-4xl mx-auto bg-surface-container-lowest rounded-2xl p-space-xl shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-xl relative">
                  <div className="p-space-lg rounded-xl bg-surface-container-low flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-space-xs text-error mb-space-sm">
                        <span className="material-symbols-outlined text-[20px]">pause_circle</span>
                        <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider">Step 1: Graceful Serialization</span>
                      </div>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-space-2xs">Salesforce Token Expired</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                        Workflow safely paused before step execution. All memory variables, lead telemetry, and research payloads serialized to immutable storage.
                      </p>
                    </div>
                    <div>
                      <div className="p-space-sm rounded-lg bg-surface text-on-surface mb-space-md">
                        <span className="font-code-inline text-code-inline text-on-surface-variant block mb-1">System State Snapshot:</span>
                        <span className="font-code-inline text-code-inline text-primary">0 errors in data • 100% state preserved</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => alert("Navigating to OAuth Credential Vault...")}
                        className="w-full py-space-xs px-space-md rounded-lg bg-on-surface text-surface font-label-md text-label-md hover:bg-primary transition-colors"
                      >
                        Reconnect Salesforce OAuth
                      </button>
                    </div>
                  </div>

                  <div className="p-space-lg rounded-xl bg-primary/5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-space-xs text-primary mb-space-sm">
                        <span className="material-symbols-outlined text-[20px]">play_circle</span>
                        <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider">Step 2: Resumption</span>
                      </div>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-space-2xs">Resumed from Exact Point</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                        Connection authenticated. Nexora deserialized state and continued Step 4 (CRM Sync) instantly without re-running earlier steps.
                      </p>
                    </div>
                    <div>
                      <div className="p-space-sm rounded-lg bg-surface text-on-surface mb-space-md">
                        <span className="font-code-inline text-code-inline text-on-surface-variant block mb-1">Execution Outcome:</span>
                        <span className="font-code-inline text-code-inline text-primary font-semibold">100% completed without data loss</span>
                      </div>
                      <div className="flex items-center justify-between text-primary font-label-sm text-label-sm font-semibold">
                        <span>Total Recovery Time: 4.2s</span>
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 9: POWER WITHOUT COMPLEXITY */}
          <section className="w-full py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg">
            <div className="max-w-[1280px] mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-space-2xl">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-2xs block">
                  Bimodal Ergonomics
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs font-semibold">
                  Power without complexity.
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  Intuitive natural language for operational teams. Deep programmatic control for engineers.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
                <div className="p-space-xl rounded-2xl bg-surface-container-lowest shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-space-md">
                      <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Simple when you want it.</span>
                      <span className="px-space-xs py-space-2xs rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm">
                        No-Code Canvas
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">
                      Operate through pure conversational intention. Anyone on your business team can define workflows, ask questions, and deploy live automation.
                    </p>
                    <div className="p-space-md rounded-xl bg-surface-container-low mb-space-md">
                      <span className="font-label-sm text-label-sm text-on-surface-variant block mb-space-2xs">Prompt Instruction</span>
                      <p className="font-body-sm text-body-sm font-medium text-on-surface">
                        &ldquo;Every Friday at 5 PM, compile completed Jira epics, generate executive summary in Notion, and email the team.&rdquo;
                      </p>
                    </div>
                  </div>
                  <div className="pt-space-md flex items-center gap-space-xs text-primary font-label-md text-label-md">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    <span>Zero configuration required</span>
                  </div>
                </div>

                <div className="p-space-xl rounded-2xl bg-surface-container-lowest shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-space-md">
                      <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Powerful when you need it.</span>
                      <span className="px-space-xs py-space-2xs rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">
                        Dev &amp; CLI Mode
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">
                      Full access to underlying JSON execution graphs, raw webhook listeners, SQL queries, TypeScript hooks, and custom container runtimes.
                    </p>
                    <div className="p-space-md rounded-xl bg-on-surface text-surface mb-space-md font-code-inline text-code-inline overflow-x-auto">
                      <pre className="text-primary-fixed">{`{
  "operation": "deploy_swarm",
  "concurrency": "distributed_raft",
  "retry_policy": {
    "max_backoff_ms": 30000,
    "strategy": "exponential_jitter"
  },
  "hooks": ["sec_audit_v2", "pg_pool_write"]
}`}</pre>
                    </div>
                  </div>
                  <div className="pt-space-md flex items-center gap-space-xs text-on-surface font-label-md text-label-md">
                    <span className="material-symbols-outlined text-primary text-[20px]">terminal</span>
                    <span>Complete SDK &amp; Webhook Governance</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 10: FINAL CALL TO ACTION */}
          <section className="w-full bg-surface-container-lowest py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg relative overflow-hidden" id="build">
            <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
            <div className="max-w-[1280px] mx-auto text-center flex flex-col items-center">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-sm block">
                Start In Seconds
              </span>
              <h2 className="font-headline-xl text-headline-xl md:text-display text-on-surface mb-space-md max-w-3xl tracking-tight font-semibold">
                What do you want Nexora to run?
              </h2>
              <p className="font-body-xl text-body-xl text-on-surface-variant mb-space-2xl max-w-xl">
                Nexora — Turn instructions into autonomous execution.
              </p>

              {/* Large Interactive Command Input Pill */}
              <form
                onSubmit={handleBuildSubmit}
                className="w-full max-w-2xl p-space-2xs rounded-2xl bg-surface-container shadow-xl flex flex-col sm:flex-row items-center gap-space-2xs mb-space-2xl"
              >
                <div className="flex items-center gap-space-xs px-space-md py-space-xs w-full">
                  <span className="material-symbols-outlined text-primary text-[22px]">terminal</span>
                  <input
                    value={commandPrompt}
                    onChange={(e) => setCommandPrompt(e.target.value)}
                    className="bg-transparent border-0 outline-none w-full font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:ring-0"
                    placeholder="Tell Nexora what needs to happen..."
                    type="text"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-xl bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <span>{isSubmitting ? "Compiling..." : "Build it"}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </form>

              {submitFeedback && (
                <div className="mb-space-lg px-space-md py-space-xs rounded-lg bg-primary/10 text-primary font-label-md text-label-md animate-fade-in">
                  {submitFeedback}
                </div>
              )}

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-space-md text-on-surface-variant font-label-sm text-label-sm">
                <div className="flex items-center gap-space-2xs">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                  <span>Enterprise SSO (SAML/Okta)</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-space-2xs">
                  <span className="material-symbols-outlined text-primary text-[18px]">cloud</span>
                  <span>On-Premises or Private Cloud</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-space-2xs">
                  <span className="material-symbols-outlined text-primary text-[18px]">lock</span>
                  <span>SOC2 Type II Aligned</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-space-2xs">
                  <span className="material-symbols-outlined text-primary text-[18px]">history</span>
                  <span>Full Audit Trails</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-surface-container-low/70 py-space-2xl">
        <div className="max-w-[1280px] mx-auto px-gutter-sm md:px-gutter lg:px-gutter-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-space-lg mb-space-xl">
            <div className="col-span-2 md:col-span-4 lg:col-span-2 pr-space-md">
              <div className="flex items-center gap-space-xs mb-space-sm">
                <div className="w-6 h-6 rounded bg-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary text-[16px]">hub</span>
                </div>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Nexora</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
                Autonomous operational infrastructure engineered for high-leverage agentic intelligence.
              </p>
            </div>

            <div className="flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold mb-space-2xs">
                Product
              </span>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">
                Platform
              </a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">
                Autonomous Core
              </a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">
                Workflows
              </a>
            </div>

            <div className="flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold mb-space-2xs">
                Agents
              </span>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">
                Orchestration
              </a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">
                Multi-Agent Swarms
              </a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">
                Agent Registry
              </a>
            </div>

            <div className="flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold mb-space-2xs">
                Developers
              </span>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">
                Documentation
              </a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">
                API Reference
              </a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">
                SDKs &amp; Tools
              </a>
            </div>

            <div className="flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold mb-space-2xs">
                Company
              </span>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">
                About
              </a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">
                Contact
              </a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">
                Pricing
              </a>
            </div>

            <div className="flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold mb-space-2xs">
                Legal
              </span>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">
                Privacy Policy
              </a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">
                Terms of Service
              </a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">
                Security
              </a>
            </div>
          </div>

          <div className="pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-sm border-t border-outline-variant/30">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              &copy; Nexora Technologies Inc. Turn instructions into autonomous execution.
            </p>
            <div className="flex items-center gap-space-md">
              <span className="inline-flex items-center gap-space-2xs font-label-sm text-label-sm text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                All Systems Operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
