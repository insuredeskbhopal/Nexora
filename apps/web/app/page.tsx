"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
} from "@agentic/ui";
import { api } from "../lib/api/client";

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const res = await api.getHealth();
      setApiStatus(
        `API ${res.service} is operational (uptime: ${res.uptime}s)`,
      );
    } catch (err) {
      setApiStatus(`API unreachable or error: ${(err as Error).message}`);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="success">Phase 0 Initialized</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Agentic Platform
          </h1>
          <p className="text-lg text-zinc-400">
            Platform foundation initialized successfully.
          </p>
        </div>

        <Card className="border-zinc-800/80 bg-zinc-900/60 shadow-2xl backdrop-blur-md">
          <CardHeader>
            <CardTitle>Technical Foundation Status</CardTitle>
            <CardDescription>
              Core platform boundaries, workspaces, and infrastructure
              components.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-xs text-zinc-500 block">Workspace</span>
                <span className="text-sm font-semibold text-zinc-200">
                  pnpm + Turbo
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-xs text-zinc-500 block">API Engine</span>
                <span className="text-sm font-semibold text-zinc-200">
                  Fastify ESM
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-xs text-zinc-500 block">
                  Workflow Engine
                </span>
                <span className="text-sm font-semibold text-zinc-200">
                  Temporal (Local)
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-xs text-zinc-500 block">Database</span>
                <span className="text-sm font-semibold text-zinc-200">
                  PostgreSQL + Prisma
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-xs text-zinc-500 block">
                  Cache / Coord
                </span>
                <span className="text-sm font-semibold text-zinc-200">
                  Redis 7
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-xs text-zinc-500 block">
                  Object Storage
                </span>
                <span className="text-sm font-semibold text-zinc-200">
                  MinIO (S3)
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button
                variant="primary"
                size="sm"
                onClick={checkHealth}
                isLoading={isChecking}
                aria-label="Check API connectivity"
              >
                Probe API Health
              </Button>
              {apiStatus && (
                <span className="text-xs text-zinc-300 font-mono bg-zinc-950 px-3 py-1.5 rounded border border-zinc-800">
                  {apiStatus}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
