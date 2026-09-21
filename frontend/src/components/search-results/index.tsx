"use client";

import { useState } from "react";
import Link from "next/link";

import {
  Button,
  buttonVariants,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import type { BackendSortKey } from "@/types";

import { buildColumnDefs } from "./columns";
import { ProgressPanel } from "./progress-panel";
import { ResultsTable } from "./results-table";
import { useColumns } from "./use-columns";
import { useSearchResults } from "./use-search-results";
import { SearchStatusError, useSearchStatus } from "./use-search-status";

const SORT_OPTIONS: { value: BackendSortKey; label: string }[] = [
  { value: "-ts", label: "Newest first" },
  { value: "ts", label: "Oldest first" },
  { value: "-bytes", label: "Most bytes" },
  { value: "bytes", label: "Least bytes" },
  { value: "-risk", label: "Highest risk" },
  { value: "risk", label: "Lowest risk" },
];

export function SearchResultsView({ searchId }: { searchId: string }) {
  const [sort, setSort] = useState<BackendSortKey>("-ts");
  const status = useSearchStatus(searchId);
  const columns = useColumns();
  const results = useSearchResults(searchId, sort, status.data?.state ?? "queued");

  if (status.isPending) {
    return <p className="mt-6 text-sm text-muted-foreground">Loading search…</p>;
  }

  if (status.error) {
    const error = status.error;
    if (error instanceof SearchStatusError && error.code === "search_expired") {
      return (
        <div className="mt-6 flex flex-col gap-2">
          <p role="alert" className="text-sm text-destructive">
            This search expired.
          </p>
          <Link href="/search" className={cn(buttonVariants({ variant: "default" }), "self-start")}>
            Start a new search
          </Link>
        </div>
      );
    }

    if (error instanceof SearchStatusError && error.code === "search_not_found") {
      return (
        <div className="mt-6 flex flex-col gap-2">
          <p role="alert" className="text-sm text-destructive">
            This search doesn&apos;t exist.
          </p>
          <Link href="/search" className={cn(buttonVariants({ variant: "default" }), "self-start")}>
            Start a new search
          </Link>
        </div>
      );
    }

    return (
      <div className="mt-6 flex items-center gap-3">
        <p role="alert" className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Something went wrong."}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => status.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const canSort = status.data.state === "done";
  const tableColumns = columns.data ? buildColumnDefs(columns.data) : [];

  return (
    <div className="mt-6 flex flex-col gap-4">
      <ProgressPanel search={status.data} />

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Results</span>
        <Select value={sort} onValueChange={(value) => setSort(value as BackendSortKey)} disabled={!canSort}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {columns.isPending ? (
        <p className="text-sm text-muted-foreground">Loading columns…</p>
      ) : columns.error ? (
        <p role="alert" className="text-sm text-destructive">
          Failed to load columns.
        </p>
      ) : (
        <>
          <ResultsTable rows={results.rows} columns={tableColumns} />
          <p className="text-sm text-muted-foreground">
            {results.resultsComplete
              ? results.rows.length === 0
                ? "No sessions matched."
                : `${results.rows.length} session${results.rows.length === 1 ? "" : "s"} loaded.`
              : "Waiting for more results…"}
          </p>
        </>
      )}
    </div>
  );
}
