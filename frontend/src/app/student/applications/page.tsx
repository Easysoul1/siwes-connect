"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { ApplicationsClient } from "@/components/student/ApplicationsClient";
import { useAuth } from "@/components/providers/AuthProvider";
import { getStudentApplications } from "@/lib/api";
import { ApplicationItem } from "@/lib/types";
import Toast from "@/components/shared/Toast";

export default function StudentApplicationsPage() {
  const { session } = useAuth();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [toastMsg, setToastMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();
  const dismissToast = useCallback(() => setToastMsg(null), []);

  useEffect(() => {
    if (!session?.accessToken) return;
    startTransition(async () => {
      try {
        const data = await getStudentApplications(session.accessToken);
        setApplications(data);
      } catch (error) {
        setToastMsg({ message: error instanceof Error ? error.message : "Unable to load applications.", type: "error" });
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

  if (toastMsg && !applications.length && !isPending) {
    return (
      <main className="app-container">
        <section className="card">
          <p style={{ margin: 0, color: "#6B7280" }}>{toastMsg.message}</p>
        </section>
        <Toast message={toastMsg.message} type={toastMsg.type} onDismiss={dismissToast} />
      </main>
    );
  }

  return <ApplicationsClient initialApplications={applications} token={session.accessToken} />;
}
