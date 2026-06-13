import { jsPDF } from "jspdf";
import type { ExamResult } from "@/api/axios";

interface AdmitCardData {
  result: ExamResult;
  date: string;
  session: "FN" | "AN";
}

function fmt(d: string) {
  if (!d) return "";
  const p = d.split("-");
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d;
}

export function generateAdmitCardPdf(data: AdmitCardData): void {
  const { result, date, session } = data;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const W = 210;
  // A4 is 210x297
  // On screen layout was ~794px wide. mm = px * (210/794) = px * 0.2644

  const MAROON = [138, 23, 39] as [number, number, number];

  // ══════════════════════════════════════════════
  // PAGE 1
  // ══════════════════════════════════════════════

  // MAROON HEADER (Height ~30mm)
  doc.setFillColor(...MAROON);
  doc.rect(0, 5, W, 32, "F");

  // Logo mock
  doc.setFillColor(255, 255, 255);
  doc.circle(28, 21, 11, "F"); // white circle
  doc.setDrawColor(...MAROON);
  doc.setLineWidth(0.4);
  doc.circle(28, 21, 9, "S"); // inner dashed
  doc.setTextColor(...MAROON);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("LOGO", 28, 22, { align: "center" });

  doc.setFontSize(4);
  doc.text("JUSTICE PEACE REVOLUTION", 28, 30.5, { align: "center" });

  // Main header text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("SATHYABAMA", 45, 17, { charSpace: 0.5 });

  doc.setFontSize(10.5);
  doc.text("INSTITUTE OF SCIENCE AND TECHNOLOGY", 45, 22.5, { charSpace: 0.2 });

  doc.setFontSize(8);
  // Center this one relative to the line above
  doc.text("(DEEMED TO BE UNIVERSITY)", 105, 27, { align: "center", charSpace: 0.5 });

  doc.setFontSize(10);
  doc.text("CATEGORY - 1 UNIVERSITY BY UGC", 105, 32.5, { align: "center", charSpace: 0.2 });

  // INNER BORDER
  const bX = 10;
  const bW = W - 20;
  // Height from just under the header to the bottom
  const bY = 37;
  const bH = 245;

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.rect(bX, bY, bW, bH, "S");

  // SUB-HEADER
  let y = bY + 12;
  // Sub logo
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(168, 204, 228);
  doc.setLineWidth(0.5);
  doc.circle(bX + 18, y, 6, "FD");
  doc.setTextColor(...MAROON);
  doc.setFontSize(4);
  doc.text("SIST\nLOGO", bX + 18, y - 0.5, { align: "center" });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("(DEEMED TO BE UNIVERSITY - ESTABLISHED UNDER SECTION 3 OF UGC ACT, 1956)", W / 2, y - 1.5, { align: "center" });
  doc.text("Jeppiaar Nagar, Rajiv Gandhi Salai, Chennai 600119.", W / 2, y + 2.5, { align: "center" });

  // COURSE INFO
  y += 18;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  const leftX = bX + 6;
  const rightX = bX + bW - 6;

  doc.text("Course:", leftX, y);
  doc.setFont("helvetica", "bold");
  doc.text(result.program || "B.E", leftX + 16, y);

  doc.setFont("helvetica", "normal");
  doc.text("Forenoon Session - ", rightX - 38, y);
  doc.setFont("helvetica", "bold");
  doc.text("09:30 AM to 12:30 PM", rightX, y, { align: "right" });

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text("Branch:", leftX, y);
  doc.setFont("helvetica", "bold");
  doc.text(result.branch || "COMPUTER SCIENCE AND ENGINEERING", leftX + 16, y);

  doc.setFont("helvetica", "normal");
  doc.text("Afternoon Session - ", rightX - 38, y);
  doc.setFont("helvetica", "bold");
  doc.text("01:00 PM to 04:00 PM", rightX, y, { align: "right" });

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text("Batch: ", leftX, y);
  doc.setFont("helvetica", "bold");
  doc.text("2023-2027", leftX + 16, y);

  doc.setFont("helvetica", "normal");
  doc.text("Year of Examination: -", rightX, y, { align: "right" });

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text("Month: ", leftX, y);
  doc.setFont("helvetica", "bold");
  doc.text("APR 2025", leftX + 16, y);

  // TITLE
  y += 18;
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("REGULAR HALL TICKET - THEORY", W / 2, y, { align: "center", charSpace: 0.1 });

  y += 6;
  doc.setDrawColor(226, 226, 226);
  doc.setLineWidth(0.3);
  doc.line(bX, y, bX + bW, y);

  // STUDENT DETAILS
  y += 12;
  doc.setFontSize(11.5);
  doc.setFont("helvetica", "normal");
  doc.text("Name of the Student:", leftX, y);
  doc.setFont("helvetica", "bold");
  doc.text("P AKASH", leftX + 45, y);

  // Photo mock box
  doc.setFillColor(203, 25, 30);
  doc.setDrawColor(221, 221, 221);
  doc.rect(rightX - 25, y - 4, 25, 30, "FD");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Photo", rightX - 12.5, y + 11, { align: "center" });

  y += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11.5);
  doc.text("Register Number:", leftX, y + 2.5);

  const regDigits = result.reg_no.split("");
  while (regDigits.length < 8) regDigits.push(""); // strict 8

  const boxW = 8;
  const boxH = 8;
  let curX = leftX + 45;

  // top and left borders for the whole box block
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(curX, y - 3, curX + 8 * boxW, y - 3); // top
  doc.line(curX, y - 3, curX, y - 3 + boxH);     // left

  for (let i = 0; i < 8; i++) {
    // bottom
    doc.line(curX, y - 3 + boxH, curX + boxW, y - 3 + boxH);
    // right
    doc.line(curX + boxW, y - 3, curX + boxW, y - 3 + boxH);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(regDigits[i], curX + boxW / 2, y + 2.5, { align: "center" });
    curX += boxW;
  }

  // TABLE
  y += 18;
  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.3);

  const cWidths = [12, 24, 60, 18, 16, 26, 24];
  const cX = [bX];
  for (let i = 0; i < cWidths.length; i++) {
    cX.push(cX[i] + cWidths[i]);
  }

  // Table Headers
  const hH = 10;
  doc.line(bX, y, bX + bW, y); // top
  doc.line(bX, y + hH, bX + bW, y + hH); // bottom

  for (let i = 0; i < cX.length; i++) {
    doc.line(cX[i], y, cX[i], y + hH);
  }

  doc.setTextColor(153, 153, 153);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");

  doc.text("S.No", cX[0] + cWidths[0] / 2, y + 6, { align: "center" });
  doc.text("Course Code", cX[1] + cWidths[1] / 2, y + 6, { align: "center" });
  doc.text("Course Title", cX[2] + cWidths[2] / 2, y + 6, { align: "center" });
  doc.text("Course\nType", cX[3] + cWidths[3] / 2, y + 4.5, { align: "center" });
  doc.text("Category", cX[4] + cWidths[4] / 2, y + 6, { align: "center" });
  doc.text("Date-\nSession", cX[5] + cWidths[5] / 2, y + 4.5, { align: "center" });
  doc.text("Attendance\n%", cX[6] + cWidths[6] / 2, y + 4.5, { align: "center" });

  // Rows Data
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  y += hH;
  // single main row for our data
  const rowH = 12;
  const fDate = fmt(date);
  const rows = [
    ["1", result.reg_no === "43110042" ? "SCSB4018" : (result.course_name ? "SUB101" : "SCSB4018"), result.course_name || "Introduction to Machine Learning", "Theory", "Elective", `${fDate} -\n${session}`, "89.66"],
    ["2", "SMTB1402", "Probability and\nStatistics", "Theory", "Core", "10/05/2025 -\nFN", "100"],
    ["3", "SITB3005", "Beginner Full Stack\nWeb Development", "Theory", "Elective", "15/05/2025 -\nFN", "96.3"],
    ["4", "SCSB0B1401", "Operating Systems and\nUnix", "Theory", "Core", "08/05/2025 -\nFN", "93.94"]
  ];

  for (const row of rows) {
    doc.line(bX, y + rowH, bX + bW, y + rowH); // bottom of row
    for (let i = 0; i < cX.length; i++) {
      doc.line(cX[i], y, cX[i], y + rowH); // verticals
    }

    for (let i = 0; i < row.length; i++) {
      const isMulti = row[i].includes("\n");
      doc.text(row[i], cX[i] + cWidths[i] / 2, y + (isMulti ? 5.5 : 7), { align: "center" });
    }
    y += rowH;
  }

  // SIGNATURES
  y += 24;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(leftX, y, leftX + 50, y);
  doc.setLineDashPattern([], 0);

  // mock sig image right
  doc.setFont("Times", "italic");
  doc.setFontSize(18);
  doc.text("Slparatn", rightX - 25, y - 2, { angle: -10, align: "center" });

  doc.setDrawColor(120, 120, 120);
  doc.setLineDashPattern([2, 1], 0);
  doc.line(rightX - 50, y, rightX, y);
  doc.setLineDashPattern([], 0);

  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("Signature of the Candidate", leftX, y);
  doc.text("Controller of Examinations", rightX - 25, y, { align: "center" });

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Note: This hall ticket is not valid for arrear exam", leftX, y);

  y += 10;
  doc.setFontSize(10);
  doc.text("Instructions to Candidates", W / 2, y, { align: "center" });

  // Footers
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(7);
  doc.text("about:blank", 12, 280.5);
  doc.text("1/2", 198, 280.5, { align: "right" });
  doc.text("5/5/25, 7:07 PM", 12, 10);
  doc.text("Print tab", W / 2, 10, { align: "center" });

  // ══════════════════════════════════════════════
  // PAGE 2
  // ══════════════════════════════════════════════
  doc.addPage();

  // Outer Border page 2
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.rect(bX, 15, bW, 260, "S"); // approx height for instructions

  y = 25;
  const pLeft = bX + 6;
  const pWidth = bW - 12;

  const insLines = [
    { text: "All candidates should bring their Hall ticket and valid Identity card for every examination for verifying their identity in the examination hall, failing which they will not be permitted to write the examination.", bold: "" },
    { text: "The students are advised to view their seating arrangements for Regular Examinations in the Institute Website well in advance. For Arrear Exams, please look at the Exam Office Notice Board on the day of the Exam.", bold: "seating arrangements for Regular Examinations" },
    { text: "The students are strictly not permitted to possess Cell Phones / Programmable Calculators inside the examination hall. Any violation of this will be viewed very seriously and it will be confiscated.", bold: "Cell Phones / Programmable Calculators" },
    { text: "Students will not be allowed to write the end semester Examination for Engineering Graphics, Machine Drawing and other Drawing related subjects, if they do not possess a Mini Drafter.", bold: "Students will not be allowed to write the end semester Examination for Engineering Graphics, Machine Drawing and other Drawing related subjects, if they do not possess a Mini Drafter." },
    { text: "Data books/IS codes/ Graph Sheets/ Charts / Tables will be issued by the Institute only.", bold: "" },
    { text: "The students are advised to enter the examination hall 10 minutes before the commencement of examination. They should come in the official dress code.", bold: "They should come in the official dress code." },
    { text: "Students will be allowed to leave the Exam halls only at the end of three hours.", bold: "" },
    { text: "MALPRACTICE DURING EXAMINATIONS:\nIf a student has been caught indulging in any malpractice, during any of the end semester Theory or Practical Examinations severe action will be taken, as per the Institute rules and regulations.", bold: "MALPRACTICE DURING EXAMINATIONS:" }
  ];

  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);

  for (const line of insLines) {
    doc.setFont("helvetica", "normal");

    // We will rudimentarily draw bullet points and text.
    doc.circle(pLeft + 2, y - 1, 0.6, "F");

    // Quick multi-line with bold sections trick for jsPDF
    const wrapText = doc.splitTextToSize(line.text, pWidth - 6);

    let isAllBold = line.text === line.bold;
    if (isAllBold) {
      doc.setFont("helvetica", "bold");
      for (const t of wrapText) {
        doc.text(t, pLeft + 6, y);
        y += 4.5;
      }
    } else if (line.bold) {
      // split manually around bold
      let splitIdx = wrapText.findIndex((t: string) => t.includes(line.bold.substring(0, 10)));
      if (splitIdx < 0) splitIdx = 0; // naive

      for (let i = 0; i < wrapText.length; i++) {
        if (wrapText[i].includes(line.bold) || (line.bold.includes(wrapText[i].trim()) && wrapText[i].trim() !== "")) {
          doc.setFont("helvetica", "bold");
        } else {
          doc.setFont("helvetica", "normal");
        }
        doc.text(wrapText[i], pLeft + 6, y);
        y += 4.5;
      }
    } else {
      doc.setFont("helvetica", "normal");
      for (const t of wrapText) {
        doc.text(t, pLeft + 6, y);
        y += 4.5;
      }
    }
    y += 1.5;
  }

  // QR Code
  y += 20;
  const qrSize = 80;
  const qrX = W / 2 - qrSize / 2;

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(qrX, y, qrSize, qrSize);

  // mock QR dots
  for (let r = 0; r < qrSize; r += 3) {
    for (let c = 0; c < qrSize; c += 3) {
      if (Math.random() > 0.4) {
        doc.rect(qrX + c, y + r, 3, 3, "F");
      }
    }
  }

  doc.setFillColor(255, 255, 255);
  doc.rect(qrX + 4, y + 4, 16, 16, "F");
  doc.rect(qrX + qrSize - 20, y + 4, 16, 16, "F");
  doc.rect(qrX + 4, y + qrSize - 20, 16, 16, "F");
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1);
  doc.rect(qrX + 6, y + 6, 12, 12, "S");
  doc.rect(qrX + qrSize - 18, y + 6, 12, 12, "S");
  doc.rect(qrX + 6, y + qrSize - 18, 12, 12, "S");
  doc.rect(qrX + 9, y + 9, 6, 6, "F");
  doc.rect(qrX + qrSize - 15, y + 9, 6, 6, "F");
  doc.rect(qrX + 9, y + qrSize - 15, 6, 6, "F");

  // Footers
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(7);
  doc.text("about:blank", 12, 280.5);
  doc.text("2/2", 198, 280.5, { align: "right" });
  doc.text("5/5/25, 7:07 PM", 12, 10);
  doc.text("Print tab", W / 2, 10, { align: "center" });

  doc.save(`HallTicket_${result.reg_no}.pdf`);
}
