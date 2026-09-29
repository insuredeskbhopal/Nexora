"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";

const CONNECTORS = [
  { name: "Google Workspace", category: "Communication", icon: "mail", auth: "OAuth2", actions: 48, desc: "Send Gmail messages, manage calendar invites, append Sheets rows, and upload Drive files." },
  { name: "Slack", category: "Communication", icon: "forum", auth: "OAuth2 / Bot Token", actions: 34, desc: "Interactive Block Kit notifications, human signoff buttons, and channel notifications." },
  { name: "Salesforce", category: "CRM", icon: "cloud", auth: "OAuth2 PKCE", actions: 62, desc: "Query SOQL, enrich contacts, advance pipeline stages, and stream platform change events." },
  { name: "PostgreSQL", category: "Databases", icon: "database", auth: "Connection String / TLS", actions: 12, desc: "Direct pooled connection driver with parameterized queries and strict read-only modes." },
  { name: "HubSpot", category: "CRM", icon: "contact_page", auth: "Private App / OAuth2", actions: 40, desc: "Bi-directional contact syncing, deal pipeline automations, and tracking webhooks." },
  { name: "WhatsApp Cloud", category: "Communication", icon: "send_to_mobile", auth: "Meta Bearer Token", actions: 18, desc: "Send verified business messages, interactive template buttons, and calendar links." },
  { name: "GitHub", category: "DevOps", icon: "code", auth: "GitHub App / PAT", actions: 55, desc: "Create pull requests, trigger GitHub Actions workflows, and triage open repository issues." },
  { name: "Stripe", category: "Payments", icon: "payments", auth: "Restricted API Key", actions: 36, desc: "Process pre-authorized payment holds, generate invoices, and handle dispute webhooks." },
  { name: "AWS Services", category: "Cloud", icon: "cloud_done", auth: "IAM Role / STS", actions: 84, desc: "S3 encrypted file storage, SQS queues, SES transactional emails, and Lambda invocations." },
  { name: "MongoDB", category: "Databases", icon: "dataset", auth: "SCRAM / TLS", actions: 16, desc: "Document aggregation pipelines, transactional mutations, and Change Stream listeners." },
  { name: "Microsoft 365", category: "Communication", icon: "folder_shared", auth: "Graph API / Azure AD", actions: 50, desc: "Teams messaging, SharePoint file management, Outlook calendar, and Excel spreadsheets." },
  { name: "OpenAPI Generator", category: "Custom", icon: "build_circle", auth: "Dynamic / Custom", actions: 999, desc: "Upload any Swagger or OpenAPI 3.0 specification to generate a typed connector instantly." },
];

const CATEGORIES = ["All", "Communication", "CRM", "Databases", "DevOps", "Payments", "Cloud", "Custom"];

