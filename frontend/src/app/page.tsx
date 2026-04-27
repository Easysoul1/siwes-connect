"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./landing.module.css";

gsap.registerPlugin(ScrollTrigger);

// ─── Data ────────────────────────────────────────────────────────────────────

const studentSteps = [
  { n: "01", t: "Create your profile", b: "Complete your academic profile with field, level, CGPA, and preferred placement states across Nigeria." },
  { n: "02", t: "Discover smart matches", b: "Browse verified placements ranked by relevance — scored on location, field of study, level, and CGPA." },
  { n: "03", t: "Apply and track in real time", b: "Submit applications and follow live status updates from shortlist through to placement confirmation." },
];

const orgSteps = [
  { n: "01", t: "Get verified", b: "Register your company and submit CAC and ITF compliance documents for coordinator approval." },
  { n: "02", t: "Publish placements", b: "Create SIWES openings with role details, field requirements, slot count, and stipend info." },
  { n: "03", t: "Review and confirm", b: "Evaluate candidates from your dashboard and confirm selected interns with a single action." },
];

const features = [
  { ico: "✦", t: "Smart Placement Matching", b: "Algorithmic scoring by field, level, location, and CGPA — every match is meaningful and ranked." },
  { ico: "◈", t: "Verified Organization Pipeline", b: "Coordinator-led review with document verification keeps all opportunities trusted and high-quality." },
  { ico: "⊞", t: "Role-Based Workspaces", b: "Purpose-built portals for students, organizations, and institutional coordinators — zero overlap." },
  { ico: "◎", t: "Coordinator Analytics", b: "Track placement outcomes, org approvals, and institution-level progress in one live dashboard." },
  { ico: "◉", t: "Real-Time Notifications", b: "Socket-powered live updates for every status change — no refreshing, no guessing." },
  { ico: "⬡", t: "State-Aware Opportunities", b: "All 36 Nigerian states supported with precise location filtering and live slot availability signals." },
];

const stats = [
  { n: 1200, suffix: "+", label: "Students Registered" },
  { n: 320,  suffix: "+", label: "Verified Organizations" },
  { n: 2800, suffix: "+", label: "Applications Submitted" },
  { n: 68,   suffix: "%", label: "Placement Success Rate" },
];

