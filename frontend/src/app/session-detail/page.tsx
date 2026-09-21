import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Session detail",
};

export default function SessionDetailPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold text-foreground">Session detail</h1>
      <p className="mt-2 text-muted-foreground">The decoded session view will live here.</p>
    </main>
  );
}
