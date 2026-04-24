import { ReactNode } from "react";
import { RolePortalShell } from "@/components/portal/RolePortalShell";

const links = [
  { href: "/coordinator/dashboard", label: "Dashboard" },
  { href: "/coordinator/organizations", label: "Organizations" },
  { href: "/coordinator/students", label: "Students" },
  { href: "/coordinator/analytics", label: "Analytics" },
  { href: "/coordinator/announcements", label: "Announcements" }
];

export default function CoordinatorLayout({ children }: { children: ReactNode }) {
  return (
    <RolePortalShell
      roleName="Coordinator"
      heading="Coordinator Workspace"
      subtitle="Oversee SIWES program health across organizations, students, and outcomes."
      links={links}
    >
      {children}
    </RolePortalShell>
  );
}
