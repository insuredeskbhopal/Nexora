"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";

const TIERS = [
  {
    name: "Developer",
    badge: "Free Forever",
    price: "$0",
    period: "forever",
    description: "Ideal for individual developers, hobbyists, and early prototypes.",
    highlight: false,
    features: [
      "1,000 durable executions / month",
      "5 concurrent agent swarm workers",
      "Standard connectors (Slack, Gmail, GitHub, Postgres)",
      "7-day execution state retention",
      "Local CLI development loop",
      "Community Discord & GitHub support",
    ],
    ctaText: "Start Building Free",
    ctaLink: "/#build",
  },
  {
    name: "Team Pro",
    badge: "Most Popular",
    price: "$99",
    period: "per month",
    description: "Engineered for high-velocity teams automating critical business operations.",
    highlight: true,
    features: [
      "50,000 durable executions / month",
      "Unlimited concurrent agent swarms",
      "All 200+ Enterprise Connectors (Salesforce, SAP, Stripe)",
      "AES-256 Envelope Credential Vault",
      "90-day execution state retention",
      "Saga automatic rollback compensation",
      "Interactive human approval Slack bot",
      "Priority email & Slack SLA support",
    ],
    ctaText: "Start 14-Day Free Trial",
    ctaLink: "/#build",
  },
  {
    name: "Enterprise Sovereign",
    badge: "Maximum Security",
    price: "Custom",
    period: "volume based",
    description: "For organizations demanding self-hosted air-gapped VPCs and strict regulatory compliance.",
    highlight: false,
    features: [
      "Unlimited executions & swarm scale",
      "Self-hosted VPC or on-premises deployment",
      "Bring Your Own LLM (OpenAI, Claude, Ollama, vLLM)",
      "Enterprise SSO (SAML 2.0, Okta, Azure AD)",
      "Infinite immutable cryptographic audit trails",
      "Zero data egress guarantee",
      "99.99% execution uptime SLA",
      "Dedicated Solutions Architect & 24/7 hotline",
    ],
    ctaText: "Contact Enterprise Sales",
    ctaLink: "/#build",
  },
];

