import { type BackendErrorInfo } from "@/types";

export async function parseBackendError(response: Response): Promise<BackendErrorInfo> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {}

  if (
    body &&
    typeof body === "object" &&
    "code" in body &&
    typeof (body as { code: unknown }).code === "string"
  ) {
    const record = body as { code: string; detail?: unknown };
    const detail = typeof record.detail === "string" ? record.detail : "Request failed.";
    return { code: record.code, detail };
  }
  return { detail: "Request failed." };
}
