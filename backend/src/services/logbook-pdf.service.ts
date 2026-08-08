import PDFDocument from "pdfkit";

type LogbookPDFEntry = {
  weekNumber: number;
  date: Date;
  activity: string;
  description: string;
  organizationComment?: string | null;
  organizationSignature?: string | null;
  organizationReviewedAt?: Date | null;
  coordinatorComment?: string | null;
  coordinatorSignature?: string | null;
  coordinatorReviewedAt?: Date | null;
};

type StudentInfo = {
  firstName: string;
  lastName: string;
  matricNumber?: string | null;
  department: string;
  level: string;
  institution?: { name: string } | null;
};

type OrgInfo = {
  companyName: string;
  address?: string | null;
  state?: string | null;
};

export function generateLogbookPDF(
  student: StudentInfo,
  organization: OrgInfo,
  entries: LogbookPDFEntry[]
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - 100;

    // Cover page
    doc.fontSize(24).font("Helvetica-Bold").text("SIWES LOGBOOK", { align: "center" });
    doc.moveDown(2);

    doc.fontSize(12).font("Helvetica");
    const coverData = [
      [`Student Name:`, `${student.firstName} ${student.lastName}`],
      [`Matric Number:`, student.matricNumber || "N/A"],
      [`Department:`, student.department],
      [`Level:`, student.level],
      [`Institution:`, student.institution?.name || "N/A"],
      [],
      [`Organization:`, organization.companyName],
      [`Address:`, organization.address || "N/A"],
      [`State:`, organization.state || "N/A"],
    ];

    for (const [label, value] of coverData) {
      if (!label) { doc.moveDown(); continue; }
      doc.font("Helvetica-Bold").text(label, { continued: true });
      doc.font("Helvetica").text(` ${value}`);
    }

    const dates = entries.map((e) => new Date(e.date)).sort((a, b) => a.getTime() - b.getTime());
    if (dates.length > 0) {
      doc.moveDown();
      doc.font("Helvetica-Bold").text("SIWES Period: ", { continued: true });
      doc.font("Helvetica").text(
        `${dates[0].toLocaleDateString("en-NG")} — ${dates[dates.length - 1].toLocaleDateString("en-NG")}`
      );
    }

    doc.moveDown();
    doc.font("Helvetica-Bold").text("Total Entries: ", { continued: true });
    doc.font("Helvetica").text(`${entries.length}`);

    // Entries by week
    const byWeek = new Map<number, LogbookPDFEntry[]>();
    for (const entry of entries) {
      const list = byWeek.get(entry.weekNumber) || [];
      list.push(entry);
      byWeek.set(entry.weekNumber, list);
    }

    const weeks = Array.from(byWeek.keys()).sort((a, b) => a - b);

    for (const week of weeks) {
      doc.addPage();
      doc.fontSize(16).font("Helvetica-Bold").text(`Week ${week}`);
      doc.moveDown(0.5);

      const weekEntries = byWeek.get(week)!;

      for (let i = 0; i < weekEntries.length; i++) {
        const e = weekEntries[i];
        if (doc.y > 620) doc.addPage();

        doc.fontSize(10).font("Helvetica-Bold").text(`Entry ${i + 1}`, { underline: true });
        doc.moveDown(0.3);

        doc.font("Helvetica-Bold").text("Date: ", { continued: true });
        doc.font("Helvetica").text(new Date(e.date).toLocaleDateString("en-NG"));

        doc.font("Helvetica-Bold").text("Activity: ", { continued: true });
        doc.font("Helvetica").text(e.activity);

        doc.font("Helvetica-Bold").text("Description: ", { continued: true });
        doc.font("Helvetica").text(e.description, { width: pageWidth });

        if (e.organizationComment) {
          doc.moveDown(0.3);
          doc.font("Helvetica-Bold").text("Supervisor Comment: ", { continued: true });
          doc.font("Helvetica").text(e.organizationComment, { width: pageWidth });
          if (e.organizationSignature) {
            doc.font("Helvetica-Oblique").text(`Signed: ${e.organizationSignature}`);
          }
          if (e.organizationReviewedAt) {
            doc.font("Helvetica-Oblique").text(
              `Date: ${new Date(e.organizationReviewedAt).toLocaleDateString("en-NG")}`
            );
          }
        }

        if (e.coordinatorComment) {
          doc.moveDown(0.3);
          doc.font("Helvetica-Bold").text("Coordinator Comment: ", { continued: true });
          doc.font("Helvetica").text(e.coordinatorComment, { width: pageWidth });
          if (e.coordinatorSignature) {
            doc.font("Helvetica-Oblique").text(`Signed: ${e.coordinatorSignature}`);
          }
          if (e.coordinatorReviewedAt) {
            doc.font("Helvetica-Oblique").text(
              `Date: ${new Date(e.coordinatorReviewedAt).toLocaleDateString("en-NG")}`
            );
          }
        }

        doc.moveDown(0.5);
        if (i < weekEntries.length - 1) {
          doc.moveTo(50, doc.y).lineTo(50 + pageWidth, doc.y).stroke("#CCCCCC");
          doc.moveDown(0.5);
        }
      }
    }

    // Sign-off page
    doc.addPage();
    doc.fontSize(16).font("Helvetica-Bold").text("SIGN-OFF", { align: "center" });
    doc.moveDown(2);

    const drawSignatureBlock = (title: string) => {
      doc.fontSize(12).font("Helvetica-Bold").text(title);
      doc.moveDown(0.5);
      doc.font("Helvetica").text("Name: ________________________________");
      doc.moveDown(0.3);
      doc.text("Title: ________________________________");
      doc.moveDown(0.3);
      doc.text("Signature: ________________________________");
      doc.moveDown(0.3);
      doc.text("Date: ________________________________");
      doc.moveDown(2);
    };

    drawSignatureBlock("ORGANIZATION SUPERVISOR");
    drawSignatureBlock("SIWES COORDINATOR");

    doc.end();
  });
}
