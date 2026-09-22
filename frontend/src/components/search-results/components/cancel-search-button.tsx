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

export function CancelSearchButton({ searchId }: { searchId: string }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => cancelSearch(searchId),
    onSuccess: () => {
      queryClient.setQueryData<BackendSearch>(["searches", searchId], (prev) =>
        prev ? { ...prev, state: "cancelled" } : prev,
      );
    },
  });

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      Cancel search
    </Button>
  );
}
