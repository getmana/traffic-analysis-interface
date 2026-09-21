import { NextResponse } from "next/server";

import { authenticatedBackendFetch,  } from "@/lib/backend";
import { parseBackendError } from '@/utils';

export async function GET() {
  const result = await authenticatedBackendFetch("/v1/me");

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
      const profile = await response.json();
      return NextResponse.json(profile, { status: 200 });
    }
    default: {
      const _exhaustive: never = result;
      throw new Error(`Unhandled authenticatedBackendFetch status: ${(_exhaustive as { status: string }).status}`);
    }
  }
}
