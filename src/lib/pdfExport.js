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

  // 1. Header: Add logo with good spacing
  const logoX = 14;
  const logoY = 9;
  const logoWidth = 18;
  const logoHeight = 15;

  try {
    const img = document.querySelector('.printable-area img');
    if (img && img.complete) {
      doc.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight);
    }
  } catch (e) {
    // If image fails, fallback gracefully
  }

  // Increased gap between logo and text
  const textStartX = logoX + logoWidth + 6; // 38mm

  // 1. Header: Company Name & Overtime Report title without any overlapping
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42); // slate-900
  const compText = (companyName || 'FPC').toUpperCase();
  doc.text(compText, textStartX, 15);

  const compWidth = doc.getTextWidth(compText);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('OVERTIME REPORT', textStartX + compWidth + 3, 15);

  // Subtitle (Monthly Attendance Sheet) smaller font & clean spacing
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Monthly Attendance & Overtime Calculation Sheet — ${formattedMonthLabel || month}`, textStartX, 20);

  // Top right metadata
  doc.setFontSize(7.5);
  doc.text(`Standard Duty: ${dutyHours}h ${dutyMinutes}m`, pageWidth - 14, 13.5, { align: 'right' });
  doc.text(`OT Rate: BDT ${Number(hourlyRate) || 0} / hr`, pageWidth - 14, 18, { align: 'right' });
  doc.text(`Print Date: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - 14, 22.5, { align: 'right' });

  // Divider line
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.line(14, 26, pageWidth - 14, 26);

  // 2. Employee Metadata Row
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Employee Name:', 14, 31);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(employeeName || '—', 38, 31);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('ID / No:', 80, 31);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(employeeId || '—', 92, 31);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Designation:', 120, 31);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(designation || '—', 139, 31);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Card No:', 168, 31);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(cardNo || '—', 182, 31);

  // 3. KPI Summary Strip (Clean subtle gray boxes)
  const boxY = 35;
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
    startY: 49,
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
