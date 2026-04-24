"use client";

import { useState, useTransition } from "react";
import { confirmOrganizationPlacement, updateOrganizationApplicationStatus } from "@/lib/api";
import { OrganizationDashboardStats } from "@/lib/types";

type OrgApplication = {
  id: string;
  status: string;
  student: { firstName: string; lastName: string; department: string; level: string };
  placement: { title: string };
};

type Props = {
  stats: OrganizationDashboardStats | null;
  applications: OrgApplication[];
  token?: string;
};

export function DashboardClient({ stats, applications, token }: Props) {
  const [items, setItems] = useState(applications);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleStatus(
    applicationId: string,
    status: "UNDER_REVIEW" | "ACCEPTED" | "REJECTED" | "PLACEMENT_CONFIRMED"
  ) {
    if (!token) {
      setFeedback("Sign in as organization to update application status.");
      return;
    }

    startTransition(async () => {
      try {
        if (status === "PLACEMENT_CONFIRMED") {
          await confirmOrganizationPlacement(token, applicationId);
        } else {
          await updateOrganizationApplicationStatus(token, applicationId, status);
        }
        setItems((prev) =>
          prev.map((item) => (item.id === applicationId ? { ...item, status } : item))
        );
        setFeedback("Application status updated.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Failed to update status.");
      }
    });
  }

  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "2.2rem 1.2rem 3rem" }}>
      <h1 style={{ marginBottom: 8 }}>Organization Dashboard</h1>
      <p style={{ marginTop: 0, color: "#4B5563" }}>
        Manage verification state, placement pipeline, and candidate decisions.
      </p>
      {feedback ? <p style={{ color: "#4B5563" }}>{feedback}</p> : null}

      {stats ? (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: 10,
            marginBottom: 16
          }}
        >
          {[
            ["Verification", stats.verificationStatus],
            ["Placements", String(stats.totalPlacements)],
            ["Active Placements", String(stats.activePlacements)],
            ["Applications", String(stats.totalApplications)],
            ["Confirmed", String(stats.acceptedStudents)],
            ["Slots Filled", `${stats.filledSlots}/${stats.totalSlots}`]
          ].map(([label, value]) => (
            <article
              key={label}
              style={{ border: "1px solid #E5E7EB", borderRadius: 12, background: "white", padding: "0.9rem" }}
            >
              <p style={{ margin: "0 0 0.35rem", color: "#6B7280", fontSize: 13 }}>{label}</p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{value}</p>
            </article>
          ))}
        </section>
      ) : (
        <p style={{ color: "#6B7280" }}>
          Sign in as organization to load dashboard metrics.
        </p>
      )}

      <section>
        <h2 style={{ marginBottom: 8 }}>Recent Applications</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((item) => (
            <article
              key={item.id}
              style={{ border: "1px solid #E5E7EB", borderRadius: 12, background: "white", padding: "0.9rem" }}
            >
              <h3 style={{ margin: "0 0 0.4rem" }}>
                {item.student.firstName} {item.student.lastName}
              </h3>
              <p style={{ margin: "0 0 0.3rem", color: "#4B5563" }}>
                {item.student.department} • {item.student.level}
              </p>
              <p style={{ margin: "0 0 0.5rem", color: "#4B5563" }}>
                Placement: {item.placement.title} • Status: <strong>{item.status}</strong>
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(["UNDER_REVIEW", "ACCEPTED", "REJECTED", "PLACEMENT_CONFIRMED"] as const).map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleStatus(item.id, status)}
                      disabled={isPending || item.status === status}
                      style={{
                        border: "1px solid #D1D5DB",
                        borderRadius: 8,
                        padding: "0.35rem 0.55rem",
                        background: item.status === status ? "#ECFDF5" : "white",
                        fontSize: 12,
                        opacity: isPending ? 0.7 : 1
                      }}
                    >
                      {status}
                    </button>
                  )
                )}
              </div>
            </article>
          ))}
          {items.length === 0 ? (
            <p style={{ margin: 0, color: "#6B7280" }}>No applications found yet.</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
