import cron from "node-cron";
import { NotificationType, PlacementStatus } from "@prisma/client";
import { prisma } from "../config/database";
import { NotificationService } from "../services/notification.service";

export function startDeadlineReminderJob() {
  cron.schedule("0 8 * * *", async () => {
    try {
      const now = new Date();
      const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      const expiringPlacements = await prisma.placement.findMany({
        where: {
          status: PlacementStatus.ACTIVE,
          applicationDeadline: {
            gte: now,
            lte: inThreeDays
          }
        },
        select: { id: true, title: true, state: true, applicationDeadline: true }
      });

      if (expiringPlacements.length === 0) return;

      const students = await prisma.student.findMany({
        select: { userId: true, preferredStates: true, currentState: true }
      });

      for (const placement of expiringPlacements) {
        const targets = students.filter(
          (student) =>
            student.preferredStates.includes(placement.state) || student.currentState === placement.state
        );

        await NotificationService.createMany(
          targets.map((student) => ({
            userId: student.userId,
            type: NotificationType.DEADLINE_REMINDER,
            title: "Placement deadline reminder",
            message: `${placement.title} closes on ${placement.applicationDeadline.toDateString()}`,
            data: { placementId: placement.id }
          }))
        );
      }
    } catch (error) {
      console.error("deadline-reminder-job failed", error);
    }
  });
}
