export type SessionRole = "STUDENT" | "ORGANIZATION" | "COORDINATOR";

export type SessionUser = {
  id: string;
  email: string;
  role: SessionRole;
};

export type SessionState = {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
};

const KEY = "siwes_connect_session";

export function readSession(): SessionState | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionState;
  } catch {
    return null;
  }
}

export function writeSession(session: SessionState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
