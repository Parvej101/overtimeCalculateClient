import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatMinutesToHM } from './calculation';

export function exportReportToPdf({
  companyName = 'FPC',
  employeeName = '',
  employeeId = '',
  designation = '',
  cardNo = '',
  month = '',
  formattedMonthLabel = '',
  dutyHours = 9,
  dutyMinutes = 10,
  hourlyRate = 100,
  calculatedRows = [],
  summary = {},
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Try adding logo if available
  try {
    const img = document.querySelector('.printable-area img');
    if (img && img.complete) {
      doc.addImage(img, 'JPEG', 14, 10, 14, 14);
    }
  } catch (e) {
    // If image fails, fallback gracefully
  }

  const textStartX = 32;

  // 1. Header: Company Name & Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text((companyName || 'FPC').toUpperCase(), textStartX, 15);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('OVERTIME REPORT', textStartX + doc.getTextWidth((companyName || 'FPC').toUpperCase()) + 3, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Monthly Attendance & Overtime Calculation Sheet — ${formattedMonthLabel || month}`, textStartX, 21);

  // Top right metadata
  doc.setFontSize(8);
  doc.text(`Standard Duty: ${dutyHours}h ${dutyMinutes}m`, pageWidth - 14, 14, { align: 'right' });
  doc.text(`OT Rate: BDT ${Number(hourlyRate) || 0} / hr`, pageWidth - 14, 19, { align: 'right' });
  doc.text(`Print Date: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - 14, 24, { align: 'right' });

  // Divider line
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.line(14, 27, pageWidth - 14, 27);

  // 2. Employee Metadata Row
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Employee Name:', 14, 32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(employeeName || '—', 39, 32);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('ID / No:', 80, 32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(employeeId || '—', 93, 32);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Designation:', 120, 32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(designation || '—', 140, 32);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Card No:', 168, 32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(cardNo || '—', 182, 32);

  // 3. KPI Summary Strip (Clean subtle gray boxes)
  const boxY = 36;
  const boxHeight = 11;
  const totalBoxWidth = pageWidth - 28;
  const colWidth = totalBoxWidth / 5;

  const kpis = [
    { label: 'PRESENT / OFF', value: `${summary.presentDays || 0} Days / ${summary.offDays || 0} Off` },
    { label: 'GROSS OVERTIME (+)', value: `+${formatMinutesToHM(summary.grossOvertimeMinutes)}` },
    { label: 'SHORT MINUS (-)', value: summary.deductedShortMinutes > 0 ? `-${formatMinutesToHM(summary.deductedShortMinutes)}` : '0h 00m' },
    { label: 'NET OVERTIME', value: formatMinutesToHM(summary.netOvertimeMinutes) },
    { label: 'TOTAL PAYABLE', value: `BDT ${(summary.totalBillBDT || 0).toFixed(2)}` },
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * colWidth;
    doc.setFillColor(248, 250, 252); // soft gray slate-50
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, boxY, colWidth - 2, boxHeight, 1, 1, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + (colWidth - 2) / 2, boxY + 4, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.value, x + (colWidth - 2) / 2, boxY + 8.8, { align: 'center' });
  });

  // 4. Detailed Attendance Table
  const tableRows = (calculatedRows || []).map((row) => {
    if (row.status === 'OFF_DAY') {
      return [row.displayDate, row.weekday, { content: 'OFF DAY', colSpan: 4, styles: { halign: 'center', textColor: [148, 163, 184], fontStyle: 'bold' } }];
    }

    const otDisplay =
      row.overtimeMinutes > 0
        ? `+${formatMinutesToHM(row.overtimeMinutes)}`
        : row.isShortDuty
        ? row.deductMinus
          ? `-${formatMinutesToHM(row.shortMinutes)}`
          : `0h 00m (Short -${formatMinutesToHM(row.shortMinutes)})`
        : '0h 00m';

    const dutyDisplay = row.status === 'SINGLE_PUNCH' ? 'Incomplete' : formatMinutesToHM(row.workedMinutes);

    return [
      row.displayDate,
      row.weekday,
      row.inTime12 || '—',
      row.outTime12 || '—',
      dutyDisplay,
      otDisplay,
    ];
  });

  autoTable(doc, {
    startY: 50,
    margin: { left: 14, right: 14, bottom: 26 },
    head: [['Date', 'Day', 'In Time (12h)', 'Out Time (12h)', 'Duty Time', 'Overtime / Short']],
    body: tableRows,
    foot: [
      [
        { content: `Monthly Total: (${summary.presentDays || 0} Working Days, ${summary.offDays || 0} Off Days)`, colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatMinutesToHM(summary.totalWorkedMinutes), styles: { halign: 'center', fontStyle: 'bold' } },
        { content: `${formatMinutesToHM(summary.netOvertimeMinutes)}  (BDT ${(summary.totalBillBDT || 0).toFixed(2)})`, styles: { halign: 'center', fontStyle: 'bold', textColor: [15, 23, 42] } },
      ],
    ],
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 1.2,
      lineColor: [226, 232, 240], // slate-200
      lineWidth: 0.15,
      textColor: [30, 41, 59],
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [241, 245, 249], // slate-100
      textColor: [30, 41, 59],
      fontStyle: 'bold',
      halign: 'center',
    },
    footStyles: {
      fillColor: [241, 245, 249], // slate-100 neutral gray
      textColor: [15, 23, 42],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 26 },
      1: { halign: 'center', cellWidth: 16 },
      2: { halign: 'center', cellWidth: 32 },
      3: { halign: 'center', cellWidth: 32 },
      4: { halign: 'center', cellWidth: 30 },
      5: { halign: 'center' },
    },
  });

  // 5. Signatures on final page bottom
  const finalY = doc.internal.pageSize.getHeight() - 16;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);

  doc.setDrawColor(148, 163, 184);
  doc.line(16, finalY, 56, finalY);
  doc.text('Employee Signature', 36, finalY + 4, { align: 'center' });

  doc.line(pageWidth / 2 - 20, finalY, pageWidth / 2 + 20, finalY);
  doc.text('Prepared / Checked By', pageWidth / 2, finalY + 4, { align: 'center' });

  doc.line(pageWidth - 56, finalY, pageWidth - 16, finalY);
  doc.text('Approved By', pageWidth - 36, finalY + 4, { align: 'center' });

  const fileName = `${companyName || 'FPC'}_Overtime_${employeeName || 'Report'}_${month || 'Monthly'}.pdf`.replace(/\s+/g, '_');
  doc.save(fileName);
}
