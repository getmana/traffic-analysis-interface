import type { BackendSchemaField } from "@/types";

import { isRedacted } from "./redaction";

function resolvePathSegments(value: unknown, segments: string[]): unknown[] {
  if (segments.length === 0) return [value];
  const [rawSegment, ...rest] = segments;
  const isArraySegment = rawSegment.endsWith("[]");
  const key = isArraySegment ? rawSegment.slice(0, -2) : rawSegment;

  if (value == null || typeof value !== "object") return [];
  const next = (value as Record<string, unknown>)[key];
  if (next === undefined) return [];

  if (isArraySegment) {
    const items = Array.isArray(next) ? next : [next];
    return items.flatMap((item) => resolvePathSegments(item, rest));
  }
  return resolvePathSegments(next, rest);
}

function displayLeaf(value: unknown): string {
  if (isRedacted(value)) return "Redacted";
  if (value == null) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function resolveSchemaFieldValue(decoded: Record<string, unknown>, field: BackendSchemaField): string {
  const leaves = resolvePathSegments(decoded, field.path.split("."));
  return leaves.length === 0 ? "—" : leaves.map(displayLeaf).join(", ");
}
