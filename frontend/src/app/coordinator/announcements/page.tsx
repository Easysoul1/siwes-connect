"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements
} from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { CoordinatorAnnouncement } from "@/lib/types";

export default function CoordinatorAnnouncementsPage() {
  const { session } = useAuth();
  const [announcements, setAnnouncements] = useState<CoordinatorAnnouncement[]>([]);
  const [form, setForm] = useState({
    title: "",
    message: "",
    targetRole: "ALL" as "ALL" | "STUDENT" | "ORGANIZATION"
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!session?.accessToken) return;
    startTransition(async () => {
      try {
        const data = await getAnnouncements(session.accessToken);
        setAnnouncements(data);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to load announcements");
      }
    });
  }, [session?.accessToken]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session?.accessToken) {
      setFeedback("Sign in as coordinator to create announcements.");
      return;
    }

    startTransition(async () => {
      try {
        await createAnnouncement(session.accessToken, form);
        const data = await getAnnouncements(session.accessToken);
        setAnnouncements(data);
        setForm({ title: "", message: "", targetRole: "ALL" });
        setFeedback("Announcement created.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to create announcement");
      }
    });
  }

  function onDelete(id: string) {
    if (!session?.accessToken) return;
    startTransition(async () => {
      try {
        await deleteAnnouncement(session.accessToken, id);
        setAnnouncements((prev) => prev.filter((item) => item.id !== id));
        setFeedback("Announcement deleted.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Delete failed");
      }
    });
  }

  return (
    <main className="app-container" style={{ paddingBottom: "2rem" }}>
      <section className="card" style={{ marginBottom: "0.8rem" }}>
        <h2 className="section-title">Create Announcement</h2>
        <p className="section-subtitle" style={{ marginBottom: "1rem" }}>
          Publish updates to students, organizations, or all participants.
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.8rem" }}>
          <div>
            <label className="label">Title</label>
            <input
              className="input"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Audience</label>
            <select
              className="select"
              value={form.targetRole}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  targetRole: event.target.value as "ALL" | "STUDENT" | "ORGANIZATION"
                }))
              }
            >
              <option value="ALL">All</option>
              <option value="STUDENT">Students</option>
              <option value="ORGANIZATION">Organizations</option>
            </select>
          </div>
          <div>
            <label className="label">Message</label>
            <textarea
              className="textarea"
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={isPending}>
            {isPending ? "Publishing..." : "Publish Announcement"}
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="section-title">Past Announcements</h2>
        <div style={{ display: "grid", gap: "0.65rem", marginTop: "0.8rem" }}>
          {announcements.map((announcement) => (
            <article key={announcement.id} className="card">
              <h3 style={{ marginTop: 0 }}>{announcement.title}</h3>
              <p style={{ color: "#4B5563", margin: "0 0 0.3rem" }}>{announcement.message}</p>
              <p style={{ color: "#4B5563", margin: 0 }}>
                Recipients: {announcement.recipients} •{" "}
                {new Date(announcement.createdAt).toLocaleString()}
              </p>
              <button
                className="btn btn-danger"
                type="button"
                style={{ marginTop: "0.55rem" }}
                onClick={() => onDelete(announcement.id)}
              >
                Delete
              </button>
            </article>
          ))}
          {announcements.length === 0 ? (
            <p style={{ margin: 0, color: "#6B7280" }}>No announcements yet.</p>
          ) : null}
        </div>
        {feedback ? <p style={{ marginBottom: 0, color: "#4B5563" }}>{feedback}</p> : null}
      </section>
    </main>
  );
}
