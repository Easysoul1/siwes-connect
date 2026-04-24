"use client";

import { useEffect, useState, useTransition } from "react";
import { PlacementSearchClient } from "@/components/student/PlacementSearchClient";
import { useAuth } from "@/components/providers/AuthProvider";
import { getMatchedPlacements } from "@/lib/api";
import { ScoredPlacement } from "@/lib/types";

export default function StudentPlacementsPage() {
  const { session } = useAuth();
  const [placements, setPlacements] = useState<ScoredPlacement[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!session?.accessToken) return;

    startTransition(async () => {
      try {
        const data = await getMatchedPlacements(session.accessToken);
        setPlacements(data);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load placements.");
      }
    });
  }, [session?.accessToken]);

  if (!session?.accessToken) {
    return (
      <main className="app-container">
        <section className="card">
          <p style={{ margin: 0, color: "#6B7280" }}>
            Sign in as student to load placements.
          </p>
        </section>
      </main>
    );
  }

  if (message && !placements.length && !isPending) {
    return (
      <main className="app-container">
        <section className="card">
          <p style={{ margin: 0, color: "#6B7280" }}>{message}</p>
        </section>
      </main>
    );
  }

  return <PlacementSearchClient placements={placements} token={session.accessToken} />;
}
