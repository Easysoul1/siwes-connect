import { ReactNode } from "react";
import { RolePortalShell } from "@/components/portal/RolePortalShell";

const links = [
  { href: "/student/dashboard", label: "Dashboard" },
  { href: "/student/placements", label: "Placements" },
  { href: "/student/applications", label: "Applications" },
  { href: "/student/profile", label: "Profile" }
];

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <RolePortalShell
      roleName="Student"
      heading="Student Workspace"
      subtitle="Search SIWES placements, track applications, and manage your profile."
      links={links}
    >
      {children}
    </RolePortalShell>
  );
}
