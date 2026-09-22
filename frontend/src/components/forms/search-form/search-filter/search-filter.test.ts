import { describe, expect, it } from "vitest";

import type { BackendFieldDef } from "@/types";

import { buildFilterCond, searchFormSchema, splitValues } from "./search-filter";

describe("splitValues", () => {
  it("splits, trims, and drops empty entries", () => {
    expect(splitValues(" a, b ,,c,")).toEqual(["a", "b", "c"]);
  });

  it("returns an empty array for blank input", () => {
    expect(splitValues("   ")).toEqual([]);
  });
});

const ipField: BackendFieldDef = {
  name: "src.ip",
  label: "Source IP",
  type: "ip",
  operators: ["eq", "cidr", "exists"],
  example: "10.20.4.17",
};

const portField: BackendFieldDef = {
  name: "dst.port",
  label: "Destination port",
  type: "port",
  operators: ["eq", "gte", "lte", "between"],
  example: "443",
};

const protocolField: BackendFieldDef = {
  name: "protocol",
  label: "Protocol",
  type: "enum",
  operators: ["eq", "in"],
  enum: ["dns", "http", "tls"],
  example: "tls",
};

describe("buildFilterCond", () => {
  it("builds an exists condition with no value/values", () => {
    const cond = buildFilterCond({ field: "src.ip", op: "exists", value: "", valuesText: "" }, [
      ipField,
    ]);
    expect(cond).toEqual({ field: "src.ip", op: "exists" });
  });

  it("builds an in condition from comma-separated values, without numeric coercion for a non-numeric field", () => {
    const cond = buildFilterCond(
      { field: "protocol", op: "in", value: "", valuesText: "dns, tls" },
      [protocolField],
    );
    expect(cond).toEqual({ field: "protocol", op: "in", values: ["dns", "tls"] });
  });

  it("builds a between condition with numeric coercion for a numeric field type", () => {
    const cond = buildFilterCond(
      { field: "dst.port", op: "between", value: "", valuesText: "10,20" },
      [portField],
    );
    expect(cond).toEqual({ field: "dst.port", op: "between", values: [10, 20] });
  });

  it("builds a single-value condition without coercion for a non-numeric field type", () => {
    const cond = buildFilterCond(
      { field: "src.ip", op: "eq", value: "10.20.4.17", valuesText: "" },
      [ipField],
    );
    expect(cond).toEqual({ field: "src.ip", op: "eq", value: "10.20.4.17" });
  });

  it("builds a single-value condition with numeric coercion for a numeric field type", () => {
    const cond = buildFilterCond({ field: "dst.port", op: "eq", value: "443", valuesText: "" }, [
      portField,
    ]);
    expect(cond).toEqual({ field: "dst.port", op: "eq", value: 443 });
  });
});

function validPayload(overrides: Partial<Parameters<typeof searchFormSchema.safeParse>[0]> = {}) {
  return {
    sensorIds: ["hq-core"],
    from: "2026-09-20T00:00",
    to: "2026-09-21T00:00",
    conditions: [{ field: "src.ip", op: "exists", value: "", valuesText: "" }],
    ...overrides,
  };
}

describe("searchFormSchema arity validation", () => {
  it("accepts a valid minimal payload", () => {
    const result = searchFormSchema.safeParse(validPayload());
    expect(result.success).toBe(true);
  });

  it("rejects 'between' with only one value", () => {
    const result = searchFormSchema.safeParse(
      validPayload({
        conditions: [{ field: "dst.port", op: "between", value: "", valuesText: "10" }],
      }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects 'in' with no values", () => {
    const result = searchFormSchema.safeParse(
      validPayload({
        conditions: [{ field: "protocol", op: "in", value: "", valuesText: "" }],
      }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects a single-value op with an empty value", () => {
    const result = searchFormSchema.safeParse(
      validPayload({
        conditions: [{ field: "src.ip", op: "eq", value: "", valuesText: "" }],
      }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects an empty sensorIds selection", () => {
    const result = searchFormSchema.safeParse(validPayload({ sensorIds: [] }));
    expect(result.success).toBe(false);
  });

  it("rejects more than 5 sensorIds", () => {
    const result = searchFormSchema.safeParse(
      validPayload({ sensorIds: ["a", "b", "c", "d", "e", "f"] }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects an end time that is not after the start time", () => {
    const result = searchFormSchema.safeParse(
      validPayload({ from: "2026-09-21T00:00", to: "2026-09-20T00:00" }),
    );
    expect(result.success).toBe(false);
  });
});
