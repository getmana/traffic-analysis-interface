import { authenticatedJsonProxy } from "@/lib/backend";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return authenticatedJsonProxy(`/v1/searches/${encodeURIComponent(id)}`);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return authenticatedJsonProxy(`/v1/searches/${encodeURIComponent(id)}`, { method: "DELETE" });
}
