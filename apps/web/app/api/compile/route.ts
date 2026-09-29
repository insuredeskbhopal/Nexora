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
    const { prompt, workspaceId } = body;

    if (!prompt || !workspaceId) {
      return NextResponse.json(
        { error: "prompt and workspaceId are required" },
        { status: 400 }
      );
    }

    const headers = getAuthHeaders(request);

    // 1. Synthesize name and workflow structure from prompt
    const cleanedPrompt = prompt.trim();
    const name = cleanedPrompt.length > 45 
      ? cleanedPrompt.substring(0, 42) + "..." 
      : cleanedPrompt;

    const lower = cleanedPrompt.toLowerCase();
    const hasApproval = lower.includes("approval") || lower.includes("approve") || lower.includes("manager") || lower.includes("review") || lower.includes("risk");
    const hasSlack = lower.includes("slack") || lower.includes("notify") || lower.includes("alert");
    const hasAgent = lower.includes("agent") || lower.includes("ai") || lower.includes("llm") || lower.includes("extract");

    // Build valid WorkflowDefinition AST nodes
    const triggerId = "trigger_inbound";
    const nodes: any[] = [];
    const edges: any[] = [];

    // Step 1: Ingest / Extract Node
    const step1Id = "node_extract";
    nodes.push({
      id: step1Id,
      name: hasAgent ? "AI Intent & Context Extractor" : "Ingest & Validate Payload",
      category: hasAgent ? "AGENT" : "ACTION",
      config: {
        operation: hasAgent ? "agent.prompt" : "data.transform",
        prompt: `Extract structured parameters from: ${cleanedPrompt}`,
      },
    });
    edges.push({
      id: "edge_trigger_step1",
      sourceNodeId: triggerId,
      targetNodeId: step1Id,
    });

    let previousNodeId = step1Id;

    // Step 2: Human in the loop approval if requested or high stakes
    if (hasApproval) {
      const stepApprovalId = "node_gate_approval";
      nodes.push({
        id: stepApprovalId,
        name: "Security & Governance Sign-off",
        category: "APPROVAL",
        config: {
          riskLevel: "HIGH",
          title: `Operator Approval for: ${name}`,
          timeoutSeconds: 86400,
        },
      });
      edges.push({
        id: `edge_${previousNodeId}_${stepApprovalId}`,
        sourceNodeId: previousNodeId,
        targetNodeId: stepApprovalId,
      });
      previousNodeId = stepApprovalId;
    }

    // Step 3: Notification or Final Dispatch
    const finalStepId = "node_dispatch_outcome";
    nodes.push({
      id: finalStepId,
      name: hasSlack ? "Dispatch Slack Channel Notification" : "Finalize & Sync Target System",
      category: "ACTION",
      config: {
        operation: hasSlack ? "slack.chat.postMessage" : "system.sync",
        channel: "#automation-ops",
      },
    });
    edges.push({
      id: `edge_${previousNodeId}_${finalStepId}`,
      sourceNodeId: previousNodeId,
      targetNodeId: finalStepId,
    });

    const workflowAST = {
      schemaVersion: "1.0.0",
      name,
      description: `Compiled from prompt: "${cleanedPrompt}"`,
      triggers: [
        {
          id: triggerId,
          name: "Inbound Event Trigger",
          category: "TRIGGER",
          config: { type: "webhook", eventType: "custom.intent" },
        },
      ],
      nodes,
      edges,
      variables: {},
      limits: {
        maxExecutionTimeMs: 86400000,
        maxSteps: 50,
        maxCostUsd: 15.0,
      },
    };

    // 2. Create Automation via Backend API
    const createRes = await fetch(`${API_BASE}/v1/workspaces/${workspaceId}/automations`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name,
        description: workflowAST.description,
      }),
    });

    const createData = await createRes.json();
    if (!createRes.ok) {
      return NextResponse.json(
        { error: createData.error?.message || "Failed to create automation container" },
        { status: createRes.status }
      );
    }

    const automationId = createData.automation.id;

    // 3. Put Definition AST
    const defRes = await fetch(`${API_BASE}/v1/workspaces/${workspaceId}/automations/${automationId}/definition`, {
      method: "PUT",
      headers,
      body: JSON.stringify(workflowAST),
    });

    const defData = await defRes.json();
    if (!defRes.ok) {
      return NextResponse.json(
        { error: defData.error?.message || "Failed to compile workflow AST" },
        { status: defRes.status }
      );
    }

    // 4. Publish Version to make it ACTIVE immediately
    const pubRes = await fetch(`${API_BASE}/v1/workspaces/${workspaceId}/automations/${automationId}/publish`, {
      method: "POST",
      headers,
    });

    const pubData = await pubRes.json();
    const finalAutomation = pubRes.ok ? pubData.automation : createData.automation;

    return NextResponse.json({
      success: true,
      automation: finalAutomation,
      ast: workflowAST,
      validation: defData.version?.validation,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
