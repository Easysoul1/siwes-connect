import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { prisma } from "../config/database";
import { generateAcceptanceLetterPDF } from "../services/acceptance-letter-pdf.service";
import {
  approveOrganization,
  createAnnouncement,
  deleteAnnouncement,
  exportAnalytics,
  getAnalytics,
  getAnnouncements,
  getApplications,
  getDashboardStats,
  getOrganizationById,
  getOrganizations,
  getPendingOrganizations,
  getPlacements,
  getStudentById,
  getStudents,
  rejectOrganization,
  suspendOrganization,
  updateCoordinatorProfile
} from "../controllers/coordinator.controller";
import {
  getCoordStudents,
  getStudentLogbook as getCoordStudentLogbook,
  addCoordComment
} from "../controllers/coord-logbook.controller";

export const coordinatorRouter = Router();

coordinatorRouter.use(authenticate, authorize(UserRole.COORDINATOR));

coordinatorRouter.get("/dashboard/stats", getDashboardStats);

coordinatorRouter.put("/profile", updateCoordinatorProfile);

coordinatorRouter.get("/organizations", getOrganizations);
coordinatorRouter.get("/organizations/pending", getPendingOrganizations);
coordinatorRouter.get("/organizations/:id", getOrganizationById);
coordinatorRouter.patch("/organizations/:id/approve", approveOrganization);
coordinatorRouter.patch("/organizations/:id/reject", rejectOrganization);
coordinatorRouter.patch("/organizations/:id/suspend", suspendOrganization);

coordinatorRouter.get("/students", getStudents);
coordinatorRouter.get("/students/:id", getStudentById);

coordinatorRouter.get("/institution/students", getCoordStudents);
coordinatorRouter.get("/institution/students/:studentId/logbook", getCoordStudentLogbook);
coordinatorRouter.patch("/logbook/:entryId/comment", addCoordComment);

coordinatorRouter.get("/applications/:id/acceptance-letter", async (req, res, next) => {
  try {
    const { id: applicationId } = req.params;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        student: { include: { institution: true } },
        placement: true,
        organization: true
      }
    });

    if (!application) {
      return res.status(404).json({ status: "error", message: "Application not found" });
    }

    if (application.status !== "ACCEPTED" && application.status !== "PLACEMENT_CONFIRMED") {
      return res.status(400).json({ status: "error", message: "Application not accepted yet" });
    }

    let coordinator = null;
    if (application.student?.institutionId) {
      coordinator = await prisma.coordinator.findFirst({
        where: { institutionId: application.student.institutionId },
        include: { institution: { select: { name: true } } }
      });
    }

    const pdfBuffer = await generateAcceptanceLetterPDF({
      student: {
        firstName: application.student.firstName,
        lastName: application.student.lastName,
        matricNumber: application.student.matricNumber,
        department: application.student.department,
        level: application.student.level,
        institution: application.student.institution
      },
      organization: {
        companyName: application.organization.companyName,
        contactPersonName: application.organization.contactPersonName,
        contactPersonTitle: application.organization.contactPersonTitle,
        contactEmail: application.organization.contactEmail,
        contactPhone: application.organization.contactPhone,
        address: application.organization.address,
        state: application.organization.state
      },
      placement: {
        title: application.placement.title,
        durationWeeks: application.placement.durationWeeks,
        startDate: application.placement.startDate,
        state: application.placement.state
      },
      coordinator
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="acceptance-letter.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
});

coordinatorRouter.get("/placements", getPlacements);
coordinatorRouter.get("/applications", getApplications);

coordinatorRouter.get("/analytics", getAnalytics);
coordinatorRouter.get("/analytics/export", exportAnalytics);

coordinatorRouter.post("/announcements", createAnnouncement);
coordinatorRouter.get("/announcements", getAnnouncements);
coordinatorRouter.delete("/announcements/:id", deleteAnnouncement);
