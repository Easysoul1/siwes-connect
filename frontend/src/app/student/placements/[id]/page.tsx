"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { applyToPlacementDetailed, getPlacementDetail } from "@/lib/api";
import { Placement } from "@/lib/types";
import { useAuth } from "@/components/providers/AuthProvider";

type PlacementDetail = Placement & {
  organization?: {
    id: string;
    companyName: string;
    verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  };
};

export default function StudentPlacementDetailPage() {
  const params = useParams<{ id: string }>();
  const { session } = useAuth();
  const [placement, setPlacement] = useState<PlacementDetail | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showApply, setShowApply] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!params?.id) return;
    startTransition(async () => {
      try {
        const detail = await getPlacementDetail(params.id);
        setPlacement(detail);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to load placement");
      }
    });
  }, [params?.id]);

  function submitApplication() {
    if (!session?.accessToken || !placement) {
      setFeedback("Sign in as student to submit an application.");
      return;
    }
    startTransition(async () => {
      try {
        await applyToPlacement(session.accessToken, placement.id);
        await applyToPlacementDetailed(session.accessToken, {
          placementId: placement.id,
          coverLetter: coverLetter || undefined
        });
        setShowApply(false);
        setFeedback("Application submitted successfully.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Application failed");
      }
    });
  }

  return (
    <main className="app-container" style={{ paddingBottom: "2rem" }}>
      <Link href="/student/placements" className="btn btn-secondary" style={{ marginBottom: "0.8rem", display: "inline-flex" }}>
        Back to Placements
      </Link>

      {placement ? (
        <>
          <section className="card" style={{ marginBottom: "0.8rem" }}>
            <h2 className="section-title">{placement.title}</h2>
            <p className="section-subtitle">
              {placement.organization?.companyName ?? "Organization"} • {placement.state}{" "}
              {placement.isRemote ? "• Remote" : ""}
            </p>
            <p style={{ color: "#4B5563", lineHeight: 1.7 }}>{placement.description}</p>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <span className="status-chip chip-review">
                Deadline: {new Date(placement.applicationDeadline).toLocaleDateString()}
              </span>
              <span className="status-chip chip-approved">
                Slots: {placement.filledSlots}/{placement.totalSlots}
              </span>
              {placement.requiredDepartment ? (
                <span className="status-chip chip-pending">
                  Dept: {placement.requiredDepartment}
                </span>
              ) : null}
            </div>
          </section>

          <section className="card">
            <h3 style={{ marginTop: 0 }}>Apply Modal</h3>
            <p style={{ color: "#4B5563" }}>
              Include a short cover letter before submitting your application.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowApply((prev) => !prev)}
            >
              {showApply ? "Close Apply Form" : "Apply for Placement"}
            </button>

            {showApply ? (
              <div style={{ marginTop: "0.8rem", display: "grid", gap: "0.75rem" }}>
                <div>
                  <label className="label">Cover Letter</label>
                  <textarea
                    className="textarea"
                    value={coverLetter}
                    onChange={(event) => setCoverLetter(event.target.value)}
                    placeholder="Introduce yourself and explain your fit for this placement."
                  />
                </div>
                <div>
                  <label className="label">Resume</label>
                  <p style={{ margin: 0, color: "#6B7280", fontSize: 13 }}>
                    Your current profile resume will be used.
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={submitApplication}
                  disabled={isPending}
                >
                  {isPending ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            ) : null}
          </section>
        </>
      ) : (
        <section className="card">
          <p style={{ margin: 0, color: "#4B5563" }}>
            {feedback ?? "Loading placement details..."}
          </p>
        </section>
      )}

      {feedback ? <p style={{ color: "#4B5563" }}>{feedback}</p> : null}
    </main>
  );
}
