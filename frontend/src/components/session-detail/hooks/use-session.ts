"use client";

import { useQuery } from "@tanstack/react-query";

import type { BackendSession } from "@/types";

export class SessionDetailError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "SessionDetailError";
    this.code = code;
  }
}

async function fetchSession(sessionId: string): Promise<BackendSession> {
  const response = await fetch(`/api/sessions/${sessionId}`);
  const body = await response.json();
  if (!response.ok || body.ok === false) {
    throw new SessionDetailError(body.error ?? "unexpected_error", body.message ?? "Something went wrong.");
  }
  return body as BackendSession;
}

export function useSession(sessionId: string) {
  return useQuery({
    queryKey: ["sessions", sessionId],
    queryFn: () => fetchSession(sessionId),
    staleTime: Infinity,
    retry: false,
  });
}
