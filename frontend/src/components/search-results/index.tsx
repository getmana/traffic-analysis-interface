"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui";
import { cn } from "@/lib/utils";

import { ProgressPanel } from "./progress-panel";
import { SearchStatusError, useSearchStatus } from "./use-search-status";

export function SearchResultsView({ searchId }: { searchId: string }) {
  const status = useSearchStatus(searchId);

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

  return (
    <div className="mt-6 flex flex-col gap-4">
      <ProgressPanel search={status.data} />
      <p className="text-sm text-muted-foreground">Results table will live here.</p>
    </div>
  );
}
