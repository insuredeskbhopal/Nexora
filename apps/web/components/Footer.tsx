import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-surface-container-low/70 py-space-2xl border-t border-outline-variant/15">
      <div className="max-w-[1280px] mx-auto px-gutter-sm md:px-gutter lg:px-gutter-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-space-lg mb-space-xl">
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 pr-space-md">
            <Link className="flex items-center gap-space-xs mb-space-sm group inline-flex" href="/">
              <div className="w-7 h-7 rounded-lg bg-primary-container flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-on-primary text-[16px]">hub</span>
              </div>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Nexora
              </span>
            </Link>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs mb-space-md">
              Autonomous operational infrastructure engineered for high-leverage agentic intelligence.
            </p>
            <div className="flex items-center gap-space-xs text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="font-code-inline text-[11px]">All Systems Operational</span>
            </div>
          </div>

          {/* Product */}
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold mb-space-2xs">
              Product
            </span>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/product">
              Architecture
            </Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/product#engine">
              Durable Execution
            </Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/product#risk">
              Risk &amp; Verification
            </Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/product#state">
              State Machines
            </Link>
          </div>

          {/* Agents */}
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold mb-space-2xs">
              Agents
            </span>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/agents">
              Swarm Topology
            </Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/agents#roles">
              Specialized Roles
            </Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/agents#protocol">
              Communication Protocol
            </Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/agents#memory">
              Persistent Memory
            </Link>
          </div>

          {/* Integrations */}
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold mb-space-2xs">
              Integrations
            </span>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/integrations">
              200+ Connectors
            </Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/integrations#vault">
              OAuth2 Vault
            </Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/integrations#openapi">
              OpenAPI Generator
            </Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/integrations#webhooks">
              Webhooks
            </Link>
          </div>

          {/* Solutions */}
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold mb-space-2xs">
              Solutions
            </span>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/solutions">
              Enterprise Overview
            </Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/solutions#procurement">
              Global Procurement
            </Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/solutions#finance">
              Finance &amp; Audit
            </Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/solutions#devops">
              DevOps Incidents
            </Link>
          </div>

          {/* Developers & Pricing */}
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold mb-space-2xs">
              Developers
            </span>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/developers">
              API Documentation
            </Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/developers#sdk">
              TypeScript SDK
            </Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/developers#cli">
              CLI Tool
            </Link>
            <Link className="font-body-sm text-body-sm text-primary font-medium hover:underline transition-colors mt-space-2xs" href="/pricing">
              View Pricing →
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-space-md border-t border-outline-variant/15 flex flex-col md:flex-row items-center justify-between gap-space-sm">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            &copy; {new Date().getFullYear()} Nexora Systems Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-space-md font-label-sm text-label-sm text-on-surface-variant">
            <span className="hover:text-on-surface cursor-pointer transition-colors">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-on-surface cursor-pointer transition-colors">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-on-surface cursor-pointer transition-colors">SOC2 Security</span>
            <span>•</span>
            <span className="hover:text-on-surface cursor-pointer transition-colors">Trust Center</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
