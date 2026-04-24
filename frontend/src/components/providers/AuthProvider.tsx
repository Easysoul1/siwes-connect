"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import {
  SessionState,
  clearSession,
  readSession,
  writeSession
} from "@/lib/session";

type AuthContextValue = {
  session: SessionState | null;
  setSession: (session: SessionState | null) => void;
  ready: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<SessionState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSessionState(readSession());
    setReady(true);
  }, []);

  function setSession(next: SessionState | null) {
    setSessionState(next);
    if (next) {
      writeSession(next);
    } else {
      clearSession();
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        setSession,
        ready
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
