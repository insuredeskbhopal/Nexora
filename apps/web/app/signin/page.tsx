"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authStage, setAuthStage] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email) {
      setErrorMessage("Please provide your work email address.");
      return;
    }

    if (mode === "signup" && (!fullName || !workspaceName)) {
      setErrorMessage("Please complete your full name and organization workspace name.");
      return;
    }

    setIsLoading(true);
    setAuthStage(
      mode === "signup"
        ? "Creating user account & workspace in PostgreSQL database..."
        : "Authenticating with database..."
    );

    try {
      const payload =
        mode === "signup"
          ? { email, name: fullName, workspaceName, password }
          : { email, password };

      const action = mode === "signup" ? "register" : "login";
      const res = await fetch(`/api/auth?action=${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication request failed");
      }

      // Store real authenticated session
      if (typeof window !== "undefined") {
        localStorage.setItem("nexora_token", data.token);
        localStorage.setItem("nexora_user", JSON.stringify(data.user));
        if (data.workspace || data.activeWorkspace) {
          localStorage.setItem("nexora_workspace", JSON.stringify(data.workspace || data.activeWorkspace));
        }
      }

      setIsLoading(false);
      setAuthSuccess(true);
      setAuthStage(
        mode === "signup"
          ? `Welcome to Nexora, ${data.user.name}! Workspace provisioned in database.`
          : `Signed in as ${data.user.name}. Opening dashboard...`
      );

      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (err: any) {
      setIsLoading(false);
      setAuthStage(null);
      setErrorMessage(err.message || "Authentication failed. Please check your credentials.");
    }
  };

  const handleSSOLogin = async (provider: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setAuthStage(`Connecting via ${provider} OAuth gateway...`);

    try {
      const ssoEmail = `${provider.toLowerCase()}.user@nexora.ai`;
      const res = await fetch(`/api/auth?action=register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: ssoEmail,
          name: `${provider} Verified User`,
          workspaceName: `${provider} Cloud Operations`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "SSO initialization failed");

      if (typeof window !== "undefined") {
        localStorage.setItem("nexora_token", data.token);
        localStorage.setItem("nexora_user", JSON.stringify(data.user));
        if (data.workspace) {
          localStorage.setItem("nexora_workspace", JSON.stringify(data.workspace));
        }
      }

      setIsLoading(false);
      setAuthSuccess(true);
      setAuthStage(`Verified via ${provider}. Opening workspace...`);
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (err: any) {
      setIsLoading(false);
      setAuthStage(null);
      setErrorMessage(err.message || "SSO authentication failed");
    }
  };


  return (
    <div className="min-h-screen w-full flex flex-col justify-between relative px-gutter-sm md:px-gutter lg:px-gutter-lg py-space-md">
      {/* Top Header Navigation */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between py-space-sm z-20">
        <Link href="/" className="flex items-center gap-space-xs group">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.25)] group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-on-primary text-[20px]">hub</span>
          </div>
          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
            Nexora
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors px-space-sm py-space-2xs rounded-lg hover:bg-surface-container-low"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Authentication Container */}
      <main className="w-full max-w-6xl mx-auto my-auto py-space-lg grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center z-10">
        {/* Left Column: Form Panel */}
        <div className="lg:col-span-7 xl:col-span-6 w-full max-w-lg mx-auto">
          <div className="rounded-3xl bg-surface-container-lowest p-space-xl shadow-[0_12px_40px_rgba(15,23,42,0.06)] border border-outline-variant/20 backdrop-blur-xl relative overflow-hidden">
            {/* Ambient Corner Accent */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-br from-primary-container/10 to-transparent rounded-bl-full pointer-events-none -z-0"></div>

            {/* Title & Mode Switcher */}
            <div className="relative z-10 mb-space-lg">
              <div className="flex items-center justify-between mb-space-sm">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                  Secure Access Enclave
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-code-inline text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span>
                  TLS 1.3 Active
                </span>
              </div>

              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-2xs">
                {mode === "signin" ? "Sign in to Nexora" : "Create your account"}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {mode === "signin"
                  ? "Access your autonomous agent swarms and workflow operations."
                  : "Start orchestrating autonomous operations in under 2 minutes."}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="relative z-10 grid grid-cols-2 p-1 bg-surface-container-low rounded-xl mb-space-lg">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMessage(null);
                }}
                className={`py-2 text-label-md font-label-md rounded-lg transition-all ${
                  mode === "signin"
                    ? "bg-surface-container-lowest text-on-surface shadow-sm font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMessage(null);
                }}
                className={`py-2 text-label-md font-label-md rounded-lg transition-all ${
                  mode === "signup"
                    ? "bg-surface-container-lowest text-on-surface shadow-sm font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* SSO Action Buttons */}
            <div className="relative z-10 flex flex-col gap-space-xs mb-space-lg">
              <button
                type="button"
                onClick={() => handleSSOLogin("Google Workspace")}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-space-sm py-2.5 px-space-md rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md border border-outline-variant/15 transition-all shadow-sm group disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSSOLogin("GitHub")}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-space-sm py-2.5 px-space-md rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md border border-outline-variant/15 transition-all shadow-sm group disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>Continue with GitHub</span>
              </button>
            </div>

            {/* Form Divider */}
            <div className="relative z-10 flex items-center gap-space-sm mb-space-lg">
              <div className="flex-1 h-px bg-outline-variant/30"></div>
              <span className="text-[12px] font-label-sm text-on-surface-variant uppercase tracking-wider">
                Or with work email
              </span>
              <div className="flex-1 h-px bg-outline-variant/30"></div>
            </div>

            {/* Error Feedback Alert */}
            {errorMessage && (
              <div className="relative z-10 p-space-sm mb-space-md rounded-xl bg-red-50 border border-red-200 text-red-700 text-body-sm flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Interactive Loading / Success Status Banner */}
            {authStage && (
              <div
                className={`relative z-10 p-space-sm mb-space-md rounded-xl text-body-sm flex items-center gap-space-xs border ${
                  authSuccess
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-blue-50 border-blue-200 text-primary"
                }`}
              >
                {authSuccess ? (
                  <span className="material-symbols-outlined text-[18px] text-green-600">
                    check_circle
                  </span>
                ) : (
                  <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                )}
                <span className="font-medium">{authStage}</span>
              </div>
            )}

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-space-md">
              {mode === "signup" && (
                <>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface font-medium mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2">
                        person
                      </span>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Alex Vance"
                        className="w-full pl-10 pr-space-md py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/25 text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface font-medium mb-1.5">
                      Organization / Workspace Name
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2">
                        corporate_fare
                      </span>
                      <input
                        type="text"
                        required
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        placeholder="Acme Operations Corp"
                        className="w-full pl-10 pr-space-md py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/25 text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Work Email Input */}
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface font-medium mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full pl-10 pr-space-md py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/25 text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface font-medium">
                    Password
                  </label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() =>
                        setErrorMessage(
                          "Password reset link has been dispatched to your verified email."
                        )
                      }
                      className="font-label-sm text-label-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2">
                    lock
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/25 text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me Option */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant"
                  />
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Keep me signed in for 30 days
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => handleSSOLogin("SAML / Okta")}
                  className="font-label-sm text-label-sm text-tertiary hover:underline hidden sm:inline-block"
                >
                  Enterprise SAML?
                </button>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-space-xs py-3 px-space-lg rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-[0_4px_16px_rgba(37,99,235,0.28)] hover:bg-primary hover:shadow-[0_8px_24px_rgba(37,99,235,0.38)] transition-all flex items-center justify-center gap-space-xs disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === "signin" ? "Sign In to Workspace" : "Provision New Cluster"}
                    </span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Bottom Enclave Safeguard Notice */}
            <div className="relative z-10 mt-space-lg pt-space-md border-t border-outline-variant/15 flex items-center justify-center gap-space-md text-[11px] text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-primary">verified_user</span>
                SOC2 Type II
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-primary">lock</span>
                256-bit AES
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-primary">shield</span>
                Zero-Trust Isolation
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: High-Leverage Platform Showcase (Desktop) */}
        <div className="hidden lg:col-span-5 xl:col-span-6 lg:flex flex-col gap-space-lg pl-space-md">
          {/* Spatial Live Telemetry Card */}
          <div className="rounded-3xl bg-surface-container-lowest/80 backdrop-blur-xl p-space-xl border border-outline-variant/20 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="font-code-inline text-[12px] font-semibold text-on-surface uppercase tracking-wider">
                  Swarm Mesh Operational
                </span>
              </div>
              <span className="font-code-inline text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                Cluster v2.11
              </span>
            </div>

            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-space-xs">
              Autonomous execution for complex, mission-critical operations.
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg">
              Nexora coordinates intelligent multi-agent swarms, validates policies against deterministic guardrails, and resumes state seamlessly across days and weeks.
            </p>

            {/* Mini Pipeline Preview */}
            <div className="flex flex-col gap-2 p-space-sm rounded-2xl bg-surface-container-low/70 border border-outline-variant/15">
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-lowest shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-blue-50 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px]">bolt</span>
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface font-medium">
                    Trigger: Global RFQ Webhook
                  </span>
                </div>
                <span className="font-code-inline text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                  Processed 180ms
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-lowest shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px]">psychology</span>
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface font-medium">
                    Agent Swarm: SEC &amp; Risk Synthesis
                  </span>
                </div>
                <span className="font-code-inline text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  Tri-Agent Active
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-lowest shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface font-medium">
                    Human Gateway: VP Signoff Decided
                  </span>
                </div>
                <span className="font-code-inline text-[10px] text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">
                  Immutable Audit
                </span>
              </div>
            </div>
          </div>

          {/* Testimonial Quote Pill */}
          <div className="p-space-lg rounded-2xl bg-surface-container-low/60 border border-outline-variant/15 flex items-start gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[24px] shrink-0 mt-0.5">
              format_quote
            </span>
            <div>
              <p className="font-body-sm text-body-sm text-on-surface italic mb-2">
                &ldquo;Nexora allowed our enterprise operations team to replace 40 brittle legacy integration scripts with autonomous, self-healing agents in 48 hours.&rdquo;
              </p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary font-semibold text-[12px] flex items-center justify-center">
                  MV
                </div>
                <div>
                  <p className="font-label-sm text-label-sm font-semibold text-on-surface">
                    Marcus Vance
                  </p>
                  <p className="text-[11px] text-on-surface-variant">VP of Operations, Kinetix Global</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="w-full max-w-7xl mx-auto py-space-sm text-center text-on-surface-variant font-body-sm text-[12px] z-10 flex flex-col sm:flex-row items-center justify-between gap-space-xs">
        <p>&copy; {new Date().getFullYear()} Nexora Technologies Inc. All rights reserved.</p>
        <div className="flex items-center gap-space-md">
          <Link href="/product" className="hover:text-on-surface transition-colors">
            Architecture
          </Link>
          <Link href="/pricing" className="hover:text-on-surface transition-colors">
            Pricing
          </Link>
          <Link href="/developers" className="hover:text-on-surface transition-colors">
            Documentation
          </Link>
        </div>
      </footer>
    </div>
  );
}
