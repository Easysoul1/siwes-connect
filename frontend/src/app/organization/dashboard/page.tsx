"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { DashboardClient } from "@/components/organization/DashboardClient";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  getOrganizationApplications,
  getOrganizationDashboardStats
} from "@/lib/api";
import { OrganizationDashboardStats } from "@/lib/types";

type OrgApp = {
  id: string;
  status: string;
  student: { firstName: string; lastName: string; department: string; level: string };
  placement: { title: string };
};

export default function OrganizationDashboardPage() {
  const { session } = useAuth();
  const [stats, setStats] = useState<OrganizationDashboardStats | null>(null);
  const [applications, setApplications] = useState<OrgApp[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!session?.accessToken) return;

    startTransition(async () => {
      try {
        const [statsRes, applicationsRes] = await Promise.all([
          getOrganizationDashboardStats(session.accessToken),
          getOrganizationApplications(session.accessToken)
        ]);
        setStats(statsRes);
        setApplications(applicationsRes);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load dashboard.");
      }
    });
  }, [session?.accessToken]);

  return (
    <>
      <main className="app-container" style={{ paddingBottom: "0.8rem" }}>
        {!session?.accessToken ? (
          <section className="card">
            <p style={{ margin: 0, color: "#6B7280" }}>
              Sign in as organization to load dashboard data.
            </p>
          </section>
        ) : null}
        {message && !isPending ? (
          <section className="card" style={{ marginBottom: "0.8rem" }}>
            <p style={{ margin: 0, color: "#6B7280" }}>{message}</p>
          </section>
        ) : null}
        <section style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <Link href="/organization/placements/new" className="btn btn-primary">
            Post New Placement
          </Link>
          <Link href="/organization/placements" className="btn btn-secondary">
            Manage Placements
          </Link>
          <Link href="/organization/applications" className="btn btn-secondary">
            View Applications
          </Link>
        </section>
      </main>
      <DashboardClient
        stats={stats}
        applications={applications}
        token={session?.accessToken}
      />
    </>
  );
}
