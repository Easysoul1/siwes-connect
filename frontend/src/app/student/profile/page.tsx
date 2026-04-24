"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  getStudentProfile,
  updateStudentPreferences,
  updateStudentProfile
} from "@/lib/api";
import { NIGERIAN_STATES } from "@/shared/constants/states";

export default function StudentProfilePage() {
  const { session } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    department: "",
    level: "",
    cgpa: "",
    currentState: "",
    preferredStates: [] as string[]
  });

  useEffect(() => {
    if (!session?.accessToken) return;

    startTransition(async () => {
      try {
        const profile = await getStudentProfile(session.accessToken);
        setForm({
          firstName: profile.firstName,
          lastName: profile.lastName,
          department: profile.department,
          level: profile.level,
          cgpa: String(profile.cgpa ?? ""),
          currentState: profile.currentState,
          preferredStates: profile.preferredStates
        });
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load profile");
      }
    });
  }, [session?.accessToken]);

  function toggleState(state: string) {
    setForm((prev) => ({
      ...prev,
      preferredStates: prev.preferredStates.includes(state)
        ? prev.preferredStates.filter((item) => item !== state)
        : [...prev.preferredStates, state]
    }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session?.accessToken) {
      setMessage("Sign in to update profile.");
      return;
    }

    startTransition(async () => {
      try {
        await updateStudentProfile(session.accessToken, {
          firstName: form.firstName,
          lastName: form.lastName,
          department: form.department,
          level: form.level,
          cgpa: form.cgpa ? Number(form.cgpa) : undefined,
          currentState: form.currentState
        });
        await updateStudentPreferences(session.accessToken, {
          currentState: form.currentState,
          preferredStates: form.preferredStates
        });
        setMessage("Profile updated successfully.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Failed to update profile");
      }
    });
  }

  return (
    <main className="app-container" style={{ paddingBottom: "2rem" }}>
      <section className="card">
        <h2 className="section-title">Profile Settings</h2>
        <p className="section-subtitle" style={{ marginBottom: "1rem" }}>
          Keep your personal and location preferences up to date.
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.9rem" }}>
          <div className="form-grid">
            <div>
              <label className="label">First Name</label>
              <input
                className="input"
                value={form.firstName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, firstName: event.target.value }))
                }
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
              />
            </div>
            <div>
              <label className="label">Department</label>
              <input
                className="input"
                value={form.department}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, department: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="label">Level</label>
              <input
                className="input"
                value={form.level}
                onChange={(event) => setForm((prev) => ({ ...prev, level: event.target.value }))}
              />
            </div>
            <div>
              <label className="label">CGPA</label>
              <input
                className="input"
                type="number"
                min={0}
                max={5}
                step="0.01"
                value={form.cgpa}
                onChange={(event) => setForm((prev) => ({ ...prev, cgpa: event.target.value }))}
              />
            </div>
            <div>
              <label className="label">Current State</label>
              <select
                className="select"
                value={form.currentState}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, currentState: event.target.value }))
                }
              >
                <option value="">Select state</option>
                {NIGERIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Preferred States</label>
            <div className="card-grid">
              {NIGERIAN_STATES.map((state) => {
                const selected = form.preferredStates.includes(state);
                return (
                  <button
                    type="button"
                    key={state}
                    className={`btn ${selected ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => toggleState(state)}
                  >
                    {state.replaceAll("_", " ")}
                  </button>
                );
              })}
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Profile"}
          </button>
        </form>

        {message ? <p style={{ marginBottom: 0, color: "#4B5563" }}>{message}</p> : null}
      </section>
    </main>
  );
}
