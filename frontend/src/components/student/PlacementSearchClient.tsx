"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  applyToPlacement,
  getAllPlacements,
  getListedOrganizations,
  getOrganizationPublicPlacements
} from "@/lib/api";
import { Placement } from "@/lib/types";
import Toast from "@/components/shared/Toast";

type OrgEntry = {
  id: string;
  companyName: string;
  description: string | null;
  industry: string | null;
  website: string | null;
  logoUrl: string | null;
  state: string | null;
  _count: { placements: number };
};

type Props = {
  token?: string;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.6rem",
  border: "1px solid #D1D5DB",
  borderRadius: 8,
  fontSize: 14,
  boxSizing: "border-box"
};

export function PlacementSearchClient({ token }: Props) {
  const [query, setQuery] = useState("");
  const [onlyRemote, setOnlyRemote] = useState(false);
  const [orgs, setOrgs] = useState<OrgEntry[]>([]);
  const [allPlacements, setAllPlacements] = useState<Placement[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [orgPlacements, setOrgPlacements] = useState<Placement[]>([]);
  const [toastMsg, setToastMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingOrg, setLoadingOrg] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dismissToast = useCallback(() => setToastMsg(null), []);

  useEffect(() => {
    (async () => {
      try {
        const [orgData, placements] = await Promise.all([
          getListedOrganizations(),
          token ? getAllPlacements(token) : []
        ]);
        setOrgs(orgData);
        setAllPlacements(placements);
      } catch (err) {
        setToastMsg({ message: err instanceof Error ? err.message : "Failed to load data", type: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const loadOrgPlacements = useCallback(async (orgId: string) => {
    setLoadingOrg(true);
    try {
      const data = await getOrganizationPublicPlacements(orgId);
      setOrgPlacements(data);
    } catch (err) {
      setToastMsg({ message: err instanceof Error ? err.message : "Failed to load placements", type: "error" });
    } finally {
      setLoadingOrg(false);
    }
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      loadOrgPlacements(selectedOrg);
    } else {
      setOrgPlacements([]);
    }
  }, [selectedOrg, loadOrgPlacements]);

  const filteredOrgs = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return orgs;
    return orgs.filter(
      (o) =>
        o.companyName.toLowerCase().includes(q) ||
        (o.industry && o.industry.toLowerCase().includes(q)) ||
        (o.state && o.state.toLowerCase().includes(q))
    );
  }, [orgs, query]);

  const filteredPlacements = useMemo(() => {
    let items = selectedOrg ? orgPlacements : allPlacements;
    const q = query.toLowerCase().trim();
    if (q) {
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q) ||
          (p.organization?.companyName || "").toLowerCase().includes(q)
      );
    }
    if (onlyRemote) {
      items = items.filter((p) => p.isRemote);
    }
    return items;
  }, [allPlacements, orgPlacements, selectedOrg, query, onlyRemote]);

  function handleApply(placementId: string) {
    if (!token) {
      setToastMsg({ message: "Sign in as student to submit applications.", type: "error" });
      return;
    }
    startTransition(async () => {
      try {
        await applyToPlacement(token, placementId);
        setToastMsg({ message: "Application submitted successfully.", type: "success" });
      } catch (err) {
        setToastMsg({ message: err instanceof Error ? err.message : "Failed to submit application.", type: "error" });
      }
    });
  }

  function selectOrg(orgId: string | null) {
    setSelectedOrg(orgId);
    setToastMsg(null);
  }

  if (loading) {
    return (
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "2.3rem 1.25rem 3rem" }}>
        <p style={{ color: "#6B7280" }}>Loading organizations and placements...</p>
      </main>
    );
  }

  const placementsView = selectedOrg ? orgPlacements : allPlacements;

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "2.3rem 1.25rem 3rem" }}>
      <header style={{ marginBottom: 18 }}>
        <h1 style={{ marginBottom: 4 }}>
          {selectedOrg
            ? `${orgs.find((o) => o.id === selectedOrg)?.companyName || "Organization"} — Placements`
            : "Placement Search"}
        </h1>
        <p style={{ margin: 0, color: "#4B5563" }}>
          {selectedOrg
            ? "Browse placements posted by this organization."
            : "Browse approved SIWES organizations and their active placements."}
        </p>
      </header>

      <section
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 14
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid #D1D5DB",
            borderRadius: 10,
            padding: "0.55rem 0.75rem",
            background: "white"
          }}
        >
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              selectedOrg
                ? "Search placements by title or state..."
                : "Search organizations or placements..."
            }
            style={{ border: "none", outline: "none", minWidth: 240 }}
          />
        </label>
        <button
          type="button"
          onClick={() => setOnlyRemote((prev) => !prev)}
          style={{
            border: "1px solid #D1D5DB",
            borderRadius: 10,
            padding: "0.55rem 0.9rem",
            background: onlyRemote ? "#ECFDF5" : "white",
            color: onlyRemote ? "#065F46" : "#111827",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Remote only
        </button>
        {selectedOrg && (
          <button
            type="button"
            onClick={() => selectOrg(null)}
            style={{
              border: "1px solid #D1D5DB",
              borderRadius: 10,
              padding: "0.55rem 0.9rem",
              background: "white",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            All Organizations
          </button>
        )}
      </section>

      {toastMsg ? <Toast message={toastMsg.message} type={toastMsg.type} onDismiss={dismissToast} /> : null}

      {!selectedOrg && (
        <>
          {filteredOrgs.length === 0 ? (
            <section
              style={{
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                background: "white",
                padding: "3rem",
                textAlign: "center"
              }}
            >
              <p style={{ color: "#6B7280", margin: 0 }}>
                {query
                  ? "No organizations match your search."
                  : "No approved organizations yet."}
              </p>
            </section>
          ) : (
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 12,
                marginBottom: 24
              }}
            >
              {filteredOrgs.map((org) => (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => selectOrg(org.id)}
                  style={{
                    border: "1px solid #E5E7EB",
                    borderRadius: 12,
                    background: "white",
                    padding: "1.1rem",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "box-shadow 0.15s"
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                >
                  <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>{org.companyName}</h3>
                  {org.industry && (
                    <p style={{ margin: "0 0 4px", color: "#6B7280", fontSize: 13 }}>
                      {org.industry}
                    </p>
                  )}
                  {org.state && (
                    <p style={{ margin: "0 0 8px", color: "#9CA3AF", fontSize: 12 }}>
                      {org.state}
                    </p>
                  )}
                  {org.description && (
                    <p
                      style={{
                        margin: "0 0 8px",
                        color: "#4B5563",
                        fontSize: 13,
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}
                    >
                      {org.description}
                    </p>
                  )}
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#059669",
                      background: "#D1FAE5",
                      padding: "2px 8px",
                      borderRadius: 999
                    }}
                  >
                    {org._count.placements} active placement
                    {org._count.placements !== 1 ? "s" : ""}
                  </span>
                </button>
              ))}
            </section>
          )}
        </>
      )}

      {selectedOrg && loadingOrg && (
        <p style={{ color: "#6B7280" }}>Loading placements...</p>
      )}

      {(selectedOrg ? !loadingOrg : true) && (
        <>
          {placementsView.length === 0 ? (
            <section
              style={{
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                background: "white",
                padding: "2rem",
                textAlign: "center"
              }}
            >
              <p style={{ color: "#6B7280", margin: 0 }}>
                {selectedOrg
                  ? "This organization has no active placements right now."
                  : "No placements listed yet. Select an organization to view their placements."}
              </p>
            </section>
          ) : (
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 12
              }}
            >
              {filteredPlacements.map((placement) => {
                const slots = placement.totalSlots - placement.filledSlots;
                return (
                  <article
                    key={placement.id}
                    style={{
                      border: "1px solid #E5E7EB",
                      borderRadius: 12,
                      background: "white",
                      padding: "0.95rem"
                    }}
                  >
                    <p style={{ margin: 0, color: "#6B7280", fontSize: 13 }}>
                      {placement.organization?.companyName || "Organization"}
                    </p>
                    <h3 style={{ margin: "0.35rem 0" }}>{placement.title}</h3>
                    <p
                      style={{
                        margin: "0 0 0.5rem",
                        color: "#4B5563",
                        fontSize: 14,
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}
                    >
                      {placement.description}
                    </p>
                    <p style={{ margin: "0.35rem 0", fontSize: 13, color: "#374151" }}>
                      {placement.state} {placement.isRemote ? "• Remote" : ""}
                    </p>
                    <p style={{ margin: "0.35rem 0", fontSize: 13 }}>
                      <strong>{slots}</strong> slot{slots !== 1 ? "s" : ""} left
                      {placement.requiredDepartment
                        ? ` • Dept: ${placement.requiredDepartment}`
                        : ""}
                    </p>
                    <p style={{ margin: "0.35rem 0 0.6rem", fontSize: 12, color: "#6B7280" }}>
                      Deadline: {new Date(placement.applicationDeadline).toLocaleDateString()}
                    </p>
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      <button
                        type="button"
                        onClick={() => handleApply(placement.id)}
                        disabled={isPending}
                        style={{
                          flex: 1,
                          border: "none",
                          borderRadius: 8,
                          background: "#059669",
                          color: "white",
                          fontWeight: 700,
                          padding: "0.5rem 0.75rem",
                          opacity: isPending ? 0.7 : 1,
                          cursor: isPending ? "not-allowed" : "pointer",
                          fontSize: 14
                        }}
                      >
                        {isPending ? "Submitting..." : "Apply now"}
                      </button>
                      <Link
                        href={`/student/placements/${placement.id}`}
                        style={{
                          flex: 1,
                          borderRadius: 8,
                          border: "1px solid #D1D5DB",
                          background: "white",
                          padding: "0.5rem 0.75rem",
                          textAlign: "center",
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#374151",
                          textDecoration: "none",
                          display: "inline-block"
                        }}
                      >
                        Details
                      </Link>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </>
      )}
    </main>
  );
}
