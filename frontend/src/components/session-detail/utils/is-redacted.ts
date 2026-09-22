export function isRedacted(value: unknown): value is { redacted: true } {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    (value as Record<string, unknown>).redacted === true &&
    Object.keys(value as Record<string, unknown>).length === 1
  );
}
