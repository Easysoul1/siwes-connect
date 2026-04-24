"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getCoordinatorOrganizationById } from "@/lib/api";
import { OrganizationProfile, Placement } from "@/lib/types";

type CoordinatorOrganizationDetail = OrganizationProfile & {
  user: { email: string; isActive: boolean; createdAt: string };
  placements: Placement[];
};

export default function CoordinatorOrganizationDetailPage() {
  const params = useParams<{ id: string }>();
  const { session } = useAuth();
  const [organization, setOrganization] = useState<CoordinatorOrganizationDetail | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!session?.accessToken || !params?.id) return;
    startTransition(async () => {
      try {
        const data = await getCoordinatorOrganizationById(session.accessToken, params.id);
        setOrganization(data);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load organization detail.");
      }
    });
  }, [params?.id, session?.accessToken]);

  return (
    <main className="app-container" style={{ paddingBottom: "2rem" }}>
      <Link href="/coordinator/organizations" className="btn btn-secondary" style={{ display: "inline-flex", marginBottom: "0.8rem" }}>
        Back to Organizations
      </Link>

      {organization ? (
        <>
          <section className="card" style={{ marginBottom: "0.8rem" }}>
            <h2 className="section-title">{organization.companyName}</h2>
            <p className="section-subtitle">
              Status: {organization.verificationStatus} • Email: {organization.user.email}
            </p>
            <p style={{ color: "#4B5563", marginBottom: 0 }}>
              Joined: {new Date(organization.user.createdAt).toLocaleDateString()}
            </p>
          </section>

          <section className="card">
            <h3 style={{ marginTop: 0 }}>Placements Posted</h3>
            <div style={{ display: "grid", gap: "0.55rem" }}>
              {organization.placements.map((placement) => (
                <article key={placement.id} className="card">
                  <p style={{ margin: "0 0 0.2rem", color: "#4B5563" }}>
                    {placement.title} • {placement.state}
                  </p>
                  <p style={{ margin: 0, color: "#4B5563" }}>
                    Status: <strong>{placement.status}</strong>
                  </p>
                </article>
              ))}
              {organization.placements.length === 0 ? (
                <p style={{ margin: 0, color: "#6B7280" }}>No placements posted yet.</p>
              ) : null}
            </div>
          </section>
        </>
      ) : (
        <section className="card">
          <p style={{ margin: 0, color: "#6B7280" }}>
            {session?.accessToken
              ? isPending
                ? "Loading organization detail..."
                : message ?? "Organization not found."
              : "Sign in as coordinator to load organization detail."}
          </p>
        </section>
      )}
    </main>
  );
}
