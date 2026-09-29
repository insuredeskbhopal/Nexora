import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getAuthHeaders(request: Request) {
  const authHeader = request.headers.get("authorization");
  const userId = request.headers.get("x-user-id");
  const userEmail = request.headers.get("x-user-email");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authHeader) headers["Authorization"] = authHeader;
  if (userId) headers["x-user-id"] = userId;
  if (userEmail) headers["x-user-email"] = userEmail;

  return headers;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId, automationId, triggerType = "MANUAL", triggerPayload = {} } = body;

    if (!workspaceId || !automationId) {
      return NextResponse.json(
        { error: "workspaceId and automationId are required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${API_BASE}/v1/workspaces/${workspaceId}/automations/${automationId}/runs`, {
      method: "POST",
      headers: getAuthHeaders(request),
      body: JSON.stringify({
        triggerType,
        triggerPayload,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.error?.message || "Failed to trigger run" }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const runId = searchParams.get("runId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    const url = runId
      ? `${API_BASE}/v1/workspaces/${workspaceId}/runs/${runId}`
      : `${API_BASE}/v1/workspaces/${workspaceId}/runs`;

    const res = await fetch(url, {
      headers: getAuthHeaders(request),
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.error?.message || "Failed to fetch runs" }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