export default function IntegrationsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openApiUrl, setOpenApiUrl] = useState("https://api.github.com/openapi.json");
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);

  const filteredConnectors = CONNECTORS.filter((c) => {
    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleGenerateConnector = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratedResult("Parsing OpenAPI 3.0 spec... Extracted 42 endpoints! Generated Connector: @agentic/connector-custom-api");
  };

  return (
    <>
      <Navbar currentTab="Integrations" />

      <main className="w-full pt-20 bg-surface relative min-h-screen">
        {/* HERO */}
        <section className="relative w-full overflow-hidden px-gutter-sm md:px-gutter lg:px-gutter-lg pt-space-xl pb-space-3xl">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary-container/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
          <div className="absolute top-[480px] right-10 w-[550px] h-[350px] bg-tertiary-container/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

          <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-space-xs px-space-md py-space-2xs rounded-full bg-surface-container-low shadow-sm mb-space-lg">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                Unified Integration Ecosystem
              </span>
            </div>

            <h1 className="font-headline-xl text-headline-xl md:text-display text-on-surface max-w-4xl tracking-tight leading-[1.1] mb-space-md">
              Connect every tool.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                Secure every secret.
              </span>
            </h1>

            <p className="font-body-xl text-body-xl text-on-surface-variant max-w-3xl mb-space-xl">
              From enterprise databases and CRMs to internal microservices and custom APIs. All secured with hardware-level AES-256 envelope encryption.
            </p>

            {/* Search Input Bar */}
            <div className="w-full max-w-xl p-space-2xs rounded-xl bg-surface-container-lowest shadow-lg ring-1 ring-outline-variant/30 flex items-center gap-space-xs px-space-md py-space-xs mb-space-xl">
              <span className="material-symbols-outlined text-primary text-[22px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by tool name (Slack, Salesforce, Postgres, AWS...)"
                className="bg-transparent border-0 outline-none w-full font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:ring-0"
              />
            </div>
          </div>
        </section>

        {/* CONNECTOR DIRECTORY */}
        <section className="w-full py-space-2xl px-gutter-sm md:px-gutter lg:px-gutter-lg bg-surface-container-low/40">
          <div className="max-w-[1280px] mx-auto">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-space-xs mb-space-2xl">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-space-md py-space-2xs rounded-full font-label-md text-label-md transition-all ${
                    selectedCategory === cat
                      ? "bg-primary-container text-on-primary font-semibold shadow-md"
                      : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container hover:text-on-surface shadow-sm"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid of Connectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
              {filteredConnectors.map((c) => (
                <div
                  key={c.name}
                  className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-lg transition-all flex flex-col justify-between border border-outline-variant/15 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-space-sm">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-low group-hover:bg-primary/10 flex items-center justify-center text-primary transition-colors">
                        <span className="material-symbols-outlined text-[26px]">{c.icon}</span>
                      </div>
                      <span className="px-space-xs py-space-2xs rounded-full bg-surface-container text-on-surface font-code-inline text-[11px]">
                        {c.actions} Actions
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-space-2xs">
                      {c.name}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                      {c.desc}
                    </p>
                  </div>

                  <div className="pt-space-sm border-t border-outline-variant/15 flex items-center justify-between">
                    <span className="font-code-inline text-[11px] text-on-surface-variant">
                      Auth: {c.auth}
                    </span>
                    <span className="font-label-sm text-label-sm text-primary font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                      <span>Connect</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ENVELOPE ENCRYPTION CREDENTIAL VAULT */}
        <section className="w-full py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg">
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
            <div className="lg:col-span-6">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-2xs block">
                Hardware-Grade Vault
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs font-semibold">
                Envelope encryption for every API credential.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-space-lg">
                Nexora uses a two-tier envelope encryption architecture. Secrets are encrypted using unique 256-bit Data Encryption Keys (DEKs) wrapped by your organization&apos;s master key. Plaintext credentials are never written to disk or shown in logs.
              </p>
              <div className="space-y-space-sm">
                <div className="flex items-start gap-space-sm">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-primary text-[16px]">lock</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface">
                    <span className="font-semibold">Zero-knowledge memory hygiene:</span> Decrypted credentials exist solely in short-lived memory during action dispatch and are immediately purged.
                  </p>
                </div>
                <div className="flex items-start gap-space-sm">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-primary text-[16px]">autorenew</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface">
                    <span className="font-semibold">Proactive OAuth rotation:</span> Background workers refresh tokens before expiration without pausing or disrupting active pipelines.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 p-space-xl rounded-2xl bg-surface-container-lowest shadow-xl border border-outline-variant/15">
              <div className="flex items-center justify-between pb-space-md mb-space-md border-b border-outline-variant/15">
                <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  Credential Vault Security Matrix
                </span>
                <span className="font-code-inline text-[11px] text-primary">AES-256-GCM Verified</span>
              </div>
              <div className="space-y-space-sm">
                <div className="p-space-sm rounded-lg bg-surface flex items-center justify-between">
                  <span className="font-body-sm text-body-sm text-on-surface">Master Key Provider</span>
                  <span className="font-code-inline text-code-inline text-primary">AWS KMS / HashiCorp Vault</span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface flex items-center justify-between">
                  <span className="font-body-sm text-body-sm text-on-surface">Initialization Vector (IV)</span>
                  <span className="font-code-inline text-code-inline text-on-surface-variant">96-bit Cryptographic Nonce</span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface flex items-center justify-between">
                  <span className="font-body-sm text-body-sm text-on-surface">Authentication Tag</span>
                  <span className="font-code-inline text-code-inline text-on-surface-variant">128-bit Integrity Tag (GCM)</span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface flex items-center justify-between">
                  <span className="font-body-sm text-body-sm text-on-surface">Secret Masking Filter</span>
                  <span className="font-code-inline text-code-inline text-green-700 font-semibold">Active (e.g. sk_live_...98a2)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OPENAPI GENERATOR DEMO */}
        <section className="w-full py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg bg-surface-container-low/40">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-space-2xl">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-2xs block">
                Zero Custom Code
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs font-semibold">
                Generate a connector from any OpenAPI specification.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Got an internal ERP or proprietary microservice? Paste the Swagger/OpenAPI URL and Nexora generates typed actions, triggers, and validation schemas automatically.
              </p>
            </div>

            <div className="max-w-3xl mx-auto p-space-xl rounded-2xl bg-surface-container-lowest shadow-xl border border-outline-variant/15">
              <form onSubmit={handleGenerateConnector} className="space-y-space-md">
                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-space-2xs">
                    OpenAPI 3.0 / Swagger JSON URL:
                  </label>
                  <input
                    type="url"
                    value={openApiUrl}
                    onChange={(e) => setOpenApiUrl(e.target.value)}
                    required
                    className="w-full p-space-sm rounded-lg bg-surface border border-outline-variant/30 text-on-surface font-code-inline text-code-inline outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-space-sm px-space-lg rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-primary transition-all flex items-center justify-center gap-space-xs shadow-md"
                >
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  <span>Synthesize Typed Connector</span>
                </button>
              </form>

              {generatedResult && (
                <div className="mt-space-md p-space-md rounded-xl bg-primary/10 text-primary font-code-inline text-code-inline">
                  {generatedResult}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="w-full py-space-3xl px-gutter-sm md:px-gutter lg:px-gutter-lg text-center bg-surface-container-lowest">
          <div className="max-w-2xl mx-auto">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold mb-space-2xs block">
              Ecosystem Ready
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-sm font-semibold">
              Connect your enterprise systems now.
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-space-xl">
              No custom integration code. No fragile maintenance. Connect once and let autonomous swarms execute.
            </p>
            <Link
              href="/#build"
              className="inline-flex items-center justify-center gap-space-xs font-label-md text-label-md bg-primary-container text-on-primary px-space-xl py-space-sm rounded-lg shadow-md hover:bg-primary hover:shadow-lg transition-all"
            >
              <span>Explore All Connectors</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
