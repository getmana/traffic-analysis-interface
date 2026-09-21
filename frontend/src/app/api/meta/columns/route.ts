import { authenticatedJsonProxy } from "@/lib/backend";

export async function GET() {
  return authenticatedJsonProxy("/v1/meta/columns");
}
