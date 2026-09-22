import { authenticatedJsonProxy } from "@/lib/backend";

const FORWARDED_PARAMS = ["cursor", "limit", "sort"];

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const incoming = new URL(request.url).searchParams;
  const forwarded = new URLSearchParams();
  for (const key of FORWARDED_PARAMS) {
    const value = incoming.get(key);
    if (value !== null) {
      forwarded.set(key, value);
    }
  }
  const query = forwarded.toString();

  return authenticatedJsonProxy(
    `/v1/searches/${encodeURIComponent(id)}/results${query ? `?${query}` : ""}`,
  );
}
