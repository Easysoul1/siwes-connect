"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getCoordinatorStudentById } from "@/lib/api";
import { CoordinatorStudentDetail } from "@/lib/types";

export default function CoordinatorStudentDetailPage() {
  const params = useParams<{ id: string }>();
  const { session } = useAuth();
  const [student, setStudent] = useState<CoordinatorStudentDetail | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!session?.accessToken || !params?.id) return;
    startTransition(async () => {
      try {
        const data = await getCoordinatorStudentById(session.accessToken, params.id);
        setStudent(data);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load student detail.");
      }
    });
  }, [params?.id, session?.accessToken]);

  return (
    <main className="app-container" style={{ paddingBottom: "2rem" }}>
      <Link href="/coordinator/students" className="btn btn-secondary" style={{ display: "inline-flex", marginBottom: "0.8rem" }}>
        Back to Students
      </Link>

      {student ? (
        <>
          <section className="card" style={{ marginBottom: "0.8rem" }}>
            <h2 className="section-title">
              {student.firstName} {student.lastName}
            </h2>
            <p className="section-subtitle">
              {student.department} • {student.level} • {student.currentState}
            </p>
            <p style={{ marginBottom: 0, color: "#4B5563" }}>Email: {student.user.email}</p>
          </section>

          <section className="card">
            <h3 style={{ marginTop: 0 }}>Application History</h3>
            <div style={{ display: "grid", gap: "0.55rem" }}>
              {student.applications.map((application) => (
                <article key={application.id} className="card">
                  <p style={{ margin: "0 0 0.2rem", color: "#4B5563" }}>
                    {application.placement.title} • {application.placement.state}
                  </p>
                  <p style={{ margin: 0, color: "#4B5563" }}>
                    Status: <strong>{application.status}</strong>
                  </p>
                </article>
              ))}
              {student.applications.length === 0 ? (
                <p style={{ margin: 0, color: "#6B7280" }}>No applications yet.</p>
              ) : null}
            </div>
          </section>
        </>
      ) : (
        <section className="card">
          <p style={{ margin: 0, color: "#6B7280" }}>
            {session?.accessToken
              ? isPending
                ? "Loading student detail..."
                : message ?? "Student not found."
              : "Sign in as coordinator to load student detail."}
          </p>
        </section>
      )}
    </main>
  );
}
