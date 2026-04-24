"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  getCoordinatorDashboardStats,
  getCoordinatorOrganizations
} from "@/lib/api";
import { CoordinatorOverviewStats, OrganizationSummary } from "@/lib/types";

export default function CoordinatorDashboardPage() {
  const { session } = useAuth();
  const [stats, setStats] = useState<CoordinatorOverviewStats | null>(null);
  const [pendingOrganizations, setPendingOrganizations] = useState<OrganizationSummary[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!session?.accessToken) return;
    startTransition(async () => {
      try {
        const [statsRes, pendingRes] = await Promise.all([
          getCoordinatorDashboardStats(session.accessToken),
          getCoordinatorOrganizations(session.accessToken, "PENDING")
        ]);
        setStats(statsRes);
        setPendingOrganizations(pendingRes);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load dashboard.");
      }
    });
  }, [session?.accessToken]);

  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "2.2rem 1.2rem 3rem" }}>
      <h1 style={{ marginBottom: 8 }}>Coordinator Dashboard</h1>
      <p style={{ marginTop: 0, color: "#4B5563" }}>
        Institution-level SIWES visibility and pending moderation queue.
      </p>

      {stats ? (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: 10,
            marginBottom: 16
          }}
        >
          {[
            ["Students", stats.totalStudents],
            ["Organizations", stats.totalOrganizations],
            ["Pending Orgs", stats.pendingOrganizations],
            ["Placements", stats.totalPlacements],
            ["Applications", stats.totalApplications],
            ["Confirmed", stats.confirmedApplications]
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
          Sign in as coordinator to load dashboard metrics.
        </p>
      )}

      <section style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <Link href="/coordinator/organizations" className="btn btn-primary">
          Review Organizations
        </Link>
        <Link href="/coordinator/students" className="btn btn-secondary">
          Monitor Students
        </Link>
        <Link href="/coordinator/announcements" className="btn btn-secondary">
          Publish Announcement
        </Link>
      </section>

      <section>
        <h2 style={{ marginBottom: 8 }}>Pending Organizations</h2>
        <div style={{ display: "grid", gap: 8 }}>
          {pendingOrganizations.map((org) => (
            <article
              key={org.id}
              style={{ border: "1px solid #E5E7EB", borderRadius: 12, background: "white", padding: "0.85rem" }}
            >
              <strong>{org.companyName}</strong>
              <p style={{ margin: "0.25rem 0 0", color: "#4B5563" }}>
                Status: {org.verificationStatus}
              </p>
            </article>
          ))}
          {pendingOrganizations.length === 0 ? (
            <p style={{ margin: 0, color: "#6B7280" }}>No pending organizations.</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
