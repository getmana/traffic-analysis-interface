"use client";

import { useEffect, useMemo } from "react";
import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";

import type { BackendSearchResults, BackendSearchState, BackendSortKey } from "@/types";

const CATCH_UP_INTERVAL_MS = 1500;

function resultsQueryKey(searchId: string, sort: BackendSortKey) {
  return ["searches", searchId, "results", sort] as const;
}

async function fetchResultsPage(
  searchId: string,
  { cursor, sort }: { cursor: string | null; sort: BackendSortKey },
): Promise<BackendSearchResults> {
  const params = new URLSearchParams({ sort });
  if (cursor) params.set("cursor", cursor);
  const response = await fetch(`/api/searches/${searchId}/results?${params.toString()}`);
  const body = await response.json();
  if (!response.ok || body.ok === false) {
    throw new Error(body.message ?? "Failed to fetch results.");
  }
  return body as BackendSearchResults;
}

async function refetchLastPage(
  queryClient: QueryClient,
  searchId: string,
  sort: BackendSortKey,
): Promise<void> {
  const queryKey = resultsQueryKey(searchId, sort);
  const current =
    queryClient.getQueryData<InfiniteData<BackendSearchResults, string | null>>(queryKey);
  if (!current || current.pages.length === 0) return;
  const lastIndex = current.pages.length - 1;
  const lastPageParam = current.pageParams[lastIndex];
  const freshLastPage = await fetchResultsPage(searchId, { cursor: lastPageParam, sort });
  queryClient.setQueryData(queryKey, {
    ...current,
    pages: [...current.pages.slice(0, lastIndex), freshLastPage],
  });
}

export function useSearchResults(
  searchId: string,
  sort: BackendSortKey,
  searchState: BackendSearchState,
) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: resultsQueryKey(searchId, sort),
    queryFn: ({ pageParam }) => fetchResultsPage(searchId, { cursor: pageParam, sort }),
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    initialPageParam: null as string | null,
  });

  const { data, hasNextPage, fetchNextPage } = query;
  const lastPage = data?.pages.at(-1);
  const resultsComplete = lastPage?.complete ?? false;

  useEffect(() => {
    if (resultsComplete || searchState === "cancelled") return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = async () => {
      if (cancelled) return;
      if (hasNextPage) {
        await fetchNextPage();
      } else {
        await refetchLastPage(queryClient, searchId, sort);
      }
      if (!cancelled) {
        timeoutId = setTimeout(tick, CATCH_UP_INTERVAL_MS);
      }
    };

    timeoutId = setTimeout(tick, CATCH_UP_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [resultsComplete, searchState, hasNextPage, fetchNextPage, searchId, sort, queryClient]);

  const rows = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  return { ...query, rows, resultsComplete, matchedSoFar: lastPage?.matched_so_far ?? 0 };
}
