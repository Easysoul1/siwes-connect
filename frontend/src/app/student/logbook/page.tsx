"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createLogbookEntry,
  deleteLogbookEntry,
  getMyLogbook,
  submitLogbookEntry,
  updateLogbookEntry
} from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { LogbookEntry } from "@/lib/types";

type EntryForm = {
  weekNumber: string;
  date: string;
  activity: string;
  description: string;
  supervisorComment: string;
};

const emptyForm: EntryForm = {
  weekNumber: "",
  date: new Date().toISOString().slice(0, 10),
  activity: "",
  description: "",
  supervisorComment: ""
};

export default function StudentLogbookPage() {
  const { session } = useAuth();
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EntryForm>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadEntries = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const data = await getMyLogbook(session.accessToken);
      setEntries(data);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to load logbook");
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.accessToken) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const payload = {
        weekNumber: parseInt(form.weekNumber, 10),
        date: form.date,
        activity: form.activity,
        description: form.description,
        ...(form.supervisorComment.trim()
          ? { supervisorComment: form.supervisorComment.trim() }
          : {})
      };
      if (editingId) {
        await updateLogbookEntry(session.accessToken, editingId, payload);
      } else {
        await createLogbookEntry(session.accessToken, payload);
      }
      setForm(emptyForm);
      setShowForm(false);
      setEditingId(null);
      await loadEntries();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save entry");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(entry: LogbookEntry) {
    setForm({
      weekNumber: String(entry.weekNumber),
      date: entry.date.slice(0, 10),
      activity: entry.activity,
      description: entry.description,
      supervisorComment: entry.supervisorComment || ""
    });
    setEditingId(entry.id);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!session?.accessToken) return;
    if (!window.confirm("Delete this logbook entry?")) return;
    try {
      await deleteLogbookEntry(session.accessToken, id);
      await loadEntries();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to delete entry");
    }
  }

  async function handleSubmit(id: string) {
    if (!session?.accessToken) return;
    if (!window.confirm("Submit this entry? It can no longer be edited.")) return;
    try {
      await submitLogbookEntry(session.accessToken, id);
      await loadEntries();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to submit entry");
    }
  }

  function cancelForm() {
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
  }

  const groupedByWeek = entries.reduce<
    Record<number, { draft: LogbookEntry[]; submitted: LogbookEntry[] }>
  >((acc, entry) => {
    if (!acc[entry.weekNumber]) acc[entry.weekNumber] = { draft: [], submitted: [] };
    if (entry.status === "DRAFT") acc[entry.weekNumber].draft.push(entry);
    else acc[entry.weekNumber].submitted.push(entry);
    return acc;
  }, {});

  const weekNumbers = Object.keys(groupedByWeek)
    .map(Number)
    .sort((a, b) => a - b);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.6rem",
    border: "1px solid #D1D5DB",
    borderRadius: 8,
    fontSize: 14,
    boxSizing: "border-box"
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontWeight: 600,
    marginBottom: 4,
    fontSize: 13,
    color: "#374151"
  };

  const cardStyle: React.CSSProperties = {
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    background: "white",
    padding: "1rem"
  };

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2.2rem 1.2rem 3rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>SIWES Logbook</h1>
          <p style={{ margin: "4px 0 0", color: "#4B5563", fontSize: 14 }}>
            Record your daily SIWES activities by week.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
            style={{ height: 40 }}
          >
            + New Entry
          </button>
        )}
      </div>

      {message && (
        <p
          style={{
            padding: "0.6rem 1rem",
            borderRadius: 8,
            background: "#FEF2F2",
            color: "#991B1B",
            marginBottom: 12
          }}
        >
          {message}
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          style={{
            ...cardStyle,
            marginBottom: 24
          }}
        >
          <h3 style={{ margin: "0 0 12px" }}>
            {editingId ? "Edit Entry" : "New Logbook Entry"}
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 12
            }}
          >
            <div>
              <label style={labelStyle}>Week Number</label>
              <input
                name="weekNumber"
                type="number"
                min={1}
                max={52}
                required
                value={form.weekNumber}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Date</label>
              <input
                name="date"
                type="date"
                required
                value={form.date}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Activity / Task</label>
            <input
              name="activity"
              required
              value={form.activity}
              onChange={handleChange}
              style={inputStyle}
              placeholder="e.g. Network configuration, Data entry"
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Description</label>
            <textarea
              name="description"
              required
              rows={4}
              value={form.description}
              onChange={handleChange}
              style={{ ...inputStyle, resize: "vertical" }}
              placeholder="Describe what you did in detail..."
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Supervisor Comment (optional)</label>
            <textarea
              name="supervisorComment"
              rows={2}
              value={form.supervisorComment}
              onChange={handleChange}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Saving..." : editingId ? "Update" : "Save Entry"}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              style={{
                padding: "0.5rem 1.2rem",
                borderRadius: 8,
                border: "1px solid #D1D5DB",
                background: "white",
                cursor: "pointer",
                fontSize: 14
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p style={{ color: "#6B7280" }}>Loading entries...</p>
      ) : entries.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "#6B7280", margin: 0 }}>
            No logbook entries yet. Click &quot;+ New Entry&quot; to get started.
          </p>
        </div>
      ) : (
        weekNumbers.map((week) => {
          const weekData = groupedByWeek[week];
          const allInWeek = [...weekData.draft, ...weekData.submitted];
          return (
            <div key={week} style={{ marginBottom: 20 }}>
              <h3
                style={{
                  margin: "0 0 8px",
                  padding: "0.4rem 0.8rem",
                  background: "#F3F4F6",
                  borderRadius: 8,
                  fontSize: 15,
                  color: "#374151"
                }}
              >
                Week {week}
                <span style={{ fontWeight: 400, fontSize: 13, marginLeft: 8, color: "#6B7280" }}>
                  {allInWeek.length} entr{allInWeek.length === 1 ? "y" : "ies"}
                </span>
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {allInWeek.map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      ...cardStyle,
                      borderLeft: `4px solid ${entry.status === "DRAFT" ? "#F59E0B" : "#10B981"}`
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 6
                      }}
                    >
                      <div>
                        <strong>{entry.activity}</strong>
                        <span style={{ marginLeft: 8, color: "#6B7280", fontSize: 13 }}>
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background:
                            entry.status === "DRAFT" ? "#FEF3C7" : "#D1FAE5",
                          color:
                            entry.status === "DRAFT" ? "#92400E" : "#065F46"
                        }}
                      >
                        {entry.status === "DRAFT" ? "DRAFT" : "SUBMITTED"}
                      </span>
                    </div>
                    <p style={{ margin: "0 0 6px", color: "#4B5563", fontSize: 14 }}>
                      {entry.description}
                    </p>
                    {entry.supervisorComment && (
                      <p style={{ margin: "0 0 6px", fontStyle: "italic", fontSize: 13, color: "#6B7280" }}>
                        Supervisor: {entry.supervisorComment}
                      </p>
                    )}
                    {entry.status === "DRAFT" && (
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        <button
                          onClick={() => handleSubmit(entry.id)}
                          className="btn btn-sm btn-primary"
                        >
                          Submit
                        </button>
                        <button
                          onClick={() => handleEdit(entry)}
                          className="btn btn-sm btn-secondary"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          style={{
                            padding: "0.3rem 0.8rem",
                            borderRadius: 6,
                            border: "1px solid #FCA5A5",
                            background: "white",
                            color: "#DC2626",
                            cursor: "pointer",
                            fontSize: 13
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </main>
  );
}
