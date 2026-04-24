"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { loginUser } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        const session = await loginUser(email, password);
        setSession(session);

        const roleRoute =
          session.user.role === "STUDENT"
            ? "/student/dashboard"
            : session.user.role === "ORGANIZATION"
              ? "/organization/dashboard"
              : "/coordinator/dashboard";
        router.push(roleRoute);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Login failed");
      }
    });
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1 className="section-title">Sign In</h1>
        <p className="section-subtitle" style={{ marginBottom: "1rem" }}>
          Access your SIWES Connect workspace with your role account.
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.8rem" }}>
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={isPending}>
            {isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {message ? <p style={{ color: "#b91c1c", marginBottom: 0 }}>{message}</p> : null}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
          <Link href="/forgot-password" style={{ color: "#1E40AF", fontWeight: 600 }}>
            Forgot password?
          </Link>
          <Link href="/register" style={{ color: "#1E40AF", fontWeight: 600 }}>
            Create account
          </Link>
        </div>
      </section>
    </main>
  );
}
