"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(`Password reset link prepared for ${email}. Connect backend mailer to activate.`);
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1 className="section-title">Forgot Password</h1>
        <p className="section-subtitle" style={{ marginBottom: "1rem" }}>
          Enter your account email to receive password reset instructions.
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.8rem" }}>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Send Reset Link
          </button>
        </form>

        {message ? <p style={{ color: "#4B5563", marginBottom: 0 }}>{message}</p> : null}

        <p style={{ marginBottom: 0, marginTop: "1rem", color: "#4B5563" }}>
          Back to{" "}
          <Link href="/login" style={{ color: "#1E40AF", fontWeight: 700 }}>
            sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
