import { describe, expect, it } from "vitest";

import type { BackendSchemaField } from "@/types";

import { resolveSchemaFieldValue } from "./resolve-schema-field-value";

function field(path: string, type = "string"): BackendSchemaField {
  return { path, title: path, type };
}

describe("resolveSchemaFieldValue", () => {
  it("resolves a simple dotted path", () => {
    const decoded = { dns: { query: { name: "example.net" } } };
    expect(resolveSchemaFieldValue(decoded, field("dns.query.name"))).toBe("example.net");
  });

  it("joins multiple items at an array path", () => {
    const decoded = {
      dns: { answers: [{ data: "1.1.1.1" }, { data: "2.2.2.2" }] },
    };
    expect(resolveSchemaFieldValue(decoded, field("dns.answers[].data"))).toBe("1.1.1.1, 2.2.2.2");
  });

  it("treats a v1-collapsed single array item as a 1-item array", () => {
    const decoded = { smtp: { rcpt_to: "ops@example.net" } };
    expect(resolveSchemaFieldValue(decoded, field("smtp.rcpt_to[]"))).toBe("ops@example.net");
  });

  it("falls back to an em dash for a missing path", () => {
    const decoded = { dns: { answers: [] } };
    expect(resolveSchemaFieldValue(decoded, field("dns.rcode.name"))).toBe("—");
    expect(resolveSchemaFieldValue(decoded, field("dns.answers[].data"))).toBe("—");
  });

  it("shows Redacted for a {redacted:true} leaf", () => {
    const decoded = { smb2: { user: { redacted: true } } };
    expect(resolveSchemaFieldValue(decoded, field("smb2.user"))).toBe("Redacted");
  });

  it("shows Redacted for each redacted item inside an array path", () => {
    const decoded = { smtp: { rcpt_to: [{ redacted: true }] } };
    expect(resolveSchemaFieldValue(decoded, field("smtp.rcpt_to[]"))).toBe("Redacted");
  });
});
