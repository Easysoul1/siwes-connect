import cron from "node-cron";
import { NotificationType, UserRole } from "@prisma/client";
import { prisma } from "../config/database";
import { NotificationService } from "../services/notification.service";

export function startWeeklyDigestJob() {
  cron.schedule("0 21 * * 0", async () => {
    try {
      const [totalStudents, totalOrganizations, totalPlacements, totalApplications] =
        await prisma.$transaction([
          prisma.student.count(),
          prisma.organization.count(),
          prisma.placement.count(),
          prisma.application.count()
        ]);

      const coordinators = await prisma.user.findMany({
        where: {
          role: UserRole.COORDINATOR,
          isActive: true
        },
        select: { id: true }
      });

      await NotificationService.createMany(
        coordinators.map((coordinator) => ({
          userId: coordinator.id,
          type: NotificationType.ANNOUNCEMENT,
          title: "Weekly SIWES digest",
          message: `Students: ${totalStudents}, Organizations: ${totalOrganizations}, Placements: ${totalPlacements}, Applications: ${totalApplications}`,
          data: { totalStudents, totalOrganizations, totalPlacements, totalApplications }
        }))
      );
    } catch (error) {
      console.error("weekly-digest-job failed", error);
    }
  });
}
