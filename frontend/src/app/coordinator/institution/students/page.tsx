"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { getCoordInstitutionStudents } from "@/lib/api";

type CoordStudent = {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  level: string;
  currentState: string;
  institution?: { name: string; shortName: string } | null;
  user: { email: string; isActive: boolean };
  applications: Array<{ id: string; status: string; createdAt: string }>;
};

export default function CoordinatorInstitutionStudentsPage() {
  const { session } = useAuth();
  const [students, setStudents] = useState<CoordStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const data = await getCoordInstitutionStudents(session.accessToken);
      setStudents(data);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  const cardStyle: React.CSSProperties = {
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    background: "white",
    padding: "1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  };

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2.2rem 1.2rem 3rem" }}>
      <h1 style={{ margin: "0 0 4px" }}>Institution Students</h1>
      <p style={{ margin: "0 0 1.2rem", color: "#4B5563", fontSize: 14 }}>
        Students registered under your institution.
      </p>

      {message && (
        <p style={{ padding: "0.6rem 1rem", borderRadius: 8, background: "#FEF2F2", color: "#991B1B", marginBottom: 12 }}>
          {message}
        </p>
      )}

      {loading ? (
        <p style={{ color: "#6B7280" }}>Loading students...</p>
      ) : students.length === 0 ? (
        <div style={{ ...cardStyle, justifyContent: "center", padding: "3rem" }}>
          <p style={{ color: "#6B7280", margin: 0 }}>No students found. Make sure your account is linked to an institution.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {students.map((student) => (
            <div key={student.id} style={cardStyle}>
              <div>
                <strong style={{ fontSize: 15 }}>
                  {student.firstName} {student.lastName}
                </strong>
                <p style={{ margin: "2px 0 0", color: "#6B7280", fontSize: 13 }}>
                  {student.department} — Level {student.level}
                </p>
                <p style={{ margin: "2px 0 0", color: "#9CA3AF", fontSize: 12 }}>
                  {student.applications.length} application{student.applications.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Link
                href={`/coordinator/institution/students/${student.id}/logbook`}
                className="btn btn-primary"
                style={{ height: 36, fontSize: 13, textDecoration: "none" }}
              >
                View Logbook
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
