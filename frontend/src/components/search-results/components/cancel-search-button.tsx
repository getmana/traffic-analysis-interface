"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui";
import type { BackendSearch } from "@/types";

async function cancelSearch(searchId: string): Promise<void> {
  const response = await fetch(`/api/searches/${searchId}`, { method: "DELETE" });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to cancel the search.");
  }
}

export function CancelSearchButton({ searchId, isTerminal }: { searchId: string; isTerminal: boolean }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => cancelSearch(searchId),
    onSuccess: () => {
      if (!isTerminal) {
        queryClient.setQueryData<BackendSearch>(["searches", searchId], (prev) =>
          prev ? { ...prev, state: "cancelled" } : prev,
        );
      }
    },
  });

  if (mutation.isSuccess && isTerminal) {
    return (
      <Button type="button" variant="outline" size="sm" disabled>
        Deleted
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      {isTerminal ? "Delete search" : "Cancel search"}
    </Button>
  );
}
