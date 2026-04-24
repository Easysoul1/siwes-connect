"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function BackgroundMotion() {
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.to(".lp-orb-a", {
        x: 36,
        y: -22,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to(".lp-orb-b", {
        x: -28,
        y: 32,
        duration: 9.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to(".lp-float-1", {
        y: -26,
        x: 18,
        rotate: 10,
        scale: 1.05,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to(".lp-float-2", {
        y: 24,
        x: -16,
        rotate: -12,
        duration: 11.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to(".lp-float-3", {
        y: -20,
        x: -24,
        rotate: 8,
        scale: 1.04,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={scopeRef} className="lp-bg-motion" aria-hidden="true">
      <div className="lp-orb lp-orb-a" />
      <div className="lp-orb lp-orb-b" />
      <div className="lp-float lp-float-1" />
      <div className="lp-float lp-float-2" />
      <div className="lp-float lp-float-3" />
    </div>
  );
}
