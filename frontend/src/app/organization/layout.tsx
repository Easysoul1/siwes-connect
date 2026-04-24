import { ReactNode } from "react";
import { RolePortalShell } from "@/components/portal/RolePortalShell";

const links = [
  { href: "/organization/dashboard", label: "Dashboard" },
  { href: "/organization/placements", label: "Placements" },
  { href: "/organization/applications", label: "Applications" },
  { href: "/organization/profile", label: "Profile" }
];

export default function OrganizationLayout({ children }: { children: ReactNode }) {
  return (
    <RolePortalShell
      roleName="Organization"
      heading="Organization Workspace"
      subtitle="Post placements, review candidates, and keep your profile verification-ready."
      links={links}
    >
      {children}
    </RolePortalShell>
  );
}
