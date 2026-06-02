"use client";

import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getCoordinatorAnalytics } from "@/lib/api";
import { CoordinatorAnalytics } from "@/lib/types";
import { StatsGridSkeleton } from "@/components/shared/Skeleton";

export default function CoordinatorAnalyticsPage() {
  const { session } = useAuth();
  const [analytics, setAnalytics] = useState<CoordinatorAnalytics | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!session?.accessToken) return;
    startTransition(async () => {
      try {
        const data = await getCoordinatorAnalytics(session.accessToken);
        setAnalytics(data);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load analytics.");
      }
    });
  }, [session?.accessToken]);

  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "2.2rem 1.2rem 3rem" }}>
      <h1 style={{ marginBottom: 8 }}>Coordinator Analytics</h1>
      <p style={{ marginTop: 0, color: "#4B5563" }}>
        Program-wide metrics with application and state-level distribution.
      </p>

      {!analytics ? (
        session?.accessToken ? (
          isPending ? (
            <StatsGridSkeleton count={6} />
          ) : (
            <p style={{ color: "#6B7280" }}>{message ?? "No analytics data available."}</p>
          )
        ) : (
          <p style={{ color: "#6B7280" }}>Sign in as coordinator to load analytics.</p>
        )
      ) : (
        <>
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: 10,
              marginBottom: 16
            }}
          >
            {Object.entries(analytics.overview).map(([key, value]) => (
              <article
                key={key}
                style={{ border: "1px solid #E5E7EB", borderRadius: 12, background: "white", padding: "0.9rem" }}
              >
                <p style={{ margin: "0 0 0.35rem", color: "#6B7280", fontSize: 13 }}>
                  {key.replace(/([A-Z])/g, " $1")}
                </p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 22 }}>{value}</p>
              </article>
            ))}
          </section>

          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
            <article style={{ border: "1px solid #E5E7EB", borderRadius: 12, background: "white", padding: "0.9rem" }}>
              <h2 style={{ marginTop: 0 }}>Placements by State</h2>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {analytics.placementByState.map((entry) => (
                  <li key={entry.state}>
                    {entry.state}: {entry.count}
                  </li>
                ))}
              </ul>
            </article>

            <article style={{ border: "1px solid #E5E7EB", borderRadius: 12, background: "white", padding: "0.9rem" }}>
              <h2 style={{ marginTop: 0 }}>Applications by Status</h2>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {analytics.applicationByStatus.map((entry) => (
                  <li key={entry.status}>
                    {entry.status}: {entry.count}
                  </li>
                ))}
              </ul>
            </article>
          </section>
        </>
      )}
    </main>
  );
}
