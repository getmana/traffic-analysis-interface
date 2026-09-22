"use client";

import { useQuery } from "@tanstack/react-query";

import type { BackendColumnDef } from "@/types";

async function fetchColumns(): Promise<BackendColumnDef[]> {
  const response = await fetch("/api/meta/columns");
  const body = await response.json();
  if (!response.ok || body.ok === false) {
    throw new Error(body.message ?? "Failed to load columns.");
  }
  return body.items as BackendColumnDef[];
}

export function useColumns() {
  return useQuery({
    queryKey: ["meta", "columns"],
    queryFn: fetchColumns,
    staleTime: Infinity,
  });
}
