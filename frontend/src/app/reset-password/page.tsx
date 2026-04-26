"use client";

import Link from "next/link";
import { FormEvent, useState, useTransition } from "react";
import { resetPassword } from "@/lib/api";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token] = useState<string | null>(() =>
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("token") : null
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setMessage("Missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Password confirmation does not match.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await resetPassword(token, password);
        setMessage(response.message);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Password reset failed.");
      }
    });
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1 className="section-title">Reset Password</h1>
        <p className="section-subtitle" style={{ marginBottom: "1rem" }}>
          Enter and confirm your new password.
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.8rem" }}>
          <div>
            <label className="label">New Password</label>
            <input
              className="input"
              type="password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input
              className="input"
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={isPending}>
            {isPending ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {message ? <p style={{ color: "#4B5563", marginBottom: 0 }}>{message}</p> : null}

        <p style={{ marginBottom: 0, marginTop: "1rem", color: "#4B5563" }}>
          Return to{" "}
          <Link href="/login" style={{ color: "#1E40AF", fontWeight: 700 }}>
            sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
