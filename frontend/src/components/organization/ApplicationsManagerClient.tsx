"use client";

import { useMemo, useState, useTransition } from "react";
import {
  confirmOrganizationPlacement,
  updateOrganizationApplicationStatus
} from "@/lib/api";

type OrganizationApplication = {
  id: string;
  status: string;
  createdAt: string;
  student: { firstName: string; lastName: string; department: string; level: string };
  placement: { id: string; title: string; status: string };
};

type Props = {
  applications: OrganizationApplication[];
  token?: string;
};

export function ApplicationsManagerClient({ applications, token }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [rows, setRows] = useState(applications);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (statusFilter === "ALL") return rows;
    return rows.filter((row) => row.status === statusFilter);
  }, [rows, statusFilter]);

  function updateStatus(id: string, status: string) {
    setRows((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  }

  function onAction(
    applicationId: string,
    nextStatus: "UNDER_REVIEW" | "ACCEPTED" | "REJECTED" | "PLACEMENT_CONFIRMED"
  ) {
    if (!token) {
      setFeedback("Sign in as organization to update application status.");
      return;
    }

    startTransition(async () => {
      try {
        if (nextStatus === "PLACEMENT_CONFIRMED") {
          await confirmOrganizationPlacement(token, applicationId);
        } else {
          await updateOrganizationApplicationStatus(token, applicationId, nextStatus);
        }
        updateStatus(applicationId, nextStatus);
        setFeedback("Application updated.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Failed to update application");
      }
    });
  }

  return (
    <main className="app-container" style={{ paddingBottom: "2rem" }}>
      <section className="card">
        <h2 className="section-title">Applications Manager</h2>
        <p className="section-subtitle">
          Review incoming applications and process candidate status changes.
        </p>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.8rem" }}>
          {["ALL", "SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "REJECTED", "PLACEMENT_CONFIRMED"].map(
            (status) => (
              <button
                key={status}
                className={`btn ${statusFilter === status ? "btn-primary" : "btn-secondary"}`}
                type="button"
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            )
          )}
        </div>

        <div style={{ marginTop: "0.9rem", display: "grid", gap: "0.7rem" }}>
          {filtered.map((item) => (
            <article key={item.id} className="card">
              <h3 style={{ marginTop: 0 }}>
                {item.student.firstName} {item.student.lastName}
              </h3>
              <p style={{ margin: "0 0 0.25rem", color: "#4B5563" }}>
                {item.student.department} • {item.student.level}
              </p>
              <p style={{ margin: "0 0 0.25rem", color: "#4B5563" }}>
                Placement: {item.placement.title}
              </p>
              <p style={{ margin: "0 0 0.55rem", color: "#4B5563" }}>
                Status: <strong>{item.status}</strong> • Applied{" "}
                {new Date(item.createdAt).toLocaleDateString()}
              </p>

              <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                {(["UNDER_REVIEW", "ACCEPTED", "REJECTED", "PLACEMENT_CONFIRMED"] as const).map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={isPending || item.status === status}
                      className={`btn ${status === "REJECTED" ? "btn-danger" : "btn-secondary"}`}
                      onClick={() => onAction(item.id, status)}
                    >
                      {status}
                    </button>
                  )
                )}
              </div>
            </article>
          ))}
          {filtered.length === 0 ? (
            <p style={{ margin: 0, color: "#6B7280" }}>No applications found for this status.</p>
          ) : null}
        </div>

        {feedback ? <p style={{ marginBottom: 0, color: "#4B5563" }}>{feedback}</p> : null}
      </section>
    </main>
  );
}
