"use client";

import { PlacementSearchClient } from "@/components/student/PlacementSearchClient";
import { useAuth } from "@/components/providers/AuthProvider";

export default function StudentPlacementsPage() {
  const { session } = useAuth();

  if (!session?.accessToken) {
    return (
      <main className="app-container">
        <section className="card">
          <p style={{ margin: 0, color: "#6B7280" }}>
            Sign in as student to browse placements.
          </p>
        </section>
      </main>
    );
  }

  return <PlacementSearchClient token={session.accessToken} />;
}
