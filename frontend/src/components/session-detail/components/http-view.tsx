import { formatBytes } from "@/components/search-results/components/columns";

import { isRedacted } from "../utils";

type HttpBody = {
  length?: string | number;
  content_type?: string;
  preview?: string;
  truncated?: boolean;
};

type HttpDecoded = {
  method?: string;
  host?: string;
  path?: string;
  version?: string;
  status?: string | number;
  request_headers?: unknown;
  response_headers?: unknown;
  request_body?: HttpBody;
  response_body?: HttpBody;
  user_agent?: string;
};

type Header = { name: string; value: unknown };

function normalizeHeaders(raw: unknown): Header[] {
  if (Array.isArray(raw)) {
    return raw as Header[];
  }
  if (raw && typeof raw === "object") {
    return Object.entries(raw as Record<string, unknown>).flatMap(([name, value]) =>
      Array.isArray(value) ? value.map((v) => ({ name, value: v })) : [{ name, value }],
    );
  }
  return [];
}

function HeaderValue({ value }: { value: unknown }) {
  if (isRedacted(value)) {
    return <span className="text-muted-foreground italic">Redacted</span>;
  }
  return <>{String(value)}</>;
}

function HeaderTable({ title, headers }: { title: string; headers: Header[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{title}</span>
      {headers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No headers.</p>
      ) : (
        <div className="rounded-lg border border-input">
          <table className="w-full text-sm">
            <tbody>
              {headers.map((header, index) => (
                <tr key={`${header.name}-${index}`} className="border-b border-input last:border-0">
                  <td className="w-1/3 px-3 py-1.5 align-top text-muted-foreground">
                    {header.name}
                  </td>
                  <td className="px-3 py-1.5 align-top break-all">
                    <HeaderValue value={header.value} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BodySummary({ title, body }: { title: string; body: HttpBody | undefined }) {
  if (!body) return null;
  const length = Number(body.length ?? 0);
  const truncated = Boolean(body.truncated);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{title}</span>
      <p className="text-sm text-muted-foreground">
        {body.content_type || "unknown type"} · {formatBytes(length)}
        {truncated ? " · truncated" : ""}
      </p>
      {body.preview && (
        <pre className="overflow-x-auto rounded-lg border border-input bg-muted/30 p-3 text-xs whitespace-pre-wrap break-all">
          {body.preview}
        </pre>
      )}
    </div>
  );
}

export function HttpView({ decoded }: { decoded: Record<string, unknown> }) {
  const http = decoded.http as HttpDecoded | undefined;
  if (!http) {
    return <p className="text-sm text-muted-foreground">No HTTP data decoded for this session.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-mono text-base font-medium text-foreground">
          {http.method} {http.host}
          {http.path}
        </span>
        <span className="text-sm text-muted-foreground">{http.version}</span>
        <span className="text-sm font-medium text-foreground">
          {http.status !== undefined ? String(http.status) : ""}
        </span>
      </div>

      {http.user_agent && (
        <p className="text-sm text-muted-foreground">User agent: {http.user_agent}</p>
      )}

      <HeaderTable title="Request headers" headers={normalizeHeaders(http.request_headers)} />
      <BodySummary title="Request body" body={http.request_body} />

      <HeaderTable title="Response headers" headers={normalizeHeaders(http.response_headers)} />
      <BodySummary title="Response body" body={http.response_body} />
    </div>
  );
}
