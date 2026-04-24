import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1 className="section-title">Verify Email</h1>
        <p className="section-subtitle" style={{ marginBottom: "1rem" }}>
          Your account verification link will be processed on this page.
        </p>

        <div className="card">
          <p style={{ marginTop: 0, color: "#4B5563" }}>
            Verification token handling is ready in UI flow. Connect email token endpoint to activate automatic account verification.
          </p>
          <Link href="/login" className="btn btn-primary" style={{ display: "inline-flex" }}>
            Continue to Login
          </Link>
        </div>
      </section>
    </main>
  );
}
