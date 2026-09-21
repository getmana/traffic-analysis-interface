"use client";

import Link from "next/link";

import { RiskBadge, formatBytes, formatDuration } from "@/components/search-results/columns";
import { buttonVariants } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { BackendSessionDetection } from "@/types";

import { HttpView } from "./http-view";
import { useProtocolSchema } from "./use-protocol-schema";
import { SessionDetailError, useSession } from "./use-session";

const SEVERITY_CLASS: Record<BackendSessionDetection["severity"], string> = {
  low: "text-foreground",
  medium: "text-amber-600 dark:text-amber-400",
  high: "text-destructive",
};

export function SessionDetailView({ sessionId, searchId }: { sessionId: string; searchId?: string }) {
  const session = useSession(sessionId);
  const schema = useProtocolSchema(session.data?.protocol);

  if (session.isPending) {
    return <p className="mt-6 text-sm text-muted-foreground">Loading session…</p>;
  }

  if (session.error) {
    const error = session.error;
    const notFound = error instanceof SessionDetailError && error.code === "session_not_found";
    return (
      <div className="mt-6 flex flex-col gap-2">
        <p role="alert" className="text-sm text-destructive">
          {notFound
            ? "This session doesn't exist."
            : error instanceof Error
              ? error.message
              : "Something went wrong."}
        </p>
        <Link href="/search" className={cn(buttonVariants({ variant: "default" }), "self-start")}>
          Back to search
        </Link>
      </div>
    );
  }

  const data = session.data;

  return (
    <div className="mt-6 flex flex-col gap-6">
      {searchId && (
        <Link
          href={`/search/${searchId}`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "self-start")}
        >
          ← Back to results
        </Link>
      )}

      <div className="flex flex-col gap-2 rounded-lg border border-input p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-lg font-medium text-foreground">{data.summary}</span>
          <RiskBadge risk={data.risk} />
        </div>
        <p className="text-sm text-muted-foreground">
          {data.protocol.toUpperCase()} · {data.decoder} · {data.sensor_id}
        </p>
        <p className="text-sm text-muted-foreground">
          {data.src.host ?? data.src.ip}:{data.src.port} → {data.dst.host ?? data.dst.ip}:{data.dst.port}
        </p>
        <p className="text-sm text-muted-foreground">
          {new Date(data.start).toLocaleString()} – {new Date(data.end).toLocaleString()} (
          {formatDuration(data.duration_ms)})
        </p>
        <p className="text-sm text-muted-foreground">
          ↑{formatBytes(data.bytes.up)} ↓{formatBytes(data.bytes.down)}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">Detections</span>
        {data.detections.length === 0 ? (
          <p className="text-sm text-muted-foreground">No detections.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {data.detections.map((detection) => (
              <li key={detection.rule_id} className="text-sm">
                <span className={SEVERITY_CLASS[detection.severity]}>{detection.rule}</span>
                <span className="text-muted-foreground"> ({detection.severity})</span>
                <span className="text-muted-foreground">
                  {" "}
                  — {detection.mitre.technique_id} {detection.mitre.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">Files &amp; PCAP</span>
        {data.files.length === 0 ? (
          <p className="text-sm text-muted-foreground">No carved files.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {data.files.map((file) => (
              <li key={file.id} className="text-muted-foreground">
                {file.name} · {file.mime} · {formatBytes(file.size)}
                {file.purged ? " (purged)" : ""}
              </li>
            ))}
          </ul>
        )}
        <p className="text-sm text-muted-foreground">
          PCAP: {data.pcap.available ? "available" : `unavailable${data.pcap.reason ? ` (${data.pcap.reason})` : ""}`}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">Protocol detail</span>
        {data.protocol === "http" ? (
          <HttpView decoded={data.decoded} />
        ) : schema.isPending ? (
          <p className="text-sm text-muted-foreground">Loading protocol schema…</p>
        ) : schema.error ? (
          <p role="alert" className="text-sm text-destructive">
            Failed to load protocol schema.
          </p>
        ) : (
          // TODO(checkpoint 3): replace with the schema-driven GenericProtocolView.
          <pre className="overflow-x-auto rounded-lg border border-input bg-muted/30 p-3 text-xs">
            {JSON.stringify(data.decoded, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
