import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SearchResultsView } from "@/components";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Search results",
};

export default async function SearchResultsPage({
  params,
}: {
  params: Promise<{ searchId: string }>;
}) {
  const session = await getSession();
  if (!session.accessToken) {
    redirect("/sign-in");
  }
  const { searchId } = await params;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <SearchResultsView searchId={searchId} />
    </main>
  );
}
