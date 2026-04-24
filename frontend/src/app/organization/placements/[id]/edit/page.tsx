"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState, useTransition } from "react";
import { getOrganizationPlacementById, updatePlacement } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { NIGERIAN_STATES } from "@/shared/constants/states";

export default function EditPlacementPage() {
  const params = useParams<{ id: string }>();
  const { session } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    requiredDepartment: "",
    state: "",
    totalSlots: "1",
    applicationDeadline: "",
    isRemote: false
  });

  useEffect(() => {
    if (!session?.accessToken || !params?.id) return;

    startTransition(async () => {
      try {
        const placement = await getOrganizationPlacementById(session.accessToken, params.id);
        setForm({
          title: placement.title,
          description: placement.description,
          requiredDepartment: placement.requiredDepartment ?? "",
          state: placement.state,
          totalSlots: String(placement.totalSlots),
          applicationDeadline: placement.applicationDeadline.slice(0, 10),
          isRemote: placement.isRemote
        });
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load placement");
      }
    });
  }, [params?.id, session?.accessToken]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session?.accessToken || !params?.id) {
      setMessage("Sign in as organization to edit placements.");
      return;
    }

    startTransition(async () => {
      try {
        await updatePlacement(session.accessToken, params.id, {
          title: form.title,
          description: form.description,
          requiredDepartment: form.requiredDepartment || undefined,
          state: form.state,
          totalSlots: Number(form.totalSlots),
          applicationDeadline: new Date(form.applicationDeadline).toISOString(),
          isRemote: form.isRemote
        });
        setMessage("Placement updated.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Update failed");
      }
    });
  }

  return (
    <main className="app-container" style={{ paddingBottom: "2rem" }}>
      <Link href="/organization/placements" className="btn btn-secondary" style={{ marginBottom: "0.8rem", display: "inline-flex" }}>
        Back to Placements
      </Link>

      <section className="card">
        <h2 className="section-title">Edit Placement</h2>
        <p className="section-subtitle" style={{ marginBottom: "1rem" }}>
          Update role details, capacity, and deadline before publishing changes.
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.8rem" }}>
          <div className="form-grid">
            <div>
              <label className="label">Title</label>
              <input className="input" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
            </div>
            <div>
              <label className="label">Required Department</label>
              <input className="input" value={form.requiredDepartment} onChange={(event) => setForm((prev) => ({ ...prev, requiredDepartment: event.target.value }))} />
            </div>
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
              <label className="label">Total Slots</label>
              <input className="input" type="number" min={1} value={form.totalSlots} onChange={(event) => setForm((prev) => ({ ...prev, totalSlots: event.target.value }))} />
            </div>
            <div>
              <label className="label">Deadline</label>
              <input className="input" type="date" value={form.applicationDeadline} onChange={(event) => setForm((prev) => ({ ...prev, applicationDeadline: event.target.value }))} />
            </div>
            <div style={{ alignSelf: "end" }}>
              <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input type="checkbox" checked={form.isRemote} onChange={(event) => setForm((prev) => ({ ...prev, isRemote: event.target.checked }))} />
                Remote role
              </label>
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea className="textarea" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
          </div>

          <button className="btn btn-primary" type="submit" disabled={isPending}>
            {isPending ? "Updating..." : "Save Changes"}
          </button>
        </form>

        {message ? <p style={{ marginBottom: 0, color: "#4B5563" }}>{message}</p> : null}
      </section>
    </main>
  );
}
