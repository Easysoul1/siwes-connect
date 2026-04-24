"use client";

import Link from "next/link";
import { FormEvent, useState, useTransition } from "react";
import { registerCoordinator } from "@/lib/api";

export default function CoordinatorRegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        await registerCoordinator({ fullName, email, password });
        setMessage("Coordinator account created. Please sign in.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Registration failed");
      }
    });
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1 className="section-title">Coordinator Registration</h1>
        <p className="section-subtitle" style={{ marginBottom: "1rem" }}>
          Register institutional oversight account.
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.8rem" }}>
          <div>
            <label className="label">Full Name</label>
            <input
              className="input"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </div>
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
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Coordinator Account"}
          </button>
        </form>

        {message ? <p style={{ color: "#4B5563", marginBottom: 0 }}>{message}</p> : null}

        <p style={{ marginBottom: 0, marginTop: "1rem", color: "#4B5563" }}>
          Already registered?{" "}
          <Link href="/login" style={{ color: "#1E40AF", fontWeight: 700 }}>
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
