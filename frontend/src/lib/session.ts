import { cookies } from "next/headers";
import { getIronSession, type IronSession } from "iron-session";

export type Role = "analyst" | "observer";

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  permissions: string[];
};

export interface SessionData {
  accessToken?: string;
  refreshToken?: string;
  accessExpiresAt?: number;
  user?: SessionUser;
}

const SESSION_COOKIE_NAME = "sixth_sense_session";

function requireSessionPassword(): string {
  const value = process.env.SESSION_PASSWORD;
  if (!value || value.length < 32) {
    throw new Error("SESSION_PASSWORD env var must be set to a string of at least 32 characters.");
  }
  return value;
}

function sessionOptions() {
  return {
    password: requireSessionPassword(),
    cookieName: SESSION_COOKIE_NAME,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
  };
}

export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(await cookies(), sessionOptions());
}

export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}
