import { z } from "zod";

import type { BackendFieldDef, BackendFilterOp, FilterCond } from "@/types";

export function splitValues(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

const conditionRowSchema = z
  .object({
    field: z.string().min(1, "Select a field"),
    op: z.string().min(1, "Select an operator"),
    value: z.string(),
    valuesText: z.string(),
  })
  .superRefine((row, ctx) => {
    switch (row.op) {
      case "exists":
        return;
      case "in": {
        const items = splitValues(row.valuesText);
        if (items.length < 1) {
          ctx.addIssue({
            path: ["valuesText"],
            code: "custom",
            message: "Enter at least one value",
          });
        }
        if (items.length > 50) {
          ctx.addIssue({ path: ["valuesText"], code: "custom", message: "At most 50 values" });
        }
        return;
      }
      case "between": {
        if (splitValues(row.valuesText).length !== 2) {
          ctx.addIssue({
            path: ["valuesText"],
            code: "custom",
            message: "Enter exactly two values, separated by a comma",
          });
        }
        return;
      }
      default:
        if (!row.value.trim()) {
          ctx.addIssue({ path: ["value"], code: "custom", message: "Enter a value" });
        }
    }
  });

export const searchFormSchema = z
  .object({
    sensorIds: z
      .array(z.string())
      .min(1, "Select at least one capture point")
      .max(5, "Select up to 5 capture points"),
    from: z.string().min(1, "Start time is required"),
    to: z.string().min(1, "End time is required"),
    conditions: z.array(conditionRowSchema).min(1, "Add at least one condition"),
  })
  .superRefine((values, ctx) => {
    const fromMs = Date.parse(values.from);
    const toMs = Date.parse(values.to);
    if (!Number.isNaN(fromMs) && !Number.isNaN(toMs) && fromMs >= toMs) {
      ctx.addIssue({ path: ["to"], code: "custom", message: "End time must be after start time" });
    }
  });

export type SearchFormValues = z.infer<typeof searchFormSchema>;
export type SearchConditionRow = SearchFormValues["conditions"][number];

const NUMERIC_FIELD_TYPES = new Set(["number", "port", "duration_ms", "bytes"]);

function coerceValue(raw: string, fieldDef: BackendFieldDef | undefined): string | number {
  const isNumericField = fieldDef ? NUMERIC_FIELD_TYPES.has(fieldDef.type) : false;
  if (isNumericField && raw !== "" && !Number.isNaN(Number(raw))) {
    return Number(raw);
  }
  return raw;
}

/**
 * Transforms one form row into the backend's FilterCond shape. The numeric
 * coercion for number/port/duration_ms/bytes field types is a best guess —
 * the backend's exact Scalar handling wasn't confirmed; verify once real
 * POST /v1/searches wiring begins and drop the coercion if plain numeric
 * strings are accepted as-is.
 */
export function buildFilterCond(row: SearchConditionRow, fieldDefs: BackendFieldDef[]): FilterCond {
  const fieldDef = fieldDefs.find((f) => f.name === row.field);
  const op = row.op as BackendFilterOp;

  switch (op) {
    case "exists":
      return { field: row.field, op: "exists" };
    case "in":
      return {
        field: row.field,
        op: "in",
        values: splitValues(row.valuesText).map((v) => coerceValue(v, fieldDef)),
      };
    case "between":
      return {
        field: row.field,
        op: "between",
        values: splitValues(row.valuesText).map((v) => coerceValue(v, fieldDef)),
      };
    default:
      return { field: row.field, op, value: coerceValue(row.value.trim(), fieldDef) };
  }
}
