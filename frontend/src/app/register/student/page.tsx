"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { registerStudent } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { NIGERIAN_STATES } from "@/shared/constants/states";
import { NIGERIAN_INSTITUTIONS } from "@/shared/constants/institutions";

const steps = [
  "Account",
  "Personal Info",
  "Academic Info",
  "Location Preferences"
];

export default function StudentRegisterPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    dob: "",
    matricNumber: "",
    department: "",
    field: "",
    level: "",
    cgpa: "",
    institution: "",
    currentState: "",
    preferredStates: [] as string[]
  });

  function togglePreferredState(state: string) {
    setForm((prev) => ({
      ...prev,
      preferredStates: prev.preferredStates.includes(state)
        ? prev.preferredStates.filter((item) => item !== state)
        : [...prev.preferredStates, state]
    }));
  }

  function nextStep() {
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  }

  function prevStep() {
    setStep((prev) => Math.max(prev - 1, 0));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (form.password !== form.confirmPassword) {
      setMessage("Password and confirmation do not match.");
      return;
    }

    startTransition(async () => {
      try {
        const session = await registerStudent({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          department: form.department || form.field,
          level: form.level,
          cgpa: form.cgpa ? Number(form.cgpa) : undefined,
          currentState: form.currentState,
          preferredStates: form.preferredStates,
          institutionId: form.institution || undefined
        });
        setSession(session);
        router.push("/student/dashboard");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Registration failed");
      }
    });
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1 className="section-title">Student Registration</h1>
        <p className="section-subtitle">Step {step + 1} of 4: {steps[step]}</p>

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
              <div>
                <label className="label">Confirm Password</label>
                <input
                  className="input"
                  type="password"
                  minLength={8}
                  value={form.confirmPassword}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                  }
                  required
                />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="form-grid">
              <div>
                <label className="label">First Name</label>
                <input
                  className="input"
                  value={form.firstName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, firstName: event.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input
                  className="input"
                  value={form.lastName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, lastName: event.target.value }))
                  }
                  required
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
                <label className="label">Date of Birth</label>
                <input
                  className="input"
                  type="date"
                  value={form.dob}
                  onChange={(event) => setForm((prev) => ({ ...prev, dob: event.target.value }))}
                />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="form-grid">
              <div>
                <label className="label">Matric Number</label>
                <input
                  className="input"
                  value={form.matricNumber}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, matricNumber: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">Institution</label>
                <select
                  className="select"
                  value={form.institution}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, institution: event.target.value }))
                  }
                  required
                >
                  <option value="">Select institution</option>
                  {NIGERIAN_INSTITUTIONS.map((inst) => (
                    <option key={inst.shortName} value={inst.shortName}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Department</label>
                <input
                  className="input"
                  value={form.department}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, department: event.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="label">Field of Study</label>
                <input
                  className="input"
                  value={form.field}
                  onChange={(event) => setForm((prev) => ({ ...prev, field: event.target.value }))}
                />
              </div>
              <div>
                <label className="label">Level</label>
                <input
                  className="input"
                  placeholder="e.g. 300"
                  value={form.level}
                  onChange={(event) => setForm((prev) => ({ ...prev, level: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">CGPA (optional)</label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  min={0}
                  max={5}
                  value={form.cgpa}
                  onChange={(event) => setForm((prev) => ({ ...prev, cgpa: event.target.value }))}
                />
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div style={{ display: "grid", gap: "0.9rem" }}>
              <div>
                <label className="label">Current State</label>
                <select
                  className="select"
                  value={form.currentState}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, currentState: event.target.value }))
                  }
                  required
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
                <label className="label">Preferred States</label>
                <div className="card-grid">
                  {NIGERIAN_STATES.map((state) => {
                    const selected = form.preferredStates.includes(state);
                    return (
                      <button
                        key={state}
                        type="button"
                        className={`btn ${selected ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => togglePreferredState(state)}
                      >
                        {state.replaceAll("_", " ")}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.7rem" }}>
            <button className="btn btn-secondary" type="button" onClick={prevStep} disabled={step === 0}>
              Back
            </button>
            {step < steps.length - 1 ? (
              <button className="btn btn-primary" type="button" onClick={nextStep}>
                Next
              </button>
            ) : (
              <button className="btn btn-primary" type="submit" disabled={isPending}>
                {isPending ? "Creating account..." : "Create Student Account"}
              </button>
            )}
          </div>
        </form>

        {message ? (
          <div style={{ marginTop: "1rem" }}>
            <p style={{ color: "#b91c1c", marginBottom: "0.5rem" }}>{message}</p>
          </div>
        ) : null}

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
