import type { Metadata } from "next";

import { SignInForm } from "@/components";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
      <SignInForm />
    </main>
  );
}
