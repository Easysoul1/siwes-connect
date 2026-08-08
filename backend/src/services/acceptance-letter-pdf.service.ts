import PDFDocument from "pdfkit";

type AcceptanceLetterData = {
  student: {
    firstName: string;
    lastName: string;
    matricNumber?: string | null;
    department: string;
    level: string;
    institution?: { name: string } | null;
  };
  organization: {
    companyName: string;
    contactPersonName?: string | null;
    contactPersonTitle?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    address?: string | null;
    state?: string | null;
  };
  placement: {
    title: string;
    durationWeeks?: number | null;
    startDate?: Date | null;
    state?: string | null;
  };
  coordinator?: {
    fullName: string;
    institution?: { name: string } | null;
  } | null;
};

export function generateAcceptanceLetterPDF(data: AcceptanceLetterData): Promise<Buffer> {
  const { student, organization, placement, coordinator } = data;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 60 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const today = new Date().toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    // Header
    doc.fontSize(18).font("Helvetica-Bold").text("ACCEPTANCE LETTER", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica").text(`Date: ${today}`, { align: "right" });
    doc.moveDown(2);

    // Greeting
    doc.fontSize(12).font("Helvetica").text(`Dear ${student.firstName} ${student.lastName},`);
    doc.moveDown(0.5);

    // Body
    doc.text(
      `We are pleased to inform you that your application for the SIWES placement at ${organization.companyName} has been accepted.`
    );
    doc.moveDown(1);

    // Placement details
    doc.fontSize(12).font("Helvetica-Bold").text("PLACEMENT DETAILS");
    doc.moveDown(0.3);
    doc.fontSize(11).font("Helvetica");

    const placementDetails = [
      [`Position:`, placement.title],
      [`Duration:`, placement.durationWeeks ? `${placement.durationWeeks} weeks` : "To be confirmed"],
      [`Start Date:`, placement.startDate ? new Date(placement.startDate).toLocaleDateString("en-NG") : "To be confirmed"],
      [`Location:`, `${placement.state || organization.state || "Nigeria"}`],
    ];

    for (const [label, value] of placementDetails) {
      doc.font("Helvetica-Bold").text(label, { continued: true });
      doc.font("Helvetica").text(` ${value}`);
    }
    doc.moveDown(1);

    // Student details
    doc.font("Helvetica-Bold").text("STUDENT DETAILS");
    doc.moveDown(0.3);
    doc.font("Helvetica");

    const studentDetails = [
      [`Name:`, `${student.firstName} ${student.lastName}`],
      [`Matric No:`, student.matricNumber || "N/A"],
      [`Department:`, student.department],
      [`Level:`, student.level],
      [`Institution:`, student.institution?.name || "N/A"],
    ];

    for (const [label, value] of studentDetails) {
      doc.font("Helvetica-Bold").text(label, { continued: true });
      doc.font("Helvetica").text(` ${value}`);
    }
    doc.moveDown(1);

    // Terms
    doc.font("Helvetica-Bold").text("TERMS AND CONDITIONS");
    doc.moveDown(0.3);
    doc.font("Helvetica");

    const terms = [
      "You are expected to report on the start date at the organization's address.",
      "You must adhere to the organization's rules and regulations.",
      "Your supervisor will be assigned upon arrival.",
      "You are required to maintain a weekly logbook of activities.",
      "This placement is subject to your institution's SIWES guidelines.",
    ];

    terms.forEach((term, i) => {
      doc.text(`${i + 1}. ${term}`, { width: doc.page.width - 120 });
      doc.moveDown(0.3);
    });
    doc.moveDown(1);

    doc.text("We look forward to having you.");
    doc.moveDown(2);

    // Organization signature
    doc.font("Helvetica-Bold").text("______________________________");
    doc.font("Helvetica").text(organization.contactPersonName || organization.companyName);
    if (organization.contactPersonTitle) {
      doc.text(organization.contactPersonTitle);
    }
    doc.text(organization.companyName);
    if (organization.contactEmail) doc.text(organization.contactEmail);
    if (organization.contactPhone) doc.text(organization.contactPhone);
    doc.moveDown(2);

    // Coordinator signature
    if (coordinator) {
      doc.font("Helvetica-Bold").text("______________________________");
      doc.font("Helvetica").text("Coordinator Acknowledgment");
      doc.text(coordinator.fullName);
      if (coordinator.institution) {
        doc.text(coordinator.institution.name);
      }
    }

    doc.end();
  });
}
