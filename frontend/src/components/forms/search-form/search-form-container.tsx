"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { IDEMPOTENCY_KEY_HEADER } from "@/constants";
import type { BackendSearch, SearchFormSubmitValues } from "@/types";

import { SearchForm } from "./search-form-view";

type CreateSearchArgs = {
  values: SearchFormSubmitValues;
  idempotencyKey: string;
};

async function createSearch({ values, idempotencyKey }: CreateSearchArgs): Promise<BackendSearch> {
  const response = await fetch("/api/searches", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [IDEMPOTENCY_KEY_HEADER]: idempotencyKey,
    },
    body: JSON.stringify(values),
  });
  const body = await response.json();
  if (!response.ok || body.ok === false) {
    throw new Error(body.message ?? "Something went wrong. Please try again.");
  }
  return body as BackendSearch;
}

export function SearchFormContainer() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const mutation = useMutation({ mutationFn: createSearch });

  const handleSubmit = async (values: SearchFormSubmitValues) => {
    setSubmitError(null);
    try {
      const search = await mutation.mutateAsync({ values, idempotencyKey: crypto.randomUUID() });
      router.push(`/search/${search.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return <SearchForm onSubmit={handleSubmit} submitError={submitError} />;
}
