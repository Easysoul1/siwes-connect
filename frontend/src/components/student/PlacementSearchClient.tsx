"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScoredPlacement } from "@/lib/types";
import { applyToPlacement } from "@/lib/api";

type Props = {
  placements: ScoredPlacement[];
  token?: string;
};

export function PlacementSearchClient({ placements, token }: Props) {
  const [query, setQuery] = useState("");
  const [onlyRemote, setOnlyRemote] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useGSAP(() => {
    gsap.from(".placement-card", {
      y: 20,
      opacity: 0,
      duration: 0.45,
      ease: "power2.out",
      stagger: 0.06
    });
  }, [placements]);

  const filtered = useMemo(() => {
    return placements.filter((entry) => {
      const q = query.toLowerCase().trim();
      const titleMatch = entry.placement.title.toLowerCase().includes(q);
      const stateMatch = entry.placement.state.toLowerCase().includes(q);
      const remoteMatch = !onlyRemote || entry.placement.isRemote;
      return (titleMatch || stateMatch) && remoteMatch;
    });
  }, [onlyRemote, placements, query]);

  function handleApply(placementId: string) {
    if (!token) {
      setFeedback("Sign in as student to submit applications.");
      return;
    }

    startTransition(async () => {
      try {
        await applyToPlacement(token, placementId);
        setFeedback("Application submitted successfully.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Failed to submit application.");
      }
    });
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "2.3rem 1.25rem 3rem" }}>
      <header style={{ marginBottom: 18 }}>
        <h1 style={{ marginBottom: 4 }}>Placement Search</h1>
        <p style={{ margin: 0, color: "#4B5563" }}>Find high-fit SIWES opportunities ranked by match score.</p>
      </header>

      <section
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 14
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid #D1D5DB",
            borderRadius: 10,
            padding: "0.55rem 0.75rem",
            background: "white"
          }}
        >
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title or state"
            style={{ border: "none", outline: "none", minWidth: 240 }}
          />
        </label>
        <button
          type="button"
          onClick={() => setOnlyRemote((prev) => !prev)}
          style={{
            border: "1px solid #D1D5DB",
            borderRadius: 10,
            padding: "0.55rem 0.9rem",
            background: onlyRemote ? "#ECFDF5" : "white",
            color: onlyRemote ? "#065F46" : "#111827",
            fontWeight: 600
          }}
        >
          Remote only
        </button>
      </section>

      {feedback ? (
        <p style={{ margin: "0 0 14px", color: feedback.includes("success") ? "#065F46" : "#B91C1C" }}>
          {feedback}
        </p>
      ) : null}

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        {filtered.map((entry) => {
          const slots = entry.placement.totalSlots - entry.placement.filledSlots;
          return (
            <article
              className="placement-card"
              key={entry.placement.id}
              style={{ border: "1px solid #E5E7EB", borderRadius: 12, background: "white", padding: "0.95rem" }}
            >
              <p style={{ margin: 0, color: "#6B7280", fontSize: 13 }}>{entry.placement.state}</p>
              <h3 style={{ margin: "0.45rem 0 0.35rem" }}>{entry.placement.title}</h3>
              <p style={{ color: "#4B5563", marginTop: 0, lineHeight: 1.5 }}>{entry.placement.description}</p>
              <p style={{ margin: "0.5rem 0", fontSize: 14 }}>
                <strong>{slots}</strong> slots left {entry.placement.isRemote ? "• Remote" : ""}
              </p>
              <div style={{ marginTop: 8 }}>
                <p style={{ margin: "0 0 6px", fontSize: 13, color: "#374151" }}>Match score: {entry.matchScore}%</p>
                <div style={{ height: 8, borderRadius: 999, background: "#E5E7EB", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.min(entry.matchScore, 100)}%`,
                      height: "100%",
                      background: "linear-gradient(90deg,#10B981,#3B82F6)"
                    }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleApply(entry.placement.id)}
                disabled={isPending}
                style={{
                  marginTop: 10,
                  border: "none",
                  borderRadius: 8,
                  background: "#059669",
                  color: "white",
                  fontWeight: 700,
                  padding: "0.55rem 0.75rem",
                  width: "100%",
                  opacity: isPending ? 0.7 : 1,
                  cursor: isPending ? "not-allowed" : "pointer"
                }}
              >
                {isPending ? "Submitting..." : "Apply now"}
              </button>
              <Link
                href={`/student/placements/${entry.placement.id}`}
                className="btn btn-secondary"
                style={{ marginTop: 8, width: "100%", textAlign: "center", display: "inline-block" }}
              >
                View details
              </Link>
            </article>
          );
        })}
      </section>
    </main>
  );
}
