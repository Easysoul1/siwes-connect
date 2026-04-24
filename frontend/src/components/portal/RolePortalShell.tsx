"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

type NavLink = {
  href: string;
  label: string;
};

type Props = {
  roleName: string;
  heading: string;
  subtitle: string;
  links: NavLink[];
  children: ReactNode;
};

export function RolePortalShell({
  roleName,
  heading,
  subtitle,
  links,
  children
}: Props) {
  const pathname = usePathname();
  const { session, setSession } = useAuth();

  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <div className="portal-brand">SIWES Connect</div>
        <div className="portal-role">{roleName} Portal</div>
        <nav className="portal-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`portal-link ${pathname?.startsWith(link.href) ? "portal-link-active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="portal-main">
        <header className="portal-header">
          <div>
            <h1>{heading}</h1>
            <p>{subtitle}</p>
          </div>
          <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
            <span style={{ color: "#4B5563", fontSize: "0.9rem" }}>
              {session?.user.email ?? "Guest"}
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSession(null)}
            >
              Logout
            </button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
