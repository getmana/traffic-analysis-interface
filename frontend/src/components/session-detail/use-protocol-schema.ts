"use client";

import { useQuery } from "@tanstack/react-query";

import type { BackendProtocolName, BackendProtocolSchema } from "@/types";

async function fetchProtocolSchema(protocol: BackendProtocolName): Promise<BackendProtocolSchema> {
  const response = await fetch(`/api/meta/schema/${protocol}`);
  const body = await response.json();
  if (!response.ok || body.ok === false) {
    throw new Error(body.message ?? "Failed to load protocol schema.");
  }
  return body as BackendProtocolSchema;
}

export function useProtocolSchema(protocol: BackendProtocolName | undefined) {
  return useQuery({
    queryKey: ["meta", "schema", protocol],
    queryFn: () => fetchProtocolSchema(protocol!),
    enabled: !!protocol,
    staleTime: Infinity,
  });
}
