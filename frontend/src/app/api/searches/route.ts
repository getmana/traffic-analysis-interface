import { NextResponse } from "next/server";

import { authenticatedJsonProxy } from "@/lib/backend";
import { IDEMPOTENCY_KEY_HEADER } from "@/constants";
import type { BackendFilterNode } from "@/types";

type CreateSearchBody = {
  sensorIds: string[];
  from: string;
  to: string;
  filter: BackendFilterNode;
};

function isCreateSearchBody(value: unknown): value is CreateSearchBody {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return (
    Array.isArray(body.sensorIds) &&
    body.sensorIds.length > 0 &&
    body.sensorIds.every((id) => typeof id === "string") &&
    typeof body.from === "string" &&
    typeof body.to === "string" &&
    !!body.filter &&
    typeof body.filter === "object"
  );
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!isCreateSearchBody(body)) {
    return NextResponse.json(
      {
        ok: false,
        error: "invalid_request",
        message: "Select at least one capture point, a time window, and a condition.",
      },
      { status: 400 },
    );
  }

  const idempotencyKey = request.headers.get(IDEMPOTENCY_KEY_HEADER);

  return authenticatedJsonProxy("/v1/searches", {
    method: "POST",
    body: JSON.stringify({
      sensor_ids: body.sensorIds,
      from: body.from,
      to: body.to,
      filter: body.filter,
    }),
    headers: idempotencyKey ? { [IDEMPOTENCY_KEY_HEADER]: idempotencyKey } : undefined,
  });
}
