import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SessionDetailView } from "@/components";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Session detail",
};

export default async function SessionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ searchId?: string }>;
}) {
  const session = await getSession();
  if (!session.accessToken) {
    redirect("/sign-in");
  }
  const { id } = await params;
  const { searchId } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <SessionDetailView sessionId={id} searchId={searchId} />
    </main>
  );
}
