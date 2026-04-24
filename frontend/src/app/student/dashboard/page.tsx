"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { getRecommendedPlacements, getStudentDashboardStats } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { ScoredPlacement, StudentDashboardStats } from "@/lib/types";

export default function StudentDashboardPage() {
  const { session } = useAuth();
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [recommended, setRecommended] = useState<ScoredPlacement[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!session?.accessToken) return;
    startTransition(async () => {
      try {
        const [statsRes, recommendedRes] = await Promise.all([
          getStudentDashboardStats(session.accessToken),
          getRecommendedPlacements(session.accessToken)
        ]);
        setStats(statsRes);
        setRecommended(recommendedRes);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load dashboard.");
      }
    });
  }, [session?.accessToken]);

  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "2.2rem 1.2rem 3rem" }}>
      <h1 style={{ marginBottom: 8 }}>Student Dashboard</h1>
      <p style={{ marginTop: 0, color: "#4B5563" }}>
        Track your application progress and top-matched opportunities.
      </p>

      {stats ? (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
            gap: 10,
            marginBottom: 18
          }}
        >
          {[
            ["Total", stats.totalApplications],
            ["Submitted", stats.submitted],
            ["Under Review", stats.underReview],
            ["Accepted", stats.accepted],
            ["Rejected", stats.rejected],
            ["Confirmed", stats.placementConfirmed]
          ].map(([label, value]) => (
            <article
              key={String(label)}
              style={{ border: "1px solid #E5E7EB", borderRadius: 12, background: "white", padding: "0.9rem" }}
            >
              <p style={{ margin: "0 0 0.35rem", color: "#6B7280", fontSize: 13 }}>{label}</p>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 22 }}>{value}</p>
            </article>
          ))}
        </section>
      ) : session?.accessToken ? (
        <p style={{ color: "#6B7280" }}>{isPending ? "Loading dashboard..." : message ?? "No data available yet."}</p>
      ) : (
        <p style={{ color: "#6B7280" }}>
          Sign in as a student to load dashboard metrics.
        </p>
      )}

      <section style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <Link href="/student/placements" className="btn btn-primary">
          Search Placements
        </Link>
        <Link href="/student/applications" className="btn btn-secondary">
          My Applications
        </Link>
      </section>

      <section>
        <h2 style={{ marginBottom: 8 }}>Recommended Placements</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 10 }}>
          {recommended.map((entry) => (
            <article
              key={entry.placement.id}
              style={{ border: "1px solid #E5E7EB", borderRadius: 12, background: "white", padding: "0.9rem" }}
            >
              <h3 style={{ margin: "0 0 0.35rem" }}>{entry.placement.title}</h3>
              <p style={{ margin: "0 0 0.35rem", color: "#4B5563" }}>
                {entry.placement.state} {entry.placement.isRemote ? "• Remote" : ""}
              </p>
              <p style={{ margin: 0, color: "#4B5563" }}>Match score: {entry.matchScore}%</p>
            </article>
          ))}
          {recommended.length === 0 ? (
            <p style={{ margin: 0, color: "#6B7280" }}>No recommendations yet.</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
