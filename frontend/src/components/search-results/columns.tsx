import type { ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import type { BackendByteCount, BackendColumnDef, BackendEndpoint, BackendRisk, BackendSessionRow } from "@/types";

const COLUMN_KEY_ALIASES: Record<string, string> = {
  sensor: "sensor_id",
  duration: "duration_ms",
  files: "files_count",
  dst_country: "dst.country",
};

function getByPath(row: BackendSessionRow, key: string): unknown {
  const resolvedKey = COLUMN_KEY_ALIASES[key] ?? key;
  return resolvedKey
    .split(".")
    .reduce<unknown>((acc, part) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined), row);
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let scaled = value / 1024;
  let unitIndex = 0;
  while (scaled >= 1024 && unitIndex < units.length - 1) {
    scaled /= 1024;
    unitIndex += 1;
  }
  return `${scaled.toFixed(1)} ${units[unitIndex]}`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

const RISK_BAND_CLASS: Record<BackendRisk["band"], string> = {
  low: "text-foreground",
  medium: "text-amber-600 dark:text-amber-400",
  high: "text-destructive",
};

export function formatCellValue(value: unknown, type: string): ReactNode {
  switch (type) {
    case "ts":
      return typeof value === "string" ? new Date(value).toLocaleString() : "";
    case "ip_port": {
      const ep = value as BackendEndpoint | undefined;
      return ep ? `${ep.host ?? ep.ip}:${ep.port}` : "";
    }
    case "bytes": {
      if (typeof value === "number") return formatBytes(value);
      const bc = value as BackendByteCount | undefined;
      return bc ? `↑${formatBytes(bc.up)} ↓${formatBytes(bc.down)}` : "";
    }
    case "risk": {
      const r = value as BackendRisk | undefined;
      if (!r) return "";
      return (
        <span className={RISK_BAND_CLASS[r.band]}>
          {r.band} ({r.score})
        </span>
      );
    }
    case "protocol":
      return typeof value === "string" ? value.toUpperCase() : "";
    case "duration":
      return typeof value === "number" ? formatDuration(value) : "";
    case "country":
      return typeof value === "string" ? value : "";
    default:
      return value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  }
}

export function buildColumnDefs(columns: BackendColumnDef[]): ColumnDef<BackendSessionRow>[] {
  return columns
    .filter((column) => column.default_visible)
    .map((column) => ({
      id: column.key,
      header: column.label,
      accessorFn: (row: BackendSessionRow) => getByPath(row, column.key),
      cell: (info) => formatCellValue(info.getValue(), column.type),
      size: column.width_hint,
    }));
}
