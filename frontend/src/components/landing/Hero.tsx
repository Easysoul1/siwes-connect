"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowRight, Briefcase, Building2, GraduationCap } from "lucide-react";

const roleCards = [
  {
    icon: GraduationCap,
    title: "Students",
    body: "Discover verified SIWES placements tailored to your field and location preference."
  },
  {
    icon: Building2,
    title: "Organizations",
    body: "Post roles, screen candidates, and confirm placements from one clean dashboard."
  },
  {
    icon: Briefcase,
    title: "Coordinators",
    body: "Approve organizations, monitor student outcomes, and publish announcements."
  }
];

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-kicker", { y: 20, autoAlpha: 0, duration: 0.5 })
        .from(".hero-title", { y: 28, autoAlpha: 0, duration: 0.7 }, "-=0.1")
        .from(".hero-subtitle", { y: 24, autoAlpha: 0, duration: 0.65 }, "-=0.35")
        .from(".hero-cta", { y: 16, autoAlpha: 0, stagger: 0.09, duration: 0.5 }, "-=0.3")
        .from(".role-card", { y: 28, autoAlpha: 0, stagger: 0.12, duration: 0.55 }, "-=0.3");

      gsap.to(".orb-a", { y: -20, x: 12, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".orb-b", { y: 24, x: -10, duration: 5, repeat: -1, yoyo: true, ease: "sine.inOut" });

      const items = gsap.utils.toArray<HTMLElement>(".magnetic");
      items.forEach((item) => {
        const xTo = gsap.quickTo(item, "x", { duration: 0.3, ease: "power2.out" });
        const yTo = gsap.quickTo(item, "y", { duration: 0.3, ease: "power2.out" });

        const onMove = (event: MouseEvent) => {
          const bounds = item.getBoundingClientRect();
          const x = event.clientX - bounds.left - bounds.width / 2;
          const y = event.clientY - bounds.top - bounds.height / 2;
          xTo(x * 0.14);
          yTo(y * 0.14);
        };

        const onLeave = () => {
          xTo(0);
          yTo(0);
        };

        item.addEventListener("mousemove", onMove);
        item.addEventListener("mouseleave", onLeave);
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="hero-shell">
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="hero-inner">
        <p className="hero-kicker">Built for Nigeria. Scalable for Africa.</p>
        <h1 className="hero-title">Find Your Place. Build Your Future.</h1>
        <p className="hero-subtitle">
          SIWES Connect is a full marketplace for students, organizations, and coordinators to run SIWES placement
          professionally with real-time visibility.
        </p>
        <div className="hero-actions">
          <Link href="/register" className="hero-cta magnetic">
            Get Started <ArrowRight size={16} />
          </Link>
          <Link href="/login" className="hero-cta hero-cta-alt magnetic">
            Sign In
          </Link>
        </div>

        <div className="role-grid">
          {roleCards.map((role) => (
            <article className="role-card" key={role.title}>
              <role.icon size={20} />
              <h3>{role.title}</h3>
              <p>{role.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
