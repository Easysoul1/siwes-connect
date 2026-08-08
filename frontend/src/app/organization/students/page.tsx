"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { getOrgStudents } from "@/lib/api";

type OrgStudent = {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    department: string;
    level: string;
    institution?: { name: string; shortName: string } | null;
    user: { email: string; isActive: boolean };
  };
  applicationId: string;
  placement: { id: string; title: string };
  status: string;
};

export default function OrganizationStudentsPage() {
  const { session } = useAuth();
  const [students, setStudents] = useState<OrgStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const data = await getOrgStudents(session.accessToken);
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
      <h1 style={{ margin: "0 0 4px" }}>Placed Students</h1>
      <p style={{ margin: "0 0 1.2rem", color: "#4B5563", fontSize: 14 }}>
        Students with accepted or confirmed placements at your organization.
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
          <p style={{ color: "#6B7280", margin: 0 }}>No placed students yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {students.map((item) => (
            <div key={item.student.id} style={cardStyle}>
              <div>
                <strong style={{ fontSize: 15 }}>
                  {item.student.firstName} {item.student.lastName}
                </strong>
                <p style={{ margin: "2px 0 0", color: "#6B7280", fontSize: 13 }}>
                  {item.student.department} — Level {item.student.level}
                </p>
                {item.student.institution && (
                  <p style={{ margin: "2px 0 0", color: "#9CA3AF", fontSize: 12 }}>
                    {item.student.institution.name}
                  </p>
                )}
                <p style={{ margin: "2px 0 0", color: "#9CA3AF", fontSize: 12 }}>
                  Placement: {item.placement.title}
                </p>
              </div>
              <Link
                href={`/organization/students/${item.student.id}/logbook`}
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
