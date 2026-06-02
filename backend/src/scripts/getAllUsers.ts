/**
 * CLI script to list all users with their profile details.
 *
 * Usage:
 *   npx tsx src/scripts/getAllUsers.ts
 *   npx tsx src/scripts/getAllUsers.ts --json       (JSON output)
 *   npx tsx src/scripts/getAllUsers.ts --role STUDENT (filter by role)
 */

import { prisma } from "../config/database";

type ProfileInfo = {
  type: string;
  name: string;
  extra: string;
};

function getProfile(user: {
  role: string;
  student: { firstName: string; lastName: string; department: string; level: string } | null;
  organization: { companyName: string; verificationStatus: string } | null;
  coordinator: { fullName: string; title: string | null } | null;
}): ProfileInfo {
  if (user.student)
    return {
      type: "STUDENT",
      name: `${user.student.firstName} ${user.student.lastName}`,
      extra: `${user.student.department} Lvl ${user.student.level}`,
    };
  if (user.organization)
    return {
      type: "ORGANIZATION",
      name: user.organization.companyName,
      extra: user.organization.verificationStatus,
    };
  if (user.coordinator)
    return {
      type: "COORDINATOR",
      name: user.coordinator.fullName,
      extra: user.coordinator.title ?? "—",
    };
  return { type: user.role, name: "—", extra: "" };
}

function pad(str: string, len: number): string {
  const visual = str.replace(/\x1b\[\d+m/g, "");
  return str + " ".repeat(Math.max(0, len - visual.length));
}

async function main() {
  const args = process.argv.slice(2);
  const asJson = args.includes("--json");
  const roleFilter = args.find((a) => a.startsWith("--role="))?.split("=")[1]?.toUpperCase();

  const where = roleFilter ? { role: roleFilter as any } : {};

  const users = await prisma.user.findMany({
    where,
    include: {
      student: { select: { firstName: true, lastName: true, department: true, level: true } },
      organization: { select: { companyName: true, verificationStatus: true } },
      coordinator: { select: { fullName: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (asJson) {
    console.log(JSON.stringify(users, null, 2));
    return;
  }

  if (users.length === 0) {
    console.log("No users found.");
    return;
  }

  const rows = users.map((u) => {
    const profile = getProfile(u);
    return {
      ID: u.id.slice(0, 8) + "…",
      Email: u.email,
      Role: profile.type,
      Name: profile.name,
      Active: u.isActive ? "✓" : "✗",
      Details: profile.extra,
      Created: u.createdAt.toISOString().slice(0, 10),
    };
  });

  const widths: Record<string, number> = {};
  for (const key of Object.keys(rows[0])) {
    widths[key] = Math.max(key.length, ...rows.map((r) => (r as any)[key].length));
  }

  const header = Object.keys(rows[0])
    .map((k) => pad(k, widths[k]))
    .join("  ");
  const sep = Object.keys(rows[0])
    .map((k) => "─".repeat(widths[k]))
    .join("──");

  console.log(`\n  Users: ${users.length} total${roleFilter ? ` (role: ${roleFilter})` : ""}\n`);
  console.log("  " + header);
  console.log("  " + sep);
  for (const row of rows) {
    const line = Object.keys(row)
      .map((k) => pad((row as any)[k], widths[k]))
      .join("  ");
    console.log("  " + line);
  }
  console.log();
}

main()
  .catch((err) => {
    console.error("Failed to fetch users:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
