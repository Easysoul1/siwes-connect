"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getStudentApplicationById } from "@/lib/api";
import { ApplicationItem } from "@/lib/types";

export default function StudentApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const { session } = useAuth();
  const [application, setApplication] = useState<ApplicationItem | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!params?.id || !session?.accessToken) return;

    startTransition(async () => {
      try {
        const detail = await getStudentApplicationById(session.accessToken, params.id);
        setApplication(detail);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to fetch application");
      }
    });
  }, [params?.id, session?.accessToken]);

  const steps = ["SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "PLACEMENT_CONFIRMED"];
  const currentStep = application ? steps.indexOf(application.status) : -1;

  return (
    <main className="app-container" style={{ paddingBottom: "2rem" }}>
      <Link href="/student/applications" className="btn btn-secondary" style={{ marginBottom: "0.8rem", display: "inline-flex" }}>
        Back to Applications
      </Link>

      {!session?.accessToken ? (
        <section className="card">
          <p style={{ margin: 0, color: "#4B5563" }}>Sign in as student to view application detail.</p>
        </section>
      ) : application ? (
        <>
          <section className="card" style={{ marginBottom: "0.8rem" }}>
            <h2 className="section-title">{application.placement.title}</h2>
            <p className="section-subtitle">
              {application.placement.organization?.companyName ?? "Organization"} • Status:{" "}
              <strong>{application.status}</strong>
            </p>
            <p style={{ color: "#4B5563", marginBottom: 0 }}>
              Applied on {new Date(application.createdAt).toLocaleString()}
            </p>
          </section>

          <section className="card" style={{ marginBottom: "0.8rem" }}>
            <h3 style={{ marginTop: 0 }}>Status Timeline</h3>
            <div style={{ display: "grid", gap: "0.55rem" }}>
              {steps.map((step, index) => (
                <div
                  key={step}
                  style={{
                    border: "1px solid #E5E7EB",
                    borderRadius: 10,
                    padding: "0.55rem 0.7rem",
                    background: index <= currentStep ? "#ECFDF5" : "white"
                  }}
                >
                  {step}
                </div>
              ))}
              {application.status === "REJECTED" || application.status === "WITHDRAWN" ? (
                <div className="status-chip chip-rejected">{application.status}</div>
              ) : null}
            </div>
          </section>

          <section className="card">
            <h3 style={{ marginTop: 0 }}>Application Summary</h3>
            <p style={{ margin: 0, color: "#4B5563" }}>
              Full timeline, organization notes, and document listing sections are prepared for backend activity logs.
            </p>
          </section>
        </>
      ) : (
        <section className="card">
          <p style={{ margin: 0, color: "#4B5563" }}>
            {isPending ? "Loading..." : feedback ?? "No application found."}
          </p>
        </section>
      )}
    </main>
  );
}
