"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { approveOrganization, rejectOrganization } from "@/lib/api";

type OrganizationItem = {
  id: string;
  companyName: string;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
};

type Props = {
  organizations: OrganizationItem[];
  token?: string;
};

export function OrganizationApprovalClient({ organizations, token }: Props) {
  const [items, setItems] = useState(organizations);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error">("success");
  const [isPending, startTransition] = useTransition();

  useGSAP(() => {
    gsap.from(".org-approval-card", {
      y: 16,
      opacity: 0,
      duration: 0.35,
      stagger: 0.05
    });
  }, [filter, items]);

  const rows = useMemo(() => {
    if (filter === "ALL") return items;
    return items.filter((item) => item.verificationStatus === filter);
  }, [filter, items]);

  function setStatus(id: string, status: OrganizationItem["verificationStatus"]) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, verificationStatus: status } : item))
    );
  }

  function handleApprove(id: string) {
    if (!token) {
      setFeedback("Sign in as coordinator to moderate organizations.");
      return;
    }
    startTransition(async () => {
      try {
        await approveOrganization(token, id);
        setStatus(id, "APPROVED");
        setFeedbackTone("success");
        setFeedback("Organization approved.");
      } catch (error) {
        setFeedbackTone("error");
        setFeedback(error instanceof Error ? error.message : "Approval failed.");
      }
    });
  }

  function handleReject(id: string) {
    if (!token) {
      setFeedback("Sign in as coordinator to moderate organizations.");
      return;
    }
    startTransition(async () => {
      try {
        await rejectOrganization(token, id, "Requirements not met");
        setStatus(id, "REJECTED");
        setFeedbackTone("success");
        setFeedback("Organization rejected.");
      } catch (error) {
        setFeedbackTone("error");
        setFeedback(error instanceof Error ? error.message : "Rejection failed.");
      }
    });
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "2.2rem 1.2rem 3rem" }}>
      <h1 style={{ marginBottom: 6 }}>Organization Management</h1>
      <p style={{ marginTop: 0, color: "#4B5563" }}>Review organizations and moderate verification status.</p>

      {feedback ? (
        <p style={{ marginTop: 0, color: feedbackTone === "success" ? "#065F46" : "#B91C1C" }}>
          {feedback}
        </p>
      ) : null}

      <section style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            style={{
              border: "1px solid #D1D5DB",
              borderRadius: 999,
              padding: "0.4rem 0.8rem",
              background: filter === status ? "#ECFDF5" : "#FFFFFF"
            }}
          >
            {status}
          </button>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
        {rows.map((org) => (
          <article
            className="org-approval-card"
            key={org.id}
            style={{ border: "1px solid #E5E7EB", borderRadius: 12, background: "white", padding: "0.95rem" }}
          >
            <h3 style={{ margin: "0 0 0.4rem" }}>{org.companyName}</h3>
            <p style={{ margin: "0 0 0.9rem", color: "#4B5563" }}>Status: {org.verificationStatus}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => handleApprove(org.id)}
                disabled={isPending}
                style={{
                  border: "none",
                  borderRadius: 8,
                  padding: "0.45rem 0.65rem",
                  background: "#059669",
                  color: "white",
                  opacity: isPending ? 0.7 : 1
                }}
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => handleReject(org.id)}
                disabled={isPending}
                style={{
                  border: "1px solid #FCA5A5",
                  borderRadius: 8,
                  padding: "0.45rem 0.65rem",
                  background: "#FEF2F2",
                  color: "#B91C1C",
                  opacity: isPending ? 0.7 : 1
                }}
              >
                Reject
              </button>
            </div>
            <Link
              href={`/coordinator/organizations/${org.id}`}
              className="btn btn-secondary"
              style={{ marginTop: 8, display: "inline-flex" }}
            >
              View detail
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
