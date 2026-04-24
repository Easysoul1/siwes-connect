"use client";

import { useEffect, useState, useTransition } from "react";
import { ApplicationsManagerClient } from "@/components/organization/ApplicationsManagerClient";
import { useAuth } from "@/components/providers/AuthProvider";
import { getOrganizationApplications } from "@/lib/api";

type OrganizationApplication = {
  id: string;
  status: string;
  createdAt: string;
  student: { firstName: string; lastName: string; department: string; level: string };
  placement: { id: string; title: string; status: string };
};

export default function OrganizationApplicationsPage() {
  const { session } = useAuth();
  const [applications, setApplications] = useState<OrganizationApplication[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!session?.accessToken) return;
    startTransition(async () => {
      try {
        const data = await getOrganizationApplications(session.accessToken);
        setApplications(data);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load applications.");
      }
    });
  }, [session?.accessToken]);

  if (!session?.accessToken) {
    return (
      <main className="app-container">
        <section className="card">
          <p style={{ margin: 0, color: "#6B7280" }}>
            Sign in as organization to load applications.
          </p>
        </section>
      </main>
    );
  }

  if (message && !applications.length && !isPending) {
    return (
      <main className="app-container">
        <section className="card">
          <p style={{ margin: 0, color: "#6B7280" }}>{message}</p>
        </section>
      </main>
    );
  }

  return (
    <ApplicationsManagerClient applications={applications} token={session.accessToken} />
  );
}
