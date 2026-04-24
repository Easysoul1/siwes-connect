"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { updatePlacementStatus } from "@/lib/api";

type PlacementItem = {
  id: string;
  title: string;
  status: "DRAFT" | "ACTIVE" | "CLOSED";
  totalSlots: number;
  filledSlots: number;
  state: string;
  description?: string;
  applicationDeadline?: string;
  isRemote?: boolean;
};

type Props = {
  placements: PlacementItem[];
  token?: string;
};

export function PlacementsManagerClient({ placements, token }: Props) {
  const [items, setItems] = useState(placements);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useGSAP(() => {
    gsap.from(".org-placement-card", {
      y: 18,
      opacity: 0,
      duration: 0.4,
      stagger: 0.06,
      ease: "power2.out"
    });
  }, [items, statusFilter]);

  const filtered = useMemo(() => {
    if (statusFilter === "ALL") return items;
    return items.filter((item) => item.status === statusFilter);
  }, [items, statusFilter]);

  function handleStatusChange(id: string, nextStatus: PlacementItem["status"]) {
    if (!token) {
      setFeedback("Sign in as organization to update placement status.");
      return;
    }

    startTransition(async () => {
      try {
        await updatePlacementStatus(token, id, nextStatus);
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
        );
        setFeedback("Placement status updated.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Failed to update status.");
      }
    });
  }

  return (
    <main style={{ maxWidth: 1040, margin: "0 auto", padding: "2.2rem 1.2rem 3rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Placement Management</h1>
          <p style={{ margin: "0.35rem 0 0", color: "#4B5563" }}>
            Track role status, capacity, and publishing workflow from one screen.
          </p>
        </div>
        <Link href="/organization/placements/new" className="btn btn-primary">
          Create Placement
        </Link>
      </header>

      {feedback ? <p style={{ marginTop: 0, color: "#4B5563" }}>{feedback}</p> : null}

      <section style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {["ALL", "DRAFT", "ACTIVE", "CLOSED"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            type="button"
            style={{
              border: "1px solid #D1D5DB",
              borderRadius: 999,
              padding: "0.4rem 0.8rem",
              background: statusFilter === status ? "#ECFDF5" : "white",
              color: statusFilter === status ? "#065F46" : "#111827"
            }}
          >
            {status}
          </button>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
        {filtered.map((item) => {
          const remaining = item.totalSlots - item.filledSlots;
          return (
            <article
              className="org-placement-card"
              key={item.id}
              style={{ border: "1px solid #E5E7EB", borderRadius: 12, background: "white", padding: "0.95rem" }}
            >
              <p style={{ margin: 0, color: "#6B7280", fontSize: 13 }}>{item.state}</p>
              <h3 style={{ margin: "0.45rem 0 0.2rem" }}>{item.title}</h3>
              <p style={{ margin: "0.2rem 0 0.6rem", color: "#4B5563", fontSize: 14 }}>
                Status: <strong>{item.status}</strong>
              </p>
              <p style={{ margin: 0, fontSize: 14 }}>
                Slots: {item.filledSlots}/{item.totalSlots} ({remaining} remaining)
              </p>
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                {(["DRAFT", "ACTIVE", "CLOSED"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={isPending || item.status === status}
                    onClick={() => handleStatusChange(item.id, status)}
                    style={{
                      border: "1px solid #D1D5DB",
                      borderRadius: 8,
                      padding: "0.3rem 0.55rem",
                      background: item.status === status ? "#ECFDF5" : "white",
                      color: "#111827",
                      fontSize: 12,
                      opacity: isPending ? 0.7 : 1
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <Link
                href={`/organization/placements/${item.id}/edit`}
                className="btn btn-secondary"
                style={{ marginTop: 8, display: "inline-flex" }}
              >
                Edit placement
              </Link>
            </article>
          );
        })}
      </section>
    </main>
  );
}
