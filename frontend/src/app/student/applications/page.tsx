"use client";

import { useEffect, useState, useTransition } from "react";
import { ApplicationsClient } from "@/components/student/ApplicationsClient";
import { useAuth } from "@/components/providers/AuthProvider";
import { getStudentApplications } from "@/lib/api";
import { ApplicationItem } from "@/lib/types";

export default function StudentApplicationsPage() {
  const { session } = useAuth();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!session?.accessToken) return;
    startTransition(async () => {
      try {
        const data = await getStudentApplications(session.accessToken);
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
            Sign in as student to load applications.
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

  return <ApplicationsClient initialApplications={applications} token={session.accessToken} />;
}
