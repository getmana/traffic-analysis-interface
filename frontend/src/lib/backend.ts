import type { IronSession } from "iron-session";
import { NextResponse } from "next/server";

import { getSession, type SessionData } from "@/lib/session";
import { parseBackendError } from "@/utils";
import {
  type BackendProfile,
  type BackendTokenPair,
  type RefreshOutcome,
  type FatalRefreshReason,
  FATAL_REFRESH_REASONS,
  type AuthenticatedBackendCallResult,
} from "@/types";
import { BACKEND_BASE_URL, REFRESH_SAFETY_MARGIN_MS, REFRESH_RESULT_GRACE_MS } from "@/constants";

export async function backendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${BACKEND_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
    cache: "no-store",
  });
}

function toSessionUser(profile: BackendProfile): SessionData["user"] {
  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.display_name,
    role: profile.role,
    permissions: profile.permissions,
  };
}

export function applyTokenPair(session: IronSession<SessionData>, tokens: BackendTokenPair): void {
  session.accessToken = tokens.access_token;
  session.refreshToken = tokens.refresh_token;
  session.accessExpiresAt = Date.now() + tokens.access_expires_in * 1000;
  session.user = toSessionUser(tokens.user);
}

const inflightRefreshes = new Map<string, Promise<RefreshOutcome>>();

async function doRefresh(refreshToken: string): Promise<RefreshOutcome> {
  let response: Response;
  try {
    response = await backendFetch("/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } catch {
    return { ok: false, fatal: false, reason: "network_error" };
  }
  if (response.ok) {
    return { ok: true, tokens: (await response.json()) as BackendTokenPair };
  }
  const error = await parseBackendError(response);
  if (error.code && FATAL_REFRESH_REASONS.has(error.code)) {
    return { ok: false, fatal: true, reason: error.code as FatalRefreshReason };
  }
  return { ok: false, fatal: false, reason: "unexpected_error" };
}

async function refreshAccessToken(session: IronSession<SessionData>): Promise<RefreshOutcome> {
  const key = session.refreshToken;
  if (!key) {
    return { ok: false, fatal: true, reason: "refresh_invalid" };
  }

  let inflight = inflightRefreshes.get(key);
  if (!inflight) {
    inflight = doRefresh(key);
    inflightRefreshes.set(key, inflight);
    inflight.finally(() => {
      setTimeout(() => inflightRefreshes.delete(key), REFRESH_RESULT_GRACE_MS);
    });
  }
  const outcome = await inflight;

  if (outcome.ok) {
    applyTokenPair(session, outcome.tokens);
    await session.save();
  }
  return outcome;
}

export async function authenticatedBackendFetch(
  path: string,
  init: RequestInit = {},
): Promise<AuthenticatedBackendCallResult> {
  const session = await getSession();
  if (!session.accessToken || !session.refreshToken || !session.accessExpiresAt) {
    return { status: "no_session" };
  }

  if (Date.now() >= session.accessExpiresAt - REFRESH_SAFETY_MARGIN_MS) {
    const outcome = await refreshAccessToken(session);
    if (!outcome.ok) {
      if (outcome.fatal) {
        session.destroy();
        return { status: "session_expired" };
      }
      return { status: "backend_unavailable" };
    }
  }

  const call = () =>
    backendFetch(path, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${session.accessToken}` },
    });

  let response: Response;
  try {
    response = await call();
  } catch {
    return { status: "backend_unavailable" };
  }

  if (response.status === 401) {
    const outcome = await refreshAccessToken(session);
    if (!outcome.ok) {
      if (outcome.fatal) {
        session.destroy();
        return { status: "session_expired" };
      }
      return { status: "backend_unavailable" };
    }
    try {
      response = await call();
    } catch {
      return { status: "backend_unavailable" };
    }
  }

  return { status: "ok", response };
}

export async function authenticatedJsonProxy(path: string): Promise<NextResponse> {
  const result = await authenticatedBackendFetch(path);

  switch (result.status) {
    case "no_session":
      return NextResponse.json({ ok: false, error: "not_signed_in" }, { status: 401 });
    case "session_expired":
      return NextResponse.json(
        {
          ok: false,
          error: "session_expired",
          message: "Your session expired. Please sign in again.",
        },
        { status: 401 },
      );
    case "backend_unavailable":
      return NextResponse.json(
        {
          ok: false,
          error: "backend_unavailable",
          message: "Temporarily unable to reach the backend.",
        },
        { status: 503 },
      );
    case "ok": {
      const { response } = result;
      if (!response.ok) {
        const error = await parseBackendError(response);
        return NextResponse.json(
          { ok: false, error: error.code ?? "unexpected_error", message: error.detail },
          { status: response.status },
        );
      }
      const body = await response.json();
      return NextResponse.json(body, { status: 200 });
    }
    default: {
      const _exhaustive: never = result;
      throw new Error(
        `Unhandled authenticatedBackendFetch status: ${(_exhaustive as { status: string }).status}`,
      );
    }
  }
}
