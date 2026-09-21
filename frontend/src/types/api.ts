import { type Role } from "@/lib/session";

export type BackendErrorInfo = { code?: string; detail: string };

export type BackendProfile = {
  id: string;
  email: string;
  display_name: string;
  role: Role;
  permissions: string[];
  sensor_ids: string[];
};

export type BackendTokenPair = {
  access_token: string;
  token_type: "bearer";
  access_expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  user: BackendProfile;
};

export type FatalRefreshReason =
  "refresh_reused" | "refresh_expired" | "refresh_invalid" | "session_revoked";

export const FATAL_REFRESH_REASONS = new Set<string>([
  "refresh_reused",
  "refresh_expired",
  "refresh_invalid",
  "session_revoked",
]);

export type RefreshOutcome =
  | { ok: true; tokens: BackendTokenPair }
  | { ok: false; fatal: true; reason: FatalRefreshReason }
  | { ok: false; fatal: false; reason: "network_error" | "unexpected_error" };

export type AuthenticatedBackendCallResult =
  | { status: "ok"; response: Response }
  | { status: "no_session" }
  | { status: "session_expired" }
  | { status: "backend_unavailable" };
