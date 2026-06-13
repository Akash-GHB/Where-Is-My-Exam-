import React from "react";
import { Download, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { ExamResult } from "@/api/axios";

interface AdmitCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  result: ExamResult;
  searchParams: { date: string; session: "FN" | "AN" };
}

// Ensure the date logic matches
function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
}

export function AdmitCardModal({ isOpen, onClose, onDownload, result, searchParams }: AdmitCardModalProps) {
  if (!isOpen) return null;

  const regDigits = result.reg_no.split("");

  // Fill exactly 8 boxes for reg number as per the image
  while (regDigits.length < 8) regDigits.push("");
  const displayRegDigits = regDigits.slice(0, 8); // just in case it's longer

  const formattedDate = formatDate(searchParams.date);
  const dateSessionText = `${formattedDate} -\n${searchParams.session}`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-gray-500/80">

      {/* Utility Bar (Hidden when printing/PDF generation) */}
      <div className="w-[794px] max-w-full flex justify-end gap-2 p-2 print:hidden shrink-0 mt-4">
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 shadow"
        >
          <Download className="w-4 h-4" /> Download PDF
        </button>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 text-sm font-semibold rounded hover:bg-gray-100 shadow border"
        >
          <X className="w-4 h-4" /> Close
        </button>
      </div>

      {/* A4 Paper Container - 794px width is ~210mm at 96 DPI */}
      <div
        className="w-[794px] min-h-[1123px] bg-white text-black shrink-0 relative shadow-2xl mb-10 overflow-hidden"
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        {/* ------- PAGE 1 ------- */}

        {/* MAROON HEADER (No outer border yet) */}
        <div style={{ backgroundColor: "#8a1727", color: "white", padding: "16px", display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "10px" }}>

          {/* Main Logo Box (Empty for exact visual) */}
          <div style={{ width: "85px", height: "85px", borderRadius: "50%", border: "2px solid #fff", marginLeft: "10px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fff", flexShrink: 0, position: "relative" }}>
            <div style={{ width: "70px", height: "70px", borderRadius: "50%", border: "1px dashed #8a1727", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "10px", color: "#8a1727", fontWeight: "bold" }}>LOGO</span>
            </div>
            {/* Curved text mock */}
            <span style={{ position: "absolute", bottom: "4px", fontSize: "5px", color: "#8a1727", fontWeight: "bold" }}>JUSTICE PEACE REVOLUTION</span>
          </div>

          <div style={{ marginLeft: "14px", marginTop: "4px" }}>
            <div style={{ fontFamily: "Arial Black, Impact, sans-serif", fontSize: "40px", fontWeight: "900", letterSpacing: "1px", lineHeight: "1" }}>SATHYABAMA</div>
            <div style={{ fontSize: "14.5px", fontWeight: "bold", letterSpacing: "0.5px", marginTop: "2px" }}>INSTITUTE OF SCIENCE AND TECHNOLOGY</div>
            <div style={{ fontSize: "12px", fontWeight: "bold", textAlign: "center", marginTop: "2px", letterSpacing: "1px" }}>(DEEMED TO BE UNIVERSITY)</div>
            <div style={{ fontSize: "15px", fontWeight: "bold", textAlign: "center", marginTop: "4px", letterSpacing: "0.5px" }}>CATEGORY - 1 UNIVERSITY BY UGC</div>
          </div>
        </div>

        {/* CONTAINER BORDER BENEATH HEADER */}
        {/* Everything inside this gets enclosed in a thin light-gray border. */}
        <div style={{ borderLeft: "1px solid #e0e0e0", borderRight: "1px solid #e0e0e0", borderBottom: "1px solid #e0e0e0", margin: "0", minHeight: "974px", paddingBottom: "30px", position: "relative" }}>

          {/* SUB-HEADER */}
          <div style={{ display: "flex", alignItems: "center", padding: "8px 20px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1px solid #a8cce4", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
              <span style={{ fontSize: "6px", color: "#8a1727", fontWeight: "bold", textAlign: "center" }}>SIST<br />LOGO</span>
            </div>
            <div style={{ flex: 1, textAlign: "center", paddingTop: "5px" }}>
              <div style={{ fontSize: "11px", fontWeight: "bold" }}>(DEEMED TO BE UNIVERSITY - ESTABLISHED UNDER SECTION 3 OF UGC ACT, 1956)</div>
              <div style={{ fontSize: "11px", fontWeight: "bold" }}>Jeppiaar Nagar, Rajiv Gandhi Salai, Chennai 600119.</div>
            </div>
            <div style={{ width: "40px" }} /> {/* Balancer */}
          </div>

          {/* COURSE INFO BLOCK */}
          <div style={{ padding: "10px 20px 0 20px", display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div><span style={{ display: "inline-block", width: "55px" }}>Course:</span><span style={{ fontWeight: "bold" }}>{result.program || "B.E"}</span></div>
              <div><span style={{ display: "inline-block", width: "55px" }}>Branch:</span><span style={{ fontWeight: "bold" }}>{result.branch || "COMPUTER SCIENCE AND ENGINEERING"}</span></div>
              <div><span style={{ display: "inline-block", width: "55px" }}>Batch:</span><span style={{ fontWeight: "bold" }}>2023-2027</span></div>
              <div><span style={{ display: "inline-block", width: "55px" }}>Month:</span><span style={{ fontWeight: "bold" }}>APR 2025</span></div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "right" }}>
              <div>Forenoon Session - <span style={{ fontWeight: "bold" }}>09:30 AM to 12:30 PM</span></div>
              <div>Afternoon Session - <span style={{ fontWeight: "bold" }}>01:00 PM to 04:00 PM</span></div>
              <div><span style={{ opacity: 0 }}>Year of Exa</span>Year of Examination: -</div>
            </div>
          </div>

          {/* TITLE */}
          <div style={{ marginTop: "30px", marginBottom: "25px", textAlign: "center", fontSize: "20px", fontWeight: "bold", letterSpacing: "0.2px" }}>
            REGULAR HALL TICKET - THEORY
          </div>

          <div style={{ height: "1px", backgroundColor: "#e2e2e2" }} />

          {/* STUDENT DETAILS & PHOTO */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 20px 10px 20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: "5px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ width: "170px", fontSize: "16px", color: "#333" }}>Name of the Student:</div>
                <div style={{ fontSize: "16px", fontWeight: "bold" }}>P AKASH</div>
              </div>

              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ width: "170px", fontSize: "16px", color: "#333" }}>Register Number:</div>
                <div style={{ display: "flex", borderTop: "1px solid #000", borderLeft: "1px solid #000" }}>
                  {displayRegDigits.map((digit, i) => (
                    <div
                      key={i}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRight: "1px solid #000",
                        borderBottom: "1px solid #000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "15px",
                        fontWeight: "bold"
                      }}
                    >
                      {digit}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PHOTO BOX mock */}
            <div style={{ width: "94px", height: "115px", backgroundColor: "#cb191e", border: "1px solid #ddd", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Just a white text placeholder to simulate the image */}
              <span style={{ color: "#fff", fontSize: "10px" }}>Photo</span>
            </div>
          </div>

          {/* EMPTY SPACE BEFORE TABLE */}
          <div style={{ height: "4px" }} />

          {/* TABLE */}
          <div style={{ padding: "0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", borderTop: "1px solid #a0a0a0", borderBottom: "1px solid #a0a0a0" }}>
              <thead>
                <tr>
                  <th style={thStyle}>S.No</th>
                  <th style={thStyle}>Course Code</th>
                  <th style={thStyle}>Course Title</th>
                  <th style={thStyle}>Course<br />Type</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Date-<br />Session</th>
                  <th style={thStyle}>Attendance<br />%</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyleCenter}>1</td>
                  <td style={tdStyleCenter}>{result.reg_no === "43110042" ? "SCSB4018" : (result.course_name ? "SUB101" : "SCSB4018")}</td>
                  <td style={tdStyleCenter}>{result.course_name || "Introduction to Machine Learning"}</td>
                  <td style={tdStyleCenter}>Theory</td>
                  <td style={tdStyleCenter}>Elective</td>
                  <td style={tdStyleCenter}>{`${formattedDate} -\n${searchParams.session}`}</td>
                  <td style={tdStyleCenter}>89.66</td>
                </tr>
                {/* Add a few mocking rows if we want to perfectly replicate the image's height */}
                <tr>
                  <td style={tdStyleCenter}>2</td>
                  <td style={tdStyleCenter}>SMTB1402</td>
                  <td style={tdStyleCenter}>Probability and<br />Statistics</td>
                  <td style={tdStyleCenter}>Theory</td>
                  <td style={tdStyleCenter}>Core</td>
                  <td style={tdStyleCenter}>10/05/2025 -<br />FN</td>
                  <td style={tdStyleCenter}>100</td>
                </tr>
                <tr>
                  <td style={tdStyleCenter}>3</td>
                  <td style={tdStyleCenter}>SITB3005</td>
                  <td style={tdStyleCenter}>Beginner Full Stack<br />Web Development</td>
                  <td style={tdStyleCenter}>Theory</td>
                  <td style={tdStyleCenter}>Elective</td>
                  <td style={tdStyleCenter}>15/05/2025 -<br />FN</td>
                  <td style={tdStyleCenter}>96.3</td>
                </tr>
                <tr>
                  <td style={tdStyleCenter}>4</td>
                  <td style={tdStyleCenter}>SCSB0B1401</td>
                  <td style={tdStyleCenter}>Operating Systems and<br />Unix</td>
                  <td style={tdStyleCenter}>Theory</td>
                  <td style={tdStyleCenter}>Core</td>
                  <td style={tdStyleCenter}>08/05/2025 -<br />FN</td>
                  <td style={tdStyleCenter}>93.94</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SPACE BEFORE SIGNATURES */}
          <div style={{ height: "60px" }} />

          {/* SIGNATURES */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0 20px" }}>
            <div>
              <div style={{ height: "40px" }} /> {/* blank space for physical sig */}
              <div style={{ borderBottom: "1px dotted #000", width: "200px", marginBottom: "4px" }} />
              <div style={{ fontWeight: "bold", fontSize: "13px" }}>Signature of the Candidate</div>
            </div>

            <div style={{ textAlign: "center", marginRight: "10px" }}>
              <div style={{ height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* Signature mock image text */}
                <div style={{ fontFamily: "cursive", fontSize: "26px", color: "#333", transform: "rotate(-10deg)" }}>Slparatn</div>
              </div>
              <div style={{ borderBottom: "1px dashed #777", width: "180px", marginBottom: "4px" }} />
              <div style={{ fontWeight: "bold", fontSize: "12px", letterSpacing: "0.2px" }}>Controller of Examinations</div>
            </div>
          </div>

          {/* NOTE */}
          <div style={{ padding: "0 20px", marginTop: "20px", marginBottom: "40px" }}>
            <div style={{ fontWeight: "bold", fontSize: "12px" }}>Note: This hall ticket is not valid for arrear exam</div>
          </div>

          {/* INSTRUCTIONS HEADER */}
          <div style={{ textAlign: "center", fontSize: "14px", fontWeight: "bold", marginTop: "10px" }}>
            Instructions to Candidates
          </div>

          <div style={{ position: "absolute", bottom: "10px", left: "20px", fontSize: "10px", color: "#333" }}>
            about:blank
          </div>
          <div style={{ position: "absolute", bottom: "10px", right: "20px", fontSize: "10px", color: "#333" }}>
            1/2
          </div>

        </div>
      </div>


      {/* ------- PAGE 2 ------- */}
      {/* We keep it in the same modal, just scrolled further down so it looks like 2 print pages */}
      <div
        className="w-[794px] min-h-[1123px] bg-white text-black shrink-0 relative shadow-2xl mb-10 overflow-hidden"
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          borderLeft: "1px solid #e0e0e0",
          borderRight: "1px solid #e0e0e0",
          borderTop: "1px solid #e0e0e0",
          borderBottom: "1px solid #e0e0e0",
        }}
        id="hall-ticket-page2"
      >
        <div style={{ padding: "40px" }}>

          <ul style={{ paddingLeft: "16px", fontSize: "12px", lineHeight: "1.6", color: "#000", listStyleType: "disc" }} className="space-y-[10px]">
            <li>
              All candidates should bring their Hall ticket and valid Identity card for every examination for verifying their identity in the examination hall, failing which they will not be permitted to write the examination.
            </li>
            <li>
              The students are advised to view their <strong>seating arrangements for Regular Examinations</strong> in the Institute Website well in advance. <strong>For Arrear Exams, please look at the Exam Office Notice Board on the day of the Exam.</strong>
            </li>
            <li>
              The students are strictly not permitted to possess <strong>Cell Phones / Programmable Calculators</strong> inside the examination hall. Any violation of this will be viewed very seriously and it will be confiscated.
            </li>
            <li>
              <strong>Students will not be allowed to write the end semester Examination for Engineering Graphics, Machine Drawing and other Drawing related subjects, if they do not possess a Mini Drafter.</strong>
            </li>
            <li>
              Data books/IS codes/ Graph Sheets/ Charts / Tables will be issued by the Institute only.
            </li>
            <li>
              The students are advised to enter the examination hall 10 minutes before the commencement of examination. <strong>They should come in the official dress code.</strong>
            </li>
            <li>
              Students will be allowed to leave the Exam halls only at the end of three hours.
            </li>
            <li>
              <strong>MALPRACTICE DURING EXAMINATIONS:</strong><br />
              If a student has been caught indulging in any malpractice, during any of the end semester Theory or Practical Examinations severe action will be taken, as per the Institute rules and regulations.
            </li>
          </ul>

          <div style={{ display: "flex", justifyContent: "center", marginTop: "60px" }}>
            <QRCodeSVG
              value={JSON.stringify({
                reg: result.reg_no,
                room: result.room_no,
                block: result.block,
                floor: result.floor,
                date: searchParams.date,
                session: searchParams.session,
              })}
              size={340}
              level="H"
              bgColor="#FFFFFF"
              fgColor="#000000"
            />
          </div>

        </div>

        <div style={{ position: "absolute", bottom: "10px", left: "20px", fontSize: "10px", color: "#333" }}>
          about:blank
        </div>
        <div style={{ position: "absolute", bottom: "10px", right: "20px", fontSize: "10px", color: "#333" }}>
          2/2
        </div>
      </div>

    </div>
  );
}

const thStyle: React.CSSProperties = {
  borderRight: "1px solid #a0a0a0",
  borderBottom: "1px solid #a0a0a0",
  padding: "10px 8px",
  fontWeight: "bold",
  textAlign: "center",
  color: "#999",
  fontSize: "13px"
};

const tdStyleCenter: React.CSSProperties = {
  borderRight: "1px solid #a0a0a0",
  borderBottom: "1px solid #a0a0a0",
  padding: "8px",
  fontSize: "12px",
  color: "#000",
  textAlign: "center",
  verticalAlign: "middle",
  whiteSpace: "pre-wrap"
};
