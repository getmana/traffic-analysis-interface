import Link from "next/link";
import { Button } from "@/components/ui";

type DataSectionProps = {
  error: string | null;
  authError: boolean;
  onRetry: () => void;
  label: string;
};

export function DataSection({ error, authError, onRetry, label }: DataSectionProps) {
  if (authError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        You need to sign in to load {label}.{" "}
        <Link href="/sign-in" className="underline">
          Sign in
        </Link>
      </p>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3">
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  return <p className="text-sm text-muted-foreground">Loading {label}…</p>;
}