const FAQS = [
  {
    q: "How does Nexora count workflow executions?",
    a: "An execution is counted each time a compiled pipeline runs from trigger to completion. Multi-step loops, parallel agent fanouts, and state pauses are included within the single run.",
  },
  {
    q: "Does a 14-day sleeping workflow consume continuous compute?",
    a: "No! Unlike standard worker nodes that hold open HTTP connections or compute threads, Nexora serializes memory to Postgres and shuts down compute. When the webhook or resume timer triggers, state is restored in milliseconds with zero idle compute cost.",
  },
  {
    q: "Can we use our own LLM API keys and models?",
    a: "Yes. Nexora supports Bring-Your-Own-Key (BYOK) for OpenAI, Anthropic, Google Gemini, and self-hosted open-weights models (Ollama, vLLM, DeepSeek) through our proxy gateway.",
  },
  {
    q: "How secure is the Credential Vault?",
    a: "Every secret is encrypted with AES-256-GCM using unique per-secret Data Encryption Keys wrapped by your master key. Decrypted keys exist only in memory during the execution lifecycle and are never logged.",
  },
  {
    q: "Can Nexora run fully on-premises without internet access?",
    a: "Yes. The Enterprise Sovereign tier provides official Kubernetes Helm charts and Docker bundles designed for air-gapped VPCs with zero outbound telemetry.",
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  return (
    <>
      <Navbar currentTab="Pricing" />

      <main className="w-full pt-20 bg-transparent relative min-h-screen">
        {/* HERO */}
        <section className="relative w-full overflow-hidden px-gutter-sm md:px-gutter lg:px-gutter-lg pt-space-xl pb-space-3xl">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary-container/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
          <div className="absolute top-[480px] right-10 w-[550px] h-[350px] bg-tertiary-container/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

          <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-space-xs px-space-md py-space-2xs rounded-full bg-surface-container-low shadow-sm mb-space-lg">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                Transparent Execution Pricing
              </span>
            </div>

            <h1 className="font-headline-xl text-headline-xl md:text-display text-on-surface max-w-4xl tracking-tight leading-[1.1] mb-space-md">
              Predictable costs for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                unlimited scale.
              </span>
            </h1>

            <p className="font-body-xl text-body-xl text-on-surface-variant max-w-3xl mb-space-xl">
              No surprise token overages or hidden concurrency taxes. Choose a plan that matches your operational requirements.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center p-1 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 mb-space-2xl">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`py-space-2xs px-space-md rounded-lg font-label-md text-label-md transition-all ${
                  billingCycle === "monthly"
                    ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`py-space-2xs px-space-md rounded-lg font-label-md text-label-md transition-all flex items-center gap-1 ${
                  billingCycle === "annual"
                    ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-800 font-semibold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* PRICING CARDS */}
        <section className="w-full py-space-2xl px-gutter-sm md:px-gutter lg:px-gutter-lg bg-surface-container-low/40">
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-space-lg items-stretch">
            {TIERS.map((tier) => {
              const displayPrice =
                tier.name === "Team Pro" && billingCycle === "annual" ? "$79" : tier.price;

              return (
                <div
                  key={tier.name}
                  className={`p-space-xl rounded-3xl flex flex-col justify-between transition-all ${
                    tier.highlight
                      ? "bg-surface-container-lowest shadow-2xl ring-2 ring-primary relative scale-[1.02]"
                      : "bg-surface-container-lowest shadow-sm border border-outline-variant/15 hover:shadow-md"
                  }`}
                >
                  {tier.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-space-md py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-semibold uppercase tracking-wider shadow-md">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-space-xs">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        {tier.name}
                      </h3>
                      <span className="font-label-sm text-label-sm px-space-xs py-space-2xs rounded-full bg-surface-container text-on-surface">
                        {tier.badge}
                      </span>
                    </div>

                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg">
                      {tier.description}
                    </p>

                    <div className="flex items-baseline gap-space-xs mb-space-lg">
                      <span className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
                        {displayPrice}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        /{tier.period}
                      </span>
                    </div>

                    <div className="space-y-space-sm mb-space-xl">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold block mb-space-xs">
                        Included Features:
                      </span>
                      {tier.features.map((feat) => (
                        <div key={feat} className="flex items-start gap-space-xs">
                          <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                            check_circle
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface">
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={tier.ctaLink}
                    className={`w-full py-space-sm px-space-md rounded-xl font-label-md text-label-md font-semibold text-center transition-all ${
                      tier.highlight
                        ? "bg-primary-container text-on-primary hover:bg-primary shadow-md hover:shadow-lg"
                        : "bg-surface-container-high text-on-surface hover:bg-surface-variant"
                    }`}
                  >
                    {tier.ctaText}
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="w-full py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg">
          <div className="max-w-[800px] mx-auto">
            <div className="text-center mb-space-2xl">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-2xs block">
                Common Questions
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs font-semibold">
                Frequently Asked Questions
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Everything you need to know about licensing, compute usage, and enterprise security.
              </p>
            </div>

            <div className="space-y-space-md">
              {FAQS.map((faq) => (
                <div
                  key={faq.q}
                  className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/15"
                >
                  <h4 className="font-headline-sm text-headline-sm text-[17px] text-on-surface font-semibold mb-space-xs">
                    {faq.q}
                  </h4>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="w-full py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg text-center bg-surface-container-lowest">
          <div className="max-w-2xl mx-auto">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-2xs block">
              Get Started Now
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-sm font-semibold">
              Ready to transform your operations?
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-space-xl">
              Build free in our developer sandbox with zero credit card required.
            </p>
            <Link
              href="/#build"
              className="inline-flex items-center justify-center gap-space-xs font-label-md text-label-md bg-primary-container text-on-primary px-space-xl py-space-sm rounded-lg shadow-md hover:bg-primary hover:shadow-lg transition-all"
            >
              <span>Start Building Free</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
