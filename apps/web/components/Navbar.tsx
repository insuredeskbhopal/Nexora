"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  currentTab?: string;
}

const NAV_ITEMS = [
  { label: "Product", href: "/product" },
  { label: "Agents", href: "/agents" },
  { label: "Integrations", href: "/integrations" },
  { label: "Solutions", href: "/solutions" },
  { label: "Developers", href: "/developers" },
  { label: "Pricing", href: "/pricing" },
];

export function Navbar({ currentTab }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string, label: string) => {
    if (currentTab) {
      return currentTab.toLowerCase() === label.toLowerCase();
    }
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="h-20 max-w-[1280px] mx-auto px-gutter-sm md:px-gutter lg:px-gutter-lg flex items-center justify-between">
        <div className="w-full flex items-center justify-between px-space-md py-space-xs rounded-full bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_2px_12px_rgba(13,15,18,0.04)] ring-1 ring-outline-variant/30">
          {/* Brand Logo */}
          <div className="flex items-center gap-space-sm">
            <Link className="flex items-center gap-space-xs group" href="/">
              <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.2)] group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-on-primary text-[20px]">hub</span>
              </div>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
                Nexora
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-space-lg">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href, item.label);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`transition-all duration-200 font-label-md text-label-md relative py-1 ${
                    active
                      ? "text-primary font-semibold"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-space-md">
            <Link
              className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors px-space-xs py-space-2xs hidden sm:inline-block"
              href="/#build"
            >
              Sign in
            </Link>
            <Link
              className="inline-flex items-center justify-center gap-1 font-label-md text-label-md bg-primary-container text-on-primary px-space-md py-space-xs rounded-lg shadow-[0_4px_16px_rgba(37,99,235,0.22)] hover:bg-primary hover:shadow-[0_8px_24px_rgba(37,99,235,0.35)] transition-all"
              href="/#build"
            >
              <span>Start Building</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
            
            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1 text-on-surface-variant hover:text-on-surface"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden max-w-[1280px] mx-auto px-gutter-sm mt-2">
          <div className="rounded-2xl bg-surface-container-lowest/95 backdrop-blur-2xl p-space-md shadow-2xl ring-1 ring-outline-variant/30 flex flex-col gap-space-sm animate-fade-in">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href, item.label);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-space-xs rounded-lg font-label-md text-label-md transition-colors ${
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-space-xs border-t border-outline-variant/20 flex flex-col gap-space-xs">
              <Link
                href="/#build"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-space-xs rounded-lg bg-primary-container text-on-primary font-label-md text-label-md"
              >
                Start Building Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
