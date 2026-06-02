/**
 * Seed script — creates 5 organizations + 5 institutions for testing.
 *
 * Usage:
 *   npx tsx src/scripts/seed.ts
 *
 * Safe to re-run: skips existing emails and institutions by name.
 */

import bcrypt from "bcrypt";
import { prisma } from "../config/database";
import { NigerianState, PlacementStatus, UserRole, VerificationStatus } from "@prisma/client";

const PASSWORD = "Password123!";

const institutions = [
  { name: "University of Lagos", shortName: "UNILAG", state: NigerianState.LAGOS, address: "Akoka, Yaba, Lagos", website: "https://unilag.edu.ng" },
  { name: "Obafemi Awolowo University", shortName: "OAU", state: NigerianState.OSUN, address: "Ile-Ife, Osun State", website: "https://oauife.edu.ng" },
  { name: "University of Ibadan", shortName: "UI", state: NigerianState.OYO, address: "Ibadan, Oyo State", website: "https://ui.edu.ng" },
  { name: "Ahmadu Bello University", shortName: "ABU", state: NigerianState.KADUNA, address: "Zaria, Kaduna State", website: "https://abu.edu.ng" },
  { name: "University of Nigeria, Nsukka", shortName: "UNN", state: NigerianState.ENUGU, address: "Nsukka, Enugu State", website: "https://unn.edu.ng" }
];

const organizations = [
  { email: "info@techinnovate.ng",      companyName: "TechInnovate Nigeria Ltd",       industry: "Technology",         state: "Lagos",         website: "https://techinnovate.ng" },
  { email: "hr@greenfield.ng",          companyName: "Greenfield Engineering Ltd",     industry: "Engineering",        state: "Abuja",         website: "https://greenfield.ng" },
  { email: "contact@medcare.ng",        companyName: "MedCare Health Services",        industry: "Healthcare",         state: "Ibadan",        website: "https://medcare.ng" },
  { email: "admin@agroplus.ng",         companyName: "AgroPlus Integrated Farms",      industry: "Agriculture",        state: "Kaduna",        website: "https://agroplus.ng" },
  { email: "hello@primebank.ng",        companyName: "Prime Bank & Financial Services", industry: "Banking & Finance",   state: "Port Harcourt", website: "https://primebank.ng" }
];

async function main() {
  console.log("Seeding institutions...");
  for (const inst of institutions) {
    const existing = await prisma.institution.findFirst({ where: { name: inst.name } });
    if (existing) {
      console.log(`  SKIP ${inst.shortName} — already exists`);
      continue;
    }
    await prisma.institution.create({ data: inst });
    console.log(`  OK   ${inst.shortName}`);
  }

  console.log("\nSeeding organizations...");
  const hash = await bcrypt.hash(PASSWORD, 12);
  for (const org of organizations) {
    const existing = await prisma.user.findUnique({ where: { email: org.email } });
    if (existing) {
      console.log(`  SKIP ${org.companyName} — already exists`);
      continue;
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: org.email,
          password: hash,
          role: UserRole.ORGANIZATION,
          isActive: true
        }
      });
      const profile = await tx.organization.create({
        data: {
          userId: user.id,
          companyName: org.companyName,
          industry: org.industry,
          state: org.state,
          website: org.website,
          verificationStatus: VerificationStatus.APPROVED,
          verifiedAt: new Date()
        }
      });
      return { user, profile };
    });

    console.log(`  OK   ${org.companyName} — ${org.email} / ${PASSWORD}`);
  }

  console.log("\nSeeding placements...");
  const placementsByOrg: Record<string, Array<{ title: string; description: string; state: string; slots: number; deadlineDays: number; dept?: string }>> = {
    "info@techinnovate.ng": [
      { title: "Junior Software Developer Intern", description: "Work on real-world web applications using React, Node.js, and PostgreSQL. Collaborate with senior developers on feature development and bug fixes.", state: "Lagos", slots: 5, deadlineDays: 30, dept: "Computer Science" },
      { title: "IT Support Intern", description: "Provide technical support for office IT infrastructure. Assist with network configuration, hardware setup, and software installations.", state: "Lagos", slots: 3, deadlineDays: 45 },
      { title: "Data Analytics Intern", description: "Assist the data team with data cleaning, visualization, and reporting using Python and SQL. Learn industry best practices in data management.", state: "Lagos", slots: 2, deadlineDays: 60, dept: "Statistics" }
    ],
    "hr@greenfield.ng": [
      { title: "Civil Engineering Intern", description: "Assist project engineers with site inspections, structural design calculations, and project documentation for ongoing construction projects.", state: "Abuja", slots: 4, deadlineDays: 30, dept: "Civil Engineering" },
      { title: "Electrical Engineering Intern", description: "Support the electrical team with wiring diagrams, load calculations, and on-site electrical system inspections.", state: "Abuja", slots: 3, deadlineDays: 45, dept: "Electrical Engineering" }
    ],
    "contact@medcare.ng": [
      { title: "Medical Records Intern", description: "Assist with digitizing patient records, data entry, and maintaining the hospital's health information management system.", state: "Ibadan", slots: 3, deadlineDays: 30 },
      { title: "Pharmacy Intern", description: "Support the pharmacy department with inventory management, prescription processing, and patient counseling under supervision.", state: "Ibadan", slots: 2, deadlineDays: 45, dept: "Pharmacy" },
      { title: "Administrative Intern", description: "Provide administrative support across departments, including scheduling, correspondence, and records management.", state: "Ibadan", slots: 4, deadlineDays: 60 }
    ],
    "admin@agroplus.ng": [
      { title: "Agricultural Science Intern", description: "Work on modern farming techniques, crop monitoring, and soil analysis. Participate in field research and sustainable farming initiatives.", state: "Kaduna", slots: 5, deadlineDays: 30, dept: "Agriculture" },
      { title: "Supply Chain Intern", description: "Assist with logistics coordination, inventory tracking, and distribution planning for farm produce across northern Nigeria.", state: "Kaduna", slots: 3, deadlineDays: 45 }
    ],
    "hello@primebank.ng": [
      { title: "Banking Operations Intern", description: "Learn banking operations including customer service, account management, transaction processing, and regulatory compliance.", state: "Port Harcourt", slots: 4, deadlineDays: 30, dept: "Business Administration" },
      { title: "Finance Intern", description: "Assist the finance team with financial analysis, budgeting, reconciliation, and report preparation.", state: "Port Harcourt", slots: 2, deadlineDays: 45, dept: "Accounting" }
    ]
  };

  for (const org of organizations) {
    const orgRecord = await prisma.organization.findFirst({
      where: { user: { email: org.email } },
      select: { id: true, companyName: true }
    });
    if (!orgRecord) {
      console.log(`  SKIP placements for ${org.companyName} — org not found`);
      continue;
    }

    const existingPlacements = await prisma.placement.count({
      where: { organizationId: orgRecord.id }
    });
    if (existingPlacements > 0) {
      console.log(`  SKIP ${orgRecord.companyName} — ${existingPlacements} placements already exist`);
      continue;
    }

    const orgPlacements = placementsByOrg[org.email] || [];
    for (const p of orgPlacements) {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + p.deadlineDays);

      await prisma.placement.create({
        data: {
          organizationId: orgRecord.id,
          title: p.title,
          description: p.description,
          state: p.state,
          totalSlots: p.slots,
          requiredDepartment: p.dept,
          status: PlacementStatus.ACTIVE,
          applicationDeadline: deadline
        }
      });
    }
    console.log(`  OK   ${orgRecord.companyName} — ${orgPlacements.length} placements`);
  }

  console.log("\nDone.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
