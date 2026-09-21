import { authenticatedJsonProxy } from "@/lib/backend";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return authenticatedJsonProxy(`/v1/sessions/${encodeURIComponent(id)}`);
}
