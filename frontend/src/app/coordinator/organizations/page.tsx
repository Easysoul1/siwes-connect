"use client";

import { useEffect, useState, useTransition } from "react";
import { OrganizationApprovalClient } from "@/components/coordinator/OrganizationApprovalClient";
import { useAuth } from "@/components/providers/AuthProvider";
import { getCoordinatorOrganizations } from "@/lib/api";
import { OrganizationSummary } from "@/lib/types";

export default function CoordinatorOrganizationsPage() {
  const { session } = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!session?.accessToken) return;
    startTransition(async () => {
      try {
        const data = await getCoordinatorOrganizations(session.accessToken);
        setOrganizations(data);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load organizations.");
      }
    });
  }, [session?.accessToken]);

  if (!session?.accessToken) {
    return (
      <main className="app-container">
        <section className="card">
          <p style={{ margin: 0, color: "#6B7280" }}>
            Sign in as coordinator to load organizations.
          </p>
        </section>
      </main>
    );
  }

  if (message && !organizations.length && !isPending) {
    return (
      <main className="app-container">
        <section className="card">
          <p style={{ margin: 0, color: "#6B7280" }}>{message}</p>
        </section>
      </main>
    );
  }

  return (
    <OrganizationApprovalClient
      organizations={organizations}
      token={session.accessToken}
    />
  );
}
