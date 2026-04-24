"use client";

import { useEffect, useState, useTransition } from "react";
import { PlacementsManagerClient } from "@/components/organization/PlacementsManagerClient";
import { useAuth } from "@/components/providers/AuthProvider";
import { getOrganizationPlacements } from "@/lib/api";
import { Placement } from "@/lib/types";

export default function OrganizationPlacementsPage() {
  const { session } = useAuth();
  const [placements, setPlacements] = useState<Array<Placement & { status: "DRAFT" | "ACTIVE" | "CLOSED" }>>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!session?.accessToken) return;
    startTransition(async () => {
      try {
        const data = await getOrganizationPlacements(session.accessToken);
        setPlacements(
          data.map((item) => ({
            ...item,
            status: item.status ?? "DRAFT"
          }))
        );
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
            Sign in as organization to load placements.
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

  return <PlacementsManagerClient placements={placements} token={session.accessToken} />;
}