const tickerItems = [
  "Smart Matching", "Verified Organizations", "Real-Time Notifications",
  "State-Aware Search", "Role-Based Portals", "Coordinator Analytics",
  "ITF Compliant", "68% Placement Rate",
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const ease = "power3.out";

      // ── Entrance timeline ──────────────────────────────────────
      const tl = gsap.timeline({ defaults: { ease } });
      tl.from("#lp-nav",       { y: -70, opacity: 0, duration: 0.7 })
        .from(".lp-kicker",    { y: 18, opacity: 0, duration: 0.55 }, "-=0.35")
        .from("#lp-h1",        { y: 44, opacity: 0, duration: 0.75 }, "-=0.4")
        .from("#lp-p",         { y: 28, opacity: 0, duration: 0.6 }, "-=0.5")
        .from(".lp-hero-btn",  { y: 18, opacity: 0, stagger: 0.1, duration: 0.5 }, "-=0.4")
        .from(".lp-fcard",     { x: 56, opacity: 0, stagger: 0.13, duration: 0.65 }, "-=0.7");

      // Animate progress bars inside floating cards after hero entrance
      setTimeout(() => {
        document.querySelectorAll<HTMLElement>(".lp-bar-fill").forEach((el) => {
          el.style.width = el.dataset.w + "%";
        });
      }, 1000);

      // ── Orb floats ────────────────────────────────────────────
      gsap.to(".lp-orb-1", { y: -50, x: 30, duration: 9,  repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".lp-orb-2", { y: 40,  x: -25, duration: 11, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".lp-orb-3", { y: -30, x: 40, duration: 7,  repeat: -1, yoyo: true, ease: "sine.inOut" });

      // ── Stats counter ─────────────────────────────────────────
      document.querySelectorAll<HTMLElement>(".lp-cnt").forEach((el) => {
        const target = parseInt(el.dataset.t ?? "0", 10);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target, duration: 2.2, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate() { el.textContent = Math.round(obj.v).toLocaleString(); },
        });
      });

      // ── Stats row entrance ────────────────────────────────────
      gsap.from(".lp-stat", {
        y: 30, opacity: 0, stagger: 0.1, duration: 0.6,
        scrollTrigger: { trigger: ".lp-stats-wrap", start: "top 88%" },
      });

      // ── "How it works" ────────────────────────────────────────
      gsap.from("#lp-how .lp-s-head > *", {
        y: 28, opacity: 0, stagger: 0.1, duration: 0.65,
        scrollTrigger: { trigger: "#lp-how", start: "top 82%" },
      });
      gsap.from(".lp-proc-card", {
        y: 50, opacity: 0, stagger: 0.18, duration: 0.75,
        scrollTrigger: { trigger: ".lp-proc-grid", start: "top 82%" },
      });
      gsap.from(".lp-step", {
        x: -18, opacity: 0, stagger: 0.08, duration: 0.5,
        scrollTrigger: { trigger: ".lp-proc-grid", start: "top 72%" },
      });

      // ── Features ──────────────────────────────────────────────
      gsap.from("#lp-feat .lp-s-head > *", {
        y: 28, opacity: 0, stagger: 0.1, duration: 0.65,
        scrollTrigger: { trigger: "#lp-feat", start: "top 82%" },
      });
      gsap.from(".lp-feat-card", {
        y: 42, opacity: 0, stagger: { amount: 0.45, from: "start" }, duration: 0.6,
        scrollTrigger: { trigger: ".lp-feat-grid", start: "top 82%" },
      });

      // ── CTA ───────────────────────────────────────────────────
      gsap.from("#lp-cta .lp-cta-inner > *", {
        y: 34, opacity: 0, stagger: 0.15, duration: 0.7,
        scrollTrigger: { trigger: "#lp-cta", start: "top 85%" },
      });

    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className={styles.lp} ref={rootRef}>

      {/* ── NAV ────────────────────────────────────────────────── */}
      <nav className={styles.nav} id="lp-nav">
        <Link href="/" className={styles.navBrand}>
          SIWES <em>Connect</em>
        </Link>
        <ul className={styles.navLinks}>
          <li><Link href="/register/student">For Students</Link></li>
          <li><Link href="/register/organization">For Organizations</Link></li>
          <li><Link href="/register/coordinator">Coordinators</Link></li>
        </ul>
        <div className={styles.navCtas}>
          <Link href="/login" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}>Sign In</Link>
          <Link href="/register" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}>Get Started</Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className={styles.hero}>
        {/* Ambient orbs */}
        <div className={styles.heroBg}>
          <div className={`${styles.orb} lp-orb-1`} />
          <div className={`${styles.orb} ${styles.orb2} lp-orb-2`} />
          <div className={`${styles.orb} ${styles.orb3} lp-orb-3`} />
        </div>

        {/* Main copy */}
        <div className={styles.heroContent}>
          <div className={`${styles.kicker} lp-kicker`}>
            <span className={styles.kickerDot} />
            Built for Nigeria · Scalable for Africa
          </div>
          <h1 className={styles.heroH1} id="lp-h1">
            Find <span>Your Place.</span><br />
            Build <span>Your Future.</span>
          </h1>
          <p className={styles.heroP} id="lp-p">
            The SIWES marketplace where students, organizations, and institutional coordinators run placements with structure, visibility, and real confidence.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/register/student" className={`${styles.btn} ${styles.btnPrimary} lp-hero-btn`}>
              Student Registration →
            </Link>
            <Link href="/register/organization" className={`${styles.btn} ${styles.btnGhost} lp-hero-btn`}>
              For Organizations
            </Link>
            <Link href="/register/coordinator" className={`${styles.btn} ${styles.btnGhost} lp-hero-btn`}>
              Coordinators
            </Link>
          </div>
        </div>

        {/* Floating UI cards */}
        <div className={styles.floatCards}>
          <div className={`${styles.fcard} lp-fcard`}>
            <div className={styles.fcardRow}>
              <span className={styles.fcardTag}>Student</span>
              <span className={`${styles.chip} ${styles.chipGreen}`}>92% match</span>
            </div>
            <div className={styles.fcardName}>Amara Okafor</div>
            <div className={styles.fcardMeta}>Computer Science · 300L · Lagos</div>
            <div className={styles.bar}><div className={`${styles.barFill} ${styles.barGreen} lp-bar-fill`} style={{ width: 0 }} data-w="92" /></div>
          </div>

          <div className={`${styles.fcard} lp-fcard`}>
            <div className={styles.fcardRow}>
              <span className={styles.fcardTag}>Placement Open</span>
              <span className={`${styles.chip} ${styles.chipGold}`}>2 slots left</span>
            </div>
            <div className={styles.fcardName}>Software Developer Intern</div>
            <div className={styles.fcardMeta}>Flutterwave · Lagos · ₦50,000/mo</div>
            <div className={styles.bar}><div className={`${styles.barFill} ${styles.barGreen} lp-bar-fill`} style={{ width: 0 }} data-w="78" /></div>
          </div>

          <div className={`${styles.fcard} lp-fcard`}>
            <div className={styles.fcardRow}>
              <span className={styles.fcardTag}>Application</span>
              <span className={`${styles.chip} ${styles.chipBlue}`}>✓ Accepted</span>
            </div>
            <div className={styles.fcardName}>Chidi Eze → Interswitch</div>
            <div className={styles.fcardMeta}>Confirmed placement · Starts Feb 3</div>
            <div className={styles.bar}><div className={`${styles.barFill} ${styles.barBlue} lp-bar-fill`} style={{ width: 0 }} data-w="100" /></div>
          </div>
        </div>
      </section>

      {/* ── TICKER ─────────────────────────────────────────────── */}
      <div className={styles.tickerWrap}>
        <div className={styles.tickerTrack}>
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <div className={styles.tItem} key={i}>
              <div className={styles.tDot} />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS ──────────────────────────────────────────────── */}
      <div className={`${styles.statsWrap} lp-stats-wrap`}>
        {stats.map((s) => (
          <div className={`${styles.stat} lp-stat`} key={s.label}>
            <div className={styles.statN}>
              <span className="lp-cnt" data-t={String(s.n)}>0</span>
              <span>{s.suffix}</span>
            </div>
            <div className={styles.statL}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── HOW IT WORKS ───────────────────────────────────────── */}
      <section className={styles.section} id="lp-how">
        <div className={`${styles.sHead} lp-s-head`}>
          <p className={styles.sLabel}>The Process</p>
          <h2 className={styles.sH2}>Simple. Structured.<br />Effective.</h2>
          <p className={styles.sSub}>Purpose-built workflows for every stakeholder in the SIWES ecosystem.</p>
        </div>
        <div className={`${styles.procGrid} lp-proc-grid`}>
          {/* Student card */}
          <div className={`${styles.procCard} lp-proc-card`}>
            <div className={styles.procRole}>
              <div className={`${styles.roleIco} ${styles.icoGreen}`}>🎓</div>
              <span className={styles.roleLabel}>Student Journey</span>
            </div>
            {studentSteps.map((s) => (
              <div className={`${styles.step} lp-step`} key={s.n}>
                <div className={styles.stepN}>{s.n}</div>
                <div><div className={styles.stepT}>{s.t}</div><div className={styles.stepB}>{s.b}</div></div>
              </div>
            ))}
          </div>
          {/* Organization card */}
          <div className={`${styles.procCard} lp-proc-card`}>
            <div className={styles.procRole}>
              <div className={`${styles.roleIco} ${styles.icoGold}`}>🏢</div>
              <span className={styles.roleLabel}>Organization Journey</span>
            </div>
            {orgSteps.map((s) => (
              <div className={`${styles.step} lp-step`} key={s.n}>
                <div className={styles.stepN}>{s.n}</div>
                <div><div className={styles.stepT}>{s.t}</div><div className={styles.stepB}>{s.b}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionAlt}`} id="lp-feat">
        <div className={`${styles.sHead} lp-s-head`}>
          <p className={styles.sLabel}>Capabilities</p>
          <h2 className={styles.sH2}>Everything<br />you need.</h2>
          <p className={styles.sSub}>Designed for reliable SIWES placement management at every level of the ecosystem.</p>
        </div>
        <div className={`${styles.featGrid} lp-feat-grid`}>
          {features.map((f) => (
            <div className={`${styles.featCard} lp-feat-card`} key={f.t}>
              <div className={styles.featIco}>{f.ico}</div>
              <div className={styles.featT}>{f.t}</div>
              <div className={styles.featB}>{f.b}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA STRIP ──────────────────────────────────────────── */}
      <div className={styles.ctaStrip} id="lp-cta">
        <div className={styles.ctaOrb} />
        <div className={`${styles.ctaInner} lp-cta-inner`}>
          <h2 className={styles.ctaH2}>
            Ready to connect students<br />with <em>real opportunity?</em>
          </h2>
          <div className={styles.ctaBtns}>
            <Link href="/register/student" className={`${styles.btn} ${styles.btnPrimary}`}>
              Student Registration
            </Link>
            <Link href="/register/organization" className={`${styles.btn} ${styles.btnGhost} ${styles.btnDim}`}>
              For Organizations
            </Link>
          </div>
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div>
          <div className={styles.footerBrand}>SIWES <em>Connect</em></div>
          <div className={styles.footerTag}>Find Your Place. Build Your Future.</div>
        </div>
        <div className={styles.footerR}>© 2025 SIWES Connect · Built for Nigeria</div>
      </footer>

    </div>
  );
}