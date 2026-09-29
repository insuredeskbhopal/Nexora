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
    const { workspaceId, runId, decision, comments = "" } = body;

    if (!workspaceId || !runId || !decision) {
      return NextResponse.json(
        { error: "workspaceId, runId, and decision (APPROVED/REJECTED) are required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${API_BASE}/v1/workspaces/${workspaceId}/runs/${runId}/signals/approve`, {
      method: "POST",
      headers: getAuthHeaders(request),
      body: JSON.stringify({
        decision,
        comments: comments || `Operator decision submitted via console: ${decision}`,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Failed to submit approval signal" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
