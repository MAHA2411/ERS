import fs from "fs";
import pdfkit from "pdfkit";
import path from "path";

export const generateCSV = (registrations) => {
  // convert registrations array to CSV string
  const headers = ["Ticket ID", "Name", "Email", "Phone", "College", "Department", "Year", "Team Info", "Status"];
  const rows = registrations.map(r => {
    let teamInfo = "-";
    if (r.isTeamRegistration) {
      const members = r.teamMembers.map(m => `${m.name} (${m.email})`).join("; ");
      teamInfo = `${r.teamName || 'Team'} [Members: ${members}]`;
    }
    return [
      r.ticketId,
      r.participant.name,
      r.participant.email,
      r.participant.phone || "-",
      r.participant.college || "-",
      r.participant.department || "-",
      r.participant.year || "-",
      teamInfo,
      r.status
    ];
  });

  const csv = [headers, ...rows].map(e => e.join(",")).join("\n");
  return csv;
};

import streamBuffers from "stream-buffers";

export const generatePDF = async (registrations) => {
  const doc = new pdfkit({ margin: 30 });
  const writableStreamBuffer = new streamBuffers.WritableStreamBuffer({
    initialSize: 100 * 1024,
    incrementAmount: 10 * 1024,
  });

  doc.pipe(writableStreamBuffer);

  doc.fontSize(18).text("Participants List", { align: "center" });
  doc.moveDown();

  registrations.forEach((r, i) => {
    doc.fontSize(12).font("Helvetica-Bold").text(`${i + 1}. ${r.participant.name} (${r.ticketId})`);
    doc.fontSize(10).font("Helvetica").text(`Email: ${r.participant.email}, Phone: ${r.participant.phone || "-"}`);
    doc.text(`College: ${r.participant.college || "-"}`);

    if (r.isTeamRegistration) {
      doc.text(`Team: ${r.teamName || "Unnamed Team"}`);
      if (r.teamMembers && r.teamMembers.length > 0) {
        doc.text("Members:");
        r.teamMembers.forEach(m => {
          doc.text(`  - ${m.name} (${m.email})`);
        });
      }
    }
    doc.moveDown(0.5);
  });

  doc.end();

  return new Promise((resolve, reject) => {
    writableStreamBuffer.on("finish", () => {
      resolve(writableStreamBuffer.getContents());
    });
    doc.on("error", reject);
  });
};
