"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { verifyEmailToken } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [message, setMessage] = useState<string>("Verifying your email...");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const token = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("token") : null;
    if (!token) {
      setMessage("Missing verification token.");
      return;
    }

    startTransition(async () => {
      try {
        const session = await verifyEmailToken(token);
        setSession(session);
        setMessage("Email verified successfully. Redirecting to your dashboard...");
        const roleRoute =
          session.user.role === "STUDENT"
            ? "/student/dashboard"
            : session.user.role === "ORGANIZATION"
              ? "/organization/dashboard"
              : "/coordinator/dashboard";
        router.push(roleRoute);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to verify email.");
      }
    });
  }, [router, setSession]);

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1 className="section-title">Verify Email</h1>
        <p className="section-subtitle" style={{ marginBottom: "1rem" }}>
          {isPending ? "Processing verification..." : "Account verification"}
        </p>

        <div className="card">
          <p style={{ marginTop: 0, color: "#4B5563" }}>{message}</p>
          <Link href="/login" className="btn btn-primary" style={{ display: "inline-flex" }}>
            Continue to Login
          </Link>
        </div>
      </section>
    </main>
  );
}
