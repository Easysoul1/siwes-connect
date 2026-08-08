"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { getCoordStudentLogbook, addCoordComment } from "@/lib/api";
import { LogbookEntry } from "@/lib/types";

export default function CoordStudentLogbookPage() {
  const { session } = useAuth();
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<any>(null);
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [commentEntryId, setCommentEntryId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [signatureText, setSignatureText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadLogbook = useCallback(async () => {
    if (!session?.accessToken || !studentId) return;
    try {
      const data = await getCoordStudentLogbook(session.accessToken, studentId);
      setStudent(data.student);
      setEntries(data.entries);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to load logbook");
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, studentId]);

  useEffect(() => { loadLogbook(); }, [loadLogbook]);

  async function handleComment(entryId: string) {
    if (!session?.accessToken || !commentText.trim() || !signatureText.trim()) return;
    setSubmitting(true);
    try {
      await addCoordComment(session.accessToken, entryId, {
        comment: commentText.trim(),
        signature: signatureText.trim()
      });
      setCommentEntryId(null);
      setCommentText("");
      setSignatureText("");
      await loadLogbook();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  }

  const groupedByWeek = entries.reduce<Record<number, LogbookEntry[]>>((acc, entry) => {
    if (!acc[entry.weekNumber]) acc[entry.weekNumber] = [];
    acc[entry.weekNumber].push(entry);
    return acc;
  }, {});

  const weekNumbers = Object.keys(groupedByWeek).map(Number).sort((a, b) => a - b);

  const cardStyle: React.CSSProperties = {
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    background: "white",
    padding: "1rem"
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.5rem",
    border: "1px solid #D1D5DB",
    borderRadius: 8,
    fontSize: 14,
    boxSizing: "border-box"
  };

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2.2rem 1.2rem 3rem" }}>
      <h1 style={{ margin: "0 0 4px" }}>Student Logbook</h1>
      {student && (
        <p style={{ margin: "0 0 1.2rem", color: "#4B5563", fontSize: 14 }}>
          {student.firstName} {student.lastName} — {student.department}, Level {student.level}
          {student.institution && ` — ${student.institution.name}`}
        </p>
      )}

      {message && (
        <p style={{ padding: "0.6rem 1rem", borderRadius: 8, background: "#FEF2F2", color: "#991B1B", marginBottom: 12 }}>
          {message}
        </p>
      )}

      {loading ? (
        <p style={{ color: "#6B7280" }}>Loading entries...</p>
      ) : entries.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "#6B7280", margin: 0 }}>No logbook entries yet.</p>
        </div>
      ) : (
        weekNumbers.map((week) => (
          <div key={week} style={{ marginBottom: 20 }}>
            <h3 style={{
              margin: "0 0 8px",
              padding: "0.4rem 0.8rem",
              background: "#F3F4F6",
              borderRadius: 8,
              fontSize: 15,
              color: "#374151"
            }}>
              Week {week}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {groupedByWeek[week].map((entry) => (
                <div key={entry.id} style={{ ...cardStyle, borderLeft: `4px solid ${entry.status === "DRAFT" ? "#F59E0B" : "#10B981"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <strong>{entry.activity}</strong>
                      <span style={{ marginLeft: 8, color: "#6B7280", fontSize: 13 }}>
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                      background: entry.status === "DRAFT" ? "#FEF3C7" : "#D1FAE5",
                      color: entry.status === "DRAFT" ? "#92400E" : "#065F46"
                    }}>
                      {entry.status === "DRAFT" ? "DRAFT" : "SUBMITTED"}
                    </span>
                  </div>
                  <p style={{ margin: "0 0 6px", color: "#4B5563", fontSize: 14 }}>
                    {entry.description}
                  </p>

                  {entry.organizationComment && (
                    <div style={{ margin: "8px 0", padding: "0.6rem", background: "#F0FDF4", borderRadius: 8, borderLeft: "3px solid #10B981" }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#065F46" }}>Supervisor Comment</p>
                      <p style={{ margin: "4px 0 0", fontSize: 13, color: "#374151" }}>{entry.organizationComment}</p>
                      {entry.organizationSignature && (
                        <p style={{ margin: "4px 0 0", fontSize: 12, fontStyle: "italic", color: "#6B7280" }}>
                          Signed: {entry.organizationSignature}
                        </p>
                      )}
                    </div>
                  )}

                  {entry.coordinatorComment && (
                    <div style={{ margin: "8px 0", padding: "0.6rem", background: "#EFF6FF", borderRadius: 8, borderLeft: "3px solid #3B82F6" }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1E40AF" }}>Coordinator Comment</p>
                      <p style={{ margin: "4px 0 0", fontSize: 13, color: "#374151" }}>{entry.coordinatorComment}</p>
                      {entry.coordinatorSignature && (
                        <p style={{ margin: "4px 0 0", fontSize: 12, fontStyle: "italic", color: "#6B7280" }}>
                          Signed: {entry.coordinatorSignature}
                        </p>
                      )}
                    </div>
                  )}

                  {entry.status === "SUBMITTED" && !entry.coordinatorComment && (
                    <div style={{ marginTop: 8 }}>
                      {commentEntryId === entry.id ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <textarea
                            placeholder="Add your comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            rows={3}
                            style={{ ...inputStyle, resize: "vertical" }}
                          />
                          <input
                            type="text"
                            placeholder="Your name and title (e.g. Dr. Smith — SIWES Coordinator)"
                            value={signatureText}
                            onChange={(e) => setSignatureText(e.target.value)}
                            style={inputStyle}
                          />
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              className="btn btn-primary"
                              style={{ height: 34, fontSize: 13 }}
                              disabled={submitting || !commentText.trim() || !signatureText.trim()}
                              onClick={() => handleComment(entry.id)}
                            >
                              {submitting ? "Saving..." : "Sign & Save"}
                            </button>
                            <button
                              className="btn btn-secondary"
                              style={{ height: 34, fontSize: 13 }}
                              onClick={() => { setCommentEntryId(null); setCommentText(""); setSignatureText(""); }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="btn btn-primary"
                          style={{ height: 32, fontSize: 12 }}
                          onClick={() => setCommentEntryId(entry.id)}
                        >
                          Add Comment
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </main>
  );
}
