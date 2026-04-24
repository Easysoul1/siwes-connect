import Link from "next/link";
import { BackgroundMotion } from "@/components/landing/BackgroundMotion";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Building2,
  CheckCircle2,
  GraduationCap,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  Sparkles
} from "lucide-react";

const studentJourney = [
  {
    step: "01",
    title: "Create profile",
    body: "Complete your student profile with field, level, and preferred states."
  },
  {
    step: "02",
    title: "Discover matches",
    body: "Browse verified placements ranked by relevance to your preferences."
  },
  {
    step: "03",
    title: "Apply and track",
    body: "Submit applications and follow status updates from shortlist to confirmation."
  }
];

const organizationJourney = [
  {
    step: "01",
    title: "Get verified",
    body: "Register your company profile and submit compliance documents for approval."
  },
  {
    step: "02",
    title: "Publish placements",
    body: "Create SIWES openings with role details, requirements, and available slots."
  },
  {
    step: "03",
    title: "Review and confirm",
    body: "Evaluate candidates, manage applications, and confirm selected interns."
  }
];

const stats = [
  { value: "1.2K+", label: "Students", icon: GraduationCap },
  { value: "320+", label: "Verified Orgs", icon: Building2 },
  { value: "2.8K+", label: "Applications", icon: LayoutDashboard },
  { value: "68%", label: "Placement Rate", icon: CheckCircle2 }
];

const features = [
  {
    title: "Smart Placement Matching",
    body: "Match students to roles by field, level, and location preferences.",
    icon: Sparkles
  },
  {
    title: "Verified Organization Pipeline",
    body: "Coordinator-led review workflow keeps opportunities high-quality and trusted.",
    icon: ShieldCheck
  },
  {
    title: "Role-Based Workspaces",
    body: "Purpose-built portals for students, organizations, and coordinators.",
    icon: LayoutDashboard
  },
  {
    title: "Coordinator Analytics",
    body: "Track placement outcomes, approvals, and institution-level progress in one place.",
    icon: BarChart3
  },
  {
    title: "Announcement Broadcast",
    body: "Share program updates with targeted groups quickly and consistently.",
    icon: BellRing
  },
  {
    title: "State-Aware Opportunities",
    body: "Discover openings across Nigeria with clear location and availability signals.",
    icon: MapPin
  }
];

export default function LandingPage() {
  return (
    <main className="lp-page">
      <BackgroundMotion />

      <header className="lp-header-wrap">
        <div className="app-container lp-header">
          <Link href="/" className="lp-brand">
            SIWES Connect
          </Link>
          <nav className="lp-nav">
            <Link href="/register/student">For Students</Link>
            <Link href="/register/organization">For Organizations</Link>
            <Link href="/register/coordinator">For Coordinators</Link>
          </nav>
          <div className="lp-header-actions">
            <Link href="/login" className="lp-btn lp-btn-ghost">
              Sign In
            </Link>
            <Link href="/register" className="lp-btn lp-btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="app-container lp-hero">
        <div className="lp-kicker">Built for Nigeria. Scalable for Africa.</div>
        <h1 className="lp-title">Find Your Place. Build Your Future.</h1>
        <p className="lp-subtitle">
          The SIWES marketplace where students, organizations, and institutional coordinators run placements with
          confidence, visibility, and structure.
        </p>
        <div className="lp-hero-ctas">
          <Link href="/register/student" className="lp-btn lp-btn-primary">
            Student Registration <GraduationCap size={16} />
          </Link>
          <Link href="/register/organization" className="lp-btn lp-btn-secondary">
            Organization Registration <Building2 size={16} />
          </Link>
          <Link href="/register/coordinator" className="lp-btn lp-btn-secondary">
            Coordinator Access <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="app-container lp-section">
        <div className="lp-section-head">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Simple, structured flows for students and organizations.</p>
        </div>
        <div className="lp-process-grid">
          <article className="lp-process-card">
            <h3>Student Journey</h3>
            {studentJourney.map((item) => (
              <div key={item.step} className="lp-step">
                <span>{item.step}</span>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.body}</p>
                </div>
              </div>
            ))}
          </article>
          <article className="lp-process-card">
            <h3>Organization Journey</h3>
            {organizationJourney.map((item) => (
              <div key={item.step} className="lp-step">
                <span>{item.step}</span>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.body}</p>
                </div>
              </div>
            ))}
          </article>
        </div>
      </section>

      <section className="app-container lp-section">
        <div className="lp-section-head">
          <h2 className="section-title">Platform Snapshot</h2>
          <p className="section-subtitle">Key metrics at a glance.</p>
        </div>
        <div className="lp-stats-grid">
          {stats.map((item) => (
            <article key={item.label} className="lp-stat-card">
              <div className="lp-stat-top">
                <item.icon size={16} />
                <span>{item.label}</span>
              </div>
              <p className="lp-stat-value">{item.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="app-container lp-section">
        <div className="lp-section-head">
          <h2 className="section-title">Feature Highlights</h2>
          <p className="section-subtitle">Designed for reliable SIWES placement management workflows.</p>
        </div>
        <div className="lp-feature-grid">
          {features.map((feature) => (
            <article className="lp-feature-card" key={feature.title}>
              <feature.icon size={18} />
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="app-container lp-coordinator-strip">
        <div>
          <p>Coordinator-ready operations</p>
          <h3>Monitor student placement outcomes and organization compliance in one dashboard.</h3>
        </div>
        <Link href="/register/coordinator" className="lp-btn lp-btn-primary">
          Coordinator Onboarding <CheckCircle2 size={16} />
        </Link>
      </section>

      <footer className="lp-footer">
        <div className="app-container lp-footer-inner">
          <div>
            <p className="lp-footer-brand">SIWES Connect</p>
            <p className="lp-footer-tagline">Find Your Place. Build Your Future.</p>
          </div>
          <div className="lp-footer-links">
            <Link href="/register/student">Student Registration</Link>
            <Link href="/register/organization">Organization Registration</Link>
            <Link href="/register/coordinator">Coordinator Access</Link>
            <Link href="/login">Sign In</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
