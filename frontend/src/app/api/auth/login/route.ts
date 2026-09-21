import { NextResponse } from "next/server";

import { applyTokenPair, backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { parseBackendError, parseRetryAfterSeconds } from "@/utils";
import { type BackendTokenPair } from "@/types";

export type LoginErrorResponse = {
  ok: false;
  error:
    | "invalid_request"
    | "invalid_credentials"
    | "rate_limited"
    | "backend_unavailable"
    | "unexpected_error";
  message: string;
  retryAfterSeconds?: number;
};

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (
    !body ||
    typeof body !== "object" ||
    typeof (body as { email?: unknown }).email !== "string" ||
    typeof (body as { password?: unknown }).password !== "string"
  ) {
    return NextResponse.json(
      { ok: false, error: "invalid_request", message: "Enter an email and password." },
      { status: 400 },
    );
  }
  const { email, password } = body as { email: string; password: string };

  let response: Response;
  try {
    response = await backendFetch("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "backend_unavailable",
        message: "Sign-in is temporarily unavailable. Please try again shortly.",
      },
      { status: 503 },
    );
  }

  if (response.ok) {
    const tokens = (await response.json()) as BackendTokenPair;
    const session = await getSession();
    applyTokenPair(session, tokens);
    await session.save();
    return NextResponse.json({ ok: true });
  }

  const error = await parseBackendError(response);

  if (response.status === 401 && error.code === "invalid_credentials") {
    return NextResponse.json(
      { ok: false, error: "invalid_credentials", message: error.detail },
      { status: 401 },
    );
  }

  if (response.status === 429 && error.code === "login_rate_limited") {
    const retryAfterSeconds = parseRetryAfterSeconds(response.headers.get("Retry-After")) ?? 60;
    return NextResponse.json(
      { ok: false, error: "rate_limited", message: error.detail, retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  }

  console.error("Unexpected /v1/auth/login response", response.status, error);
  return NextResponse.json(
    { ok: false, error: "unexpected_error", message: "Something went wrong. Please try again." },
    { status: 500 },
  );
}
