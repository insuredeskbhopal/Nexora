import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getAuthHeaders(request: Request) {
  const authHeader = request.headers.get("authorization");
  const userId = request.headers.get("x-user-id");
  const userEmail = request.headers.get("x-user-email");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authHeader) {
    headers["Authorization"] = authHeader;
  }
  if (userId) {
    headers["x-user-id"] = userId;
  }
  if (userEmail) {
    headers["x-user-email"] = userEmail;
  }

  return headers;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedWorkspaceId = searchParams.get("workspaceId");
    const headers = getAuthHeaders(request);

    // 1. Fetch available workspaces for user
    const wsRes = await fetch(`${API_BASE}/v1/workspaces`, {
      headers,
      cache: "no-store",
    });

    if (!wsRes.ok) {
      throw new Error(`Failed to fetch workspaces: ${wsRes.statusText}`);
    }

    const wsData = await wsRes.json();
    const workspaces = wsData.workspaces || [];

    // Select target workspace: either requested, or first available, or fallback
    const activeWorkspace =
      workspaces.find((w: any) => w.id === requestedWorkspaceId) ||
      workspaces[0] ||
      null;

    if (!activeWorkspace) {
      return NextResponse.json({
        workspaces: [],
        activeWorkspace: null,
        automations: [],
        runs: [],
        approvals: [],
        connectors: [],
        auditLogs: [],
        telemetry: {
          totalExecutions: 0,
          successRate: 100,
          pendingApprovals: 0,
          activeAgents: 4,
        },
      });
    }

    const workspaceId = activeWorkspace.id;

    // 2. Fetch live data concurrently from API
    const [autoRes, runsRes, connRes, auditRes] = await Promise.allSettled([
      fetch(`${API_BASE}/v1/workspaces/${workspaceId}/automations`, {
        headers,
        cache: "no-store",
      }).then((r) => (r.ok ? r.json() : { automations: [] })),

      fetch(`${API_BASE}/v1/workspaces/${workspaceId}/runs`, {
        headers,
        cache: "no-store",
      }).then((r) => (r.ok ? r.json() : { runs: [] })),

      fetch(`${API_BASE}/v1/workspaces/${workspaceId}/connectors`, {
        headers,
        cache: "no-store",
      }).then((r) => (r.ok ? r.json() : { connectors: [] })),

      fetch(`${API_BASE}/v1/workspaces/${workspaceId}/audit-logs`, {
        headers,
        cache: "no-store",
      }).then((r) => (r.ok ? r.json() : { auditLogs: [] })),
    ]);

    const automations = autoRes.status === "fulfilled" ? autoRes.value.automations || [] : [];
    const runs = runsRes.status === "fulfilled" ? runsRes.value.runs || [] : [];
    const connectors = connRes.status === "fulfilled" ? connRes.value.connectors || [] : [];
    const auditLogs = auditRes.status === "fulfilled" ? auditRes.value.auditLogs || [] : [];

    // 3. For each run, fetch approvals if any exist
    let approvals: any[] = [];
    if (runs.length > 0) {
      const detailsList = await Promise.allSettled(
        runs.slice(0, 5).map((r: any) =>
          fetch(`${API_BASE}/v1/workspaces/${workspaceId}/runs/${r.id}`, {
            headers,
            cache: "no-store",
          }).then((res) => (res.ok ? res.json() : null))
        )
      );

      for (const item of detailsList) {
        if (item.status === "fulfilled" && item.value?.run?.approvals) {
          for (const appr of item.value.run.approvals) {
            approvals.push({
              id: appr.id,
              runId: item.value.run.id,
              automationName: item.value.run.automationName,
              title: appr.title,
              description:
                appr.contextData?.variablesSnapshot?.vendor
                  ? `Vendor: ${appr.contextData.variablesSnapshot.vendor} ($${appr.contextData.variablesSnapshot.amount}). Requires approval before issuing order.`
                  : "Zero-trust verification required before continuing execution.",
              urgency: appr.riskLevel || "HIGH",
              requestedAt: item.value.run.createdAt,
              approverRole: "APPROVER / Team Lead",
              payloadSummary: appr.contextData?.variablesSnapshot || {
                runId: item.value.run.id,
                status: appr.status,
              },
              status: appr.status,
            });
          }
        }
      }
    }

    // Compute live telemetry
    const totalRunsCount = runs.length;
    const completedRunsCount = runs.filter((r: any) => r.status === "COMPLETED").length;
    const successRate =
      totalRunsCount > 0
        ? Math.round((completedRunsCount / totalRunsCount) * 1000) / 10
        : 100.0;
    const pendingApprovalsCount = approvals.filter((a: any) => a.status === "PENDING").length;

    return NextResponse.json({
      workspaces,
      activeWorkspace,
      automations,
      runs,
      approvals,
      connectors,
      auditLogs,
      telemetry: {
        totalExecutions: totalRunsCount,
        successRate,
        pendingApprovals: pendingApprovalsCount,
        activeAgents: 4,
      },
    });
  } catch (error: any) {
    console.error("[Dashboard API Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
