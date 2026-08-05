"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useState, useTransition } from "react";
import { loginUser } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { extractFieldErrors, FieldError } from "@/components/shared/FormErrors";
import Toast from "@/components/shared/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toastMsg, setToastMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);
  const [isPending, startTransition] = useTransition();
  const dismissToast = useCallback(() => setToastMsg(null), []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setToastMsg(null);
    setFieldErrors(null);

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
        const fe = extractFieldErrors(error);
        if (Object.keys(fe).length > 0) {
          setFieldErrors(fe);
        } else {
          setToastMsg({ message: error instanceof Error ? error.message : "Login failed", type: "error" });
        }
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
              onChange={(event) => {
                setEmail(event.target.value);
                setFieldErrors(null);
              }}
              required
            />
            <FieldError field="email" errors={fieldErrors} />
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
              onChange={(event) => {
                setPassword(event.target.value);
                setFieldErrors(null);
              }}
              minLength={8}
              required
            />
            <FieldError field="password" errors={fieldErrors} />
          </div>

          <button className="btn btn-primary" type="submit" disabled={isPending}>
            {isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {toastMsg ? <Toast message={toastMsg.message} type={toastMsg.type} onDismiss={dismissToast} /> : null}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
          <Link href="/register" style={{ color: "#1E40AF", fontWeight: 600 }}>
            Create account
          </Link>
        </div>
      </section>
    </main>
  );
}
