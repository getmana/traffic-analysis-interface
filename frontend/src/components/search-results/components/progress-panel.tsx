import { Progress } from "@/components/ui";
import type { BackendSearch } from "@/types";

import { CancelSearchButton } from "./cancel-search-button";

const STATE_LABELS: Record<BackendSearch["state"], string> = {
  queued: "Queued",
  running: "Running",
  done: "Done",
  failed: "Failed",
  cancelled: "Cancelled",
};

const TERMINAL_STATES = new Set<BackendSearch["state"]>(["done", "failed", "cancelled"]);

export function ProgressPanel({ search }: { search: BackendSearch }) {
  const { progress, warnings, state, id } = search;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-input p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">{STATE_LABELS[state]}</span>
          {!TERMINAL_STATES.has(state) && <CancelSearchButton searchId={id} />}
        </div>
        <span className="text-sm text-muted-foreground">
          {progress.matched}
          {progress.matched_is_estimate ? "+" : ""} matched · {progress.scanned_sessions}/
          {progress.total_sessions_estimate} scanned
        </span>
      </div>

      <Progress value={progress.percent} />

      {state === "failed" && (
        <p role="alert" className="text-sm text-destructive">
          This search failed.
        </p>
      )}

      {warnings.length > 0 && (
        <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
          {warnings.map((warning, index) => (
            <li key={index}>{warning.detail}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
