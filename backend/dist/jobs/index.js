"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startJobs = startJobs;
const env_1 = require("../config/env");
const deadlineReminder_job_1 = require("./deadlineReminder.job");
const weeklyDigest_job_1 = require("./weeklyDigest.job");
function startJobs() {
    if (env_1.env.NODE_ENV === "test")
        return;
    (0, deadlineReminder_job_1.startDeadlineReminderJob)();
    (0, weeklyDigest_job_1.startWeeklyDigestJob)();
}
