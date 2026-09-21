export const BACKEND_BASE_URL = process.env.BACKEND_API_BASE_URL ?? "http://localhost:8700";

export const REFRESH_SAFETY_MARGIN_MS = 10_000;
export const REFRESH_RESULT_GRACE_MS = 5_000;

export const IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";
