import Link from "next/link";

const roles = [
  {
    title: "Student",
    body: "Find SIWES placements and track applications.",
    href: "/register/student"
  },
  {
    title: "Organization",
    body: "Post placements and manage student applications.",
    href: "/register/organization"
  },
  {
    title: "Coordinator",
    body: "Approve organizations and monitor SIWES outcomes.",
    href: "/register/coordinator"
  }
];

export default function RegisterSelectionPage() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1 className="section-title">Create Account</h1>
        <p className="section-subtitle" style={{ marginBottom: "1rem" }}>
          Select the account type you want to register.
        </p>

        <div className="card-grid">
          {roles.map((role) => (
            <Link
              key={role.title}
              href={role.href}
              className="card"
              style={{
                display: "block",
                borderColor: "#D1D5DB"
              }}
            >
              <h3 style={{ marginTop: 0 }}>{role.title}</h3>
              <p style={{ margin: 0, color: "#4B5563" }}>{role.body}</p>
            </Link>
          ))}
        </div>

        <p style={{ marginBottom: 0, marginTop: "1rem", color: "#4B5563" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#1E40AF", fontWeight: 700 }}>
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
