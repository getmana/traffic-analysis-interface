
type LoadState<T> = {
  items: T[] | null;
  error: string | null;
  authError: boolean;
};

export async function loadItems<T>(path: string): Promise<LoadState<T>> {
  try {
    const response = await fetch(path);
    const body = await response.json().catch(() => null);
    if (response.ok && body && Array.isArray(body.items)) {
      return { items: body.items as T[], error: null, authError: false };
    }
    const authError = body?.error === "not_signed_in" || body?.error === "session_expired";
    return {
      items: null,
      error: body?.message ?? "Failed to load. Please try again.",
      authError,
    };
  } catch {
    return { items: null, error: "Failed to load. Please try again.", authError: false };
  }
}