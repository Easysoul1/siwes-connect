import { env } from "../config/env";
import { startDeadlineReminderJob } from "./deadlineReminder.job";
import { startWeeklyDigestJob } from "./weeklyDigest.job";

export function startJobs() {
  if (env.NODE_ENV === "test") return;
  startDeadlineReminderJob();
  startWeeklyDigestJob();
}
