import { authenticatedJsonProxy } from "@/lib/backend";

export async function GET(_request: Request, { params }: { params: Promise<{ protocol: string }> }) {
  const { protocol } = await params;
  return authenticatedJsonProxy(`/v1/meta/schema/${encodeURIComponent(protocol)}`);
}
