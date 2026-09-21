import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SearchFormContainer } from "@/components/forms/search-form/search-form-container";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchPage() {
  const session = await getSession();
  if (!session.accessToken) {
    redirect("/sign-in");
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold text-foreground">Search</h1>
      <SearchFormContainer />
    </main>
  );
}
