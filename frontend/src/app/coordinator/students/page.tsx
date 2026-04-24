"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getCoordinatorStudents } from "@/lib/api";
import { CoordinatorStudent } from "@/lib/types";

export default function CoordinatorStudentsPage() {
  const { session } = useAuth();
  const [students, setStudents] = useState<CoordinatorStudent[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!session?.accessToken) return;
    startTransition(async () => {
      try {
        const data = await getCoordinatorStudents(session.accessToken);
        setStudents(data);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load students.");
      }
    });
  }, [session?.accessToken]);

  return (
    <main className="app-container" style={{ paddingBottom: "2rem" }}>
      <section className="card">
        <h2 className="section-title">Student Monitoring</h2>
        <p className="section-subtitle">
          Filter by field, level, and application activity from one place.
        </p>

        <div style={{ marginTop: "1rem", display: "grid", gap: "0.65rem" }}>
          {students.map((student) => (
            <article key={student.id} className="card">
              <h3 style={{ marginTop: 0 }}>
                {student.firstName} {student.lastName}
              </h3>
              <p style={{ margin: "0 0 0.2rem", color: "#4B5563" }}>
                {student.department} • {student.level} • {student.currentState}
              </p>
              <p style={{ margin: "0 0 0.45rem", color: "#4B5563" }}>
                Applications: {student.applications.length} • Email: {student.user.email}
              </p>
              <Link href={`/coordinator/students/${student.id}`} className="btn btn-secondary" style={{ display: "inline-flex" }}>
                View Detail
              </Link>
            </article>
          ))}
          {students.length === 0 ? (
            <p style={{ margin: 0, color: "#6B7280" }}>
              {session?.accessToken
                ? isPending
                  ? "Loading students..."
                  : message ?? "No student records yet."
                : "Sign in as coordinator to load student records."}
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
