import type { BackendProtocolSchema } from "@/types";

import { resolveSchemaFieldValue } from "../utils";

export function GenericProtocolView({
  decoded,
  schema,
}: {
  decoded: Record<string, unknown>;
  schema: BackendProtocolSchema;
}) {
  return (
    <div className="rounded-lg border border-input">
      <table className="w-full text-sm">
        <tbody>
          {schema.fields.map((field) => {
            const value = resolveSchemaFieldValue(decoded, field);
            return (
              <tr key={field.path} className="border-b border-input last:border-0">
                <td className="w-1/3 px-3 py-1.5 align-top text-muted-foreground">{field.title}</td>
                <td
                  className={`px-3 py-1.5 align-top break-all ${value === "Redacted" ? "text-muted-foreground italic" : ""}`}
                >
                  {value}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
