"use client";

import { FormEvent, useState, useTransition } from "react";
import Link from "next/link";
import { createPlacement } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { NIGERIAN_STATES } from "@/shared/constants/states";

const steps = ["Basic Info", "Requirements", "Slots & Timeline", "Location", "Compensation", "Review"];

export default function NewPlacementPage() {
  const { session } = useAuth();
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    title: "",
    description: "",
    requiredDepartment: "",
    level: "",
    cgpa: "",
    responsibilities: "",
    requirements: "",
    totalSlots: "1",
    startDate: "",
    durationWeeks: "",
    deadline: "",
    state: "",
    lga: "",
    remote: false,
    hasStipend: false,
    stipendAmount: ""
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session?.accessToken) {
      setMessage("Sign in as organization to create placements.");
      return;
    }

    startTransition(async () => {
      try {
        await createPlacement(session.accessToken, {
          title: form.title,
          description: form.description,
          requiredDepartment: form.requiredDepartment || undefined,
          totalSlots: Number(form.totalSlots),
          state: form.state,
          applicationDeadline: new Date(form.deadline).toISOString(),
          isRemote: form.remote
        });
        setMessage("Placement created successfully.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to create placement");
      }
    });
  }

  return (
    <main className="app-container" style={{ paddingBottom: "2rem" }}>
      <Link href="/organization/placements" className="btn btn-secondary" style={{ display: "inline-flex", marginBottom: "0.8rem" }}>
        Back to Placements
      </Link>

      <section className="card">
        <h2 className="section-title">Create Placement</h2>
        <p className="section-subtitle">Step {step + 1} of {steps.length}: {steps[step]}</p>

        <form onSubmit={onSubmit} style={{ marginTop: "1rem", display: "grid", gap: "0.85rem" }}>
          {step === 0 ? (
            <div className="form-grid">
              <div>
                <label className="label">Title</label>
                <input className="input" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="label">Description</label>
                <textarea className="textarea" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="form-grid">
              <div>
                <label className="label">Required Department</label>
                <input className="input" value={form.requiredDepartment} onChange={(event) => setForm((prev) => ({ ...prev, requiredDepartment: event.target.value }))} />
              </div>
              <div>
                <label className="label">Preferred Level</label>
                <input className="input" value={form.level} onChange={(event) => setForm((prev) => ({ ...prev, level: event.target.value }))} />
              </div>
              <div>
                <label className="label">Minimum CGPA</label>
                <input className="input" value={form.cgpa} onChange={(event) => setForm((prev) => ({ ...prev, cgpa: event.target.value }))} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="label">Responsibilities</label>
                <textarea className="textarea" value={form.responsibilities} onChange={(event) => setForm((prev) => ({ ...prev, responsibilities: event.target.value }))} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="label">Requirements</label>
                <textarea className="textarea" value={form.requirements} onChange={(event) => setForm((prev) => ({ ...prev, requirements: event.target.value }))} />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="form-grid">
              <div>
                <label className="label">Total Slots</label>
                <input className="input" type="number" min={1} value={form.totalSlots} onChange={(event) => setForm((prev) => ({ ...prev, totalSlots: event.target.value }))} />
              </div>
              <div>
                <label className="label">Start Date</label>
                <input className="input" type="date" value={form.startDate} onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))} />
              </div>
              <div>
                <label className="label">Duration (weeks)</label>
                <input className="input" type="number" value={form.durationWeeks} onChange={(event) => setForm((prev) => ({ ...prev, durationWeeks: event.target.value }))} />
              </div>
              <div>
                <label className="label">Application Deadline</label>
                <input className="input" type="date" value={form.deadline} onChange={(event) => setForm((prev) => ({ ...prev, deadline: event.target.value }))} />
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="form-grid">
              <div>
                <label className="label">State</label>
                <select className="select" value={form.state} onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value }))}>
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
                <input className="input" value={form.lga} onChange={(event) => setForm((prev) => ({ ...prev, lga: event.target.value }))} />
              </div>
              <div style={{ alignSelf: "end" }}>
                <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input type="checkbox" checked={form.remote} onChange={(event) => setForm((prev) => ({ ...prev, remote: event.target.checked }))} />
                  Remote Placement
                </label>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="form-grid">
              <div>
                <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input type="checkbox" checked={form.hasStipend} onChange={(event) => setForm((prev) => ({ ...prev, hasStipend: event.target.checked }))} />
                  Includes stipend
                </label>
              </div>
              {form.hasStipend ? (
                <div>
                  <label className="label">Stipend Amount</label>
                  <input className="input" value={form.stipendAmount} onChange={(event) => setForm((prev) => ({ ...prev, stipendAmount: event.target.value }))} />
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 5 ? (
            <div className="card">
              <p style={{ marginTop: 0, color: "#4B5563" }}>
                Review summary before publishing:
              </p>
              <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "#4B5563" }}>
                <li>{form.title || "Untitled role"}</li>
                <li>{form.state || "State not set"} {form.remote ? "(Remote)" : ""}</li>
                <li>{form.totalSlots} slots • Deadline {form.deadline || "not set"}</li>
              </ul>
            </div>
          ) : null}

          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.7rem" }}>
            <button className="btn btn-secondary" type="button" onClick={() => setStep((prev) => Math.max(prev - 1, 0))} disabled={step === 0}>
              Back
            </button>
            {step < steps.length - 1 ? (
              <button className="btn btn-primary" type="button" onClick={() => setStep((prev) => Math.min(prev + 1, steps.length - 1))}>
                Next
              </button>
            ) : (
              <button className="btn btn-primary" type="submit" disabled={isPending}>
                {isPending ? "Publishing..." : "Publish Placement"}
              </button>
            )}
          </div>
        </form>

        {message ? <p style={{ marginBottom: 0, color: "#4B5563" }}>{message}</p> : null}
      </section>
    </main>
  );
}
