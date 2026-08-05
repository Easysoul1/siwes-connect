"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { ApplicationItem } from "@/lib/types";
import { withdrawApplication } from "@/lib/api";
import Toast from "@/components/shared/Toast";

type Props = {
  initialApplications: ApplicationItem[];
  token?: string;
};

export function ApplicationsClient({ initialApplications, token }: Props) {
  const [applications, setApplications] = useState(initialApplications);
  useEffect(() => setApplications(initialApplications), [initialApplications]);
  const [toastMsg, setToastMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();
  const dismissToast = useCallback(() => setToastMsg(null), []);

  function handleWithdraw(applicationId: string) {
    if (!token) {
      setToastMsg({ message: "Sign in as student to withdraw applications.", type: "error" });
      return;
    }

    startTransition(async () => {
      try {
        await withdrawApplication(token, applicationId);
        setApplications((prev) =>
          prev.map((item) =>
            item.id === applicationId ? { ...item, status: "WITHDRAWN" } : item
          )
        );
        setToastMsg({ message: "Application withdrawn.", type: "success" });
      } catch (error) {
        setToastMsg({ message: error instanceof Error ? error.message : "Unable to withdraw application.", type: "error" });
      }
    });
  }

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "2.2rem 1.2rem 3rem" }}>
      <h1 style={{ marginBottom: 6 }}>My Applications</h1>
      <p style={{ marginTop: 0, color: "#4B5563" }}>
        Track all submitted applications and withdraw eligible ones.
      </p>

      <section style={{ display: "grid", gap: 10 }}>
        {applications.map((item) => {
          const canWithdraw =
            item.status !== "WITHDRAWN" &&
            item.status !== "ACCEPTED" &&
            item.status !== "PLACEMENT_CONFIRMED";

          return (
            <article
              key={item.id}
              style={{
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                background: "white",
                padding: "0.95rem"
              }}
            >
              <h3 style={{ margin: "0 0 0.4rem" }}>{item.placement.title}</h3>
              <p style={{ margin: "0 0 0.3rem", color: "#4B5563" }}>
                {item.placement.organization?.companyName ?? "Organization"} • {item.placement.state}
              </p>
              <p style={{ margin: 0, color: "#4B5563" }}>
                Status: <strong>{item.status}</strong>
              </p>
              <button
                type="button"
                disabled={!canWithdraw || isPending}
                onClick={() => handleWithdraw(item.id)}
                style={{
                  marginTop: 10,
                  border: "1px solid #FCA5A5",
                  borderRadius: 8,
                  padding: "0.45rem 0.65rem",
                  background: canWithdraw ? "#FEF2F2" : "#F3F4F6",
                  color: canWithdraw ? "#B91C1C" : "#6B7280",
                  opacity: isPending ? 0.7 : 1
                }}
              >
                Withdraw
              </button>
              <Link
                href={`/student/applications/${item.id}`}
                className="btn btn-secondary"
                style={{ marginTop: 8, display: "inline-flex" }}
              >
                View Detail
              </Link>
            </article>
          );
        })}
        {applications.length === 0 ? (
          <p style={{ margin: 0, color: "#6B7280" }}>
            No applications yet. Start from the placements page.
          </p>
        ) : null}
      </section>

      {toastMsg ? <Toast message={toastMsg.message} type={toastMsg.type} onDismiss={dismissToast} /> : null}
    </main>
  );
}
