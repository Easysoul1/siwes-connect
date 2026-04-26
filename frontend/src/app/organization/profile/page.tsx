"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import {
  getOrganizationProfile,
  uploadOrganizationDocument,
  updateOrganizationProfile
} from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";

export default function OrganizationProfilePage() {
  const { session } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("PENDING");
  const [message, setMessage] = useState<string | null>(null);
  const [cacFile, setCacFile] = useState<File | null>(null);
  const [itfFile, setItfFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!session?.accessToken) return;
    startTransition(async () => {
      try {
        const profile = await getOrganizationProfile(session.accessToken);
        setCompanyName(profile.companyName);
        setVerificationStatus(profile.verificationStatus);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load profile");
      }
    });
  }, [session?.accessToken]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session?.accessToken) {
      setMessage("Sign in as organization to update profile.");
      return;
    }

    startTransition(async () => {
      try {
        await updateOrganizationProfile(session.accessToken, { companyName });
        if (cacFile) {
          await uploadOrganizationDocument(session.accessToken, cacFile, "cac");
        }
        if (itfFile) {
          await uploadOrganizationDocument(session.accessToken, itfFile, "itf");
        }
        setMessage("Organization profile updated.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Profile update failed");
      }
    });
  }

  return (
    <main className="app-container" style={{ paddingBottom: "2rem" }}>
      <section className="card">
        <h2 className="section-title">Organization Profile</h2>
        <p className="section-subtitle" style={{ marginBottom: "1rem" }}>
          Manage organization details and keep verification documents current.
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.8rem" }}>
          <div>
            <label className="label">Company Name</label>
            <input
              className="input"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Verification Status</label>
            <input className="input" value={verificationStatus} readOnly />
          </div>
          <div className="form-grid">
            <div>
              <label className="label">CAC Document</label>
              <input
                className="input"
                type="file"
                accept=".pdf,image/png,image/jpeg"
                onChange={(event) => setCacFile(event.target.files?.[0] ?? null)}
              />
            </div>
            <div>
              <label className="label">ITF Document</label>
              <input
                className="input"
                type="file"
                accept=".pdf,image/png,image/jpeg"
                onChange={(event) => setItfFile(event.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Profile"}
          </button>
        </form>

        {message ? <p style={{ marginBottom: 0, color: "#4B5563" }}>{message}</p> : null}
      </section>
    </main>
  );
}
