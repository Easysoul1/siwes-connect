"use client";

import Link from "next/link";
import { FormEvent, useState, useTransition } from "react";
import { registerOrganization } from "@/lib/api";
import { NIGERIAN_STATES } from "@/shared/constants/states";

const steps = ["Account", "Company Info", "Contact", "Location", "Documents"];

export default function OrganizationRegisterPage() {
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    email: "",
    password: "",
    companyName: "",
    industry: "",
    size: "",
    description: "",
    contactName: "",
    phone: "",
    contactEmail: "",
    state: "",
    lga: "",
    address: "",
    cacDocument: "",
    itfDocument: ""
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        await registerOrganization({
          email: form.email,
          password: form.password,
          companyName: form.companyName
        });
        setMessage("Organization account created. Check your email to verify your account.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Registration failed");
      }
    });
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1 className="section-title">Organization Registration</h1>
        <p className="section-subtitle">Step {step + 1} of 5: {steps[step]}</p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.9rem", marginTop: "1rem" }}>
          {step === 0 ? (
            <div className="form-grid">
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  className="input"
                  type="password"
                  minLength={8}
                  value={form.password}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  required
                />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="form-grid">
              <div>
                <label className="label">Company Name</label>
                <input
                  className="input"
                  value={form.companyName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, companyName: event.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="label">Industry</label>
                <input
                  className="input"
                  value={form.industry}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, industry: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">Company Size</label>
                <input
                  className="input"
                  value={form.size}
                  onChange={(event) => setForm((prev) => ({ ...prev, size: event.target.value }))}
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="label">Description</label>
                <textarea
                  className="textarea"
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="form-grid">
              <div>
                <label className="label">Contact Name</label>
                <input
                  className="input"
                  value={form.contactName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, contactName: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  className="input"
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                />
              </div>
              <div>
                <label className="label">Contact Email</label>
                <input
                  className="input"
                  type="email"
                  value={form.contactEmail}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, contactEmail: event.target.value }))
                  }
                />
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="form-grid">
              <div>
                <label className="label">State</label>
                <select
                  className="select"
                  value={form.state}
                  onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value }))}
                >
                  <option value="">Select state</option>
                  {NIGERIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">LGA</label>
                <input
                  className="input"
                  value={form.lga}
                  onChange={(event) => setForm((prev) => ({ ...prev, lga: event.target.value }))}
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="label">Address</label>
                <textarea
                  className="textarea"
                  value={form.address}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, address: event.target.value }))
                  }
                />
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="form-grid">
              <div>
                <label className="label">CAC Document Link</label>
                <input
                  className="input"
                  placeholder="https://..."
                  value={form.cacDocument}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, cacDocument: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">ITF Document Link</label>
                <input
                  className="input"
                  placeholder="https://..."
                  value={form.itfDocument}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, itfDocument: event.target.value }))
                  }
                />
              </div>
            </div>
          ) : null}

          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.7rem" }}>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
              disabled={step === 0}
            >
              Back
            </button>
            {step < steps.length - 1 ? (
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => setStep((prev) => Math.min(prev + 1, steps.length - 1))}
              >
                Next
              </button>
            ) : (
              <button className="btn btn-primary" type="submit" disabled={isPending}>
                {isPending ? "Creating account..." : "Create Organization Account"}
              </button>
            )}
          </div>
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
