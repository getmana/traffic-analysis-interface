"use client";

import { useQuery } from "@tanstack/react-query";

import type { BackendSearch } from "@/types";

export class SearchStatusError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "SearchStatusError";
    this.code = code;
  }
}

async function fetchSearchStatus(searchId: string): Promise<BackendSearch> {
  const response = await fetch(`/api/searches/${searchId}`);
  const body = await response.json();
  if (!response.ok || body.ok === false) {
    throw new SearchStatusError(
      body.error ?? "unexpected_error",
      body.message ?? "Something went wrong.",
    );
  }
  return body as BackendSearch;
}

const TERMINAL_STATES = new Set(["done", "failed", "cancelled"]);

export function useSearchStatus(searchId: string) {
  return useQuery({
    queryKey: ["searches", searchId],
    queryFn: () => fetchSearchStatus(searchId),
    retry: false,
    refetchInterval: (query) => {
      const err = query.state.error as SearchStatusError | undefined;
      if (err?.code === "search_expired" || err?.code === "search_not_found") {
        return false;
      }
      const data = query.state.data;
      if (data && TERMINAL_STATES.has(data.state)) {
        return false;
      }
      return 2000;
    },
  });
}
