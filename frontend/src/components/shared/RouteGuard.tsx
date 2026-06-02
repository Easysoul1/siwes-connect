"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

type SessionRole = "STUDENT" | "ORGANIZATION" | "COORDINATOR";

type Props = {
  allowedRoles: SessionRole[];
  fallback?: ReactNode;
  children: ReactNode;
};

const ROLE_HOME: Record<SessionRole, string> = {
  STUDENT: "/student/dashboard",
  ORGANIZATION: "/organization/dashboard",
  COORDINATOR: "/coordinator/dashboard"
};

export function RouteGuard({ allowedRoles, fallback, children }: Props) {
  const { session, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;

    if (!session) {
      router.replace("/login");
      return;
    }

    if (!allowedRoles.includes(session.user.role)) {
      router.replace(ROLE_HOME[session.user.role] ?? "/login");
    }
  }, [ready, session, allowedRoles, router]);

  if (!ready) {
    return (
      <main className="app-container">
        <section className="card">
          <p style={{ margin: 0, color: "#6B7280" }}>Loading...</p>
        </section>
      </main>
    );
  }

  if (!session) return fallback ?? null;

  if (!allowedRoles.includes(session.user.role)) return null;

  return <>{children}</>;
}
