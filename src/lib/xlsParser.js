import * as XLSX from 'xlsx';

/**
 * Scan an array of strings/rows to detect whether dates are MM/DD/YYYY or DD/MM/YYYY.
 * e.g. If any date has day > 12 in the second position (09/25/2026), it is MM/DD/YYYY.
 * If any date has day > 12 in the first position (25/09/2025), it is DD/MM/YYYY.
 */
export function detectDateFormatOrder(rawValues) {
  let hasFirstNumberAbove12 = false;
  let hasSecondNumberAbove12 = false;

  for (const item of rawValues) {
    const str = String(item ?? '');
    const m = str.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (m) {
      const p1 = parseInt(m[1], 10);
      const p2 = parseInt(m[2], 10);
      if (p1 > 12) hasFirstNumberAbove12 = true;
      if (p2 > 12) hasSecondNumberAbove12 = true;
    }
  }

  if (hasSecondNumberAbove12 && !hasFirstNumberAbove12) return 'MM/DD/YYYY';
  if (hasFirstNumberAbove12 && !hasSecondNumberAbove12) return 'DD/MM/YYYY';
  return 'AUTO';
}

/**
 * Parse a single Date/Time cell value from biometric XLS / CSV / raw string
 */
export function parseDateTimeCell(rawVal, preferredFormat = 'AUTO') {
  if (rawVal == null || rawVal === '') return null;

  if (typeof rawVal === 'number') {
    const parsed = XLSX.SSF.parse_date_code(rawVal);
    if (parsed && parsed.y && parsed.m && parsed.d) {
      const yyyy = String(parsed.y).padStart(4, '0');
      const mm = String(parsed.m).padStart(2, '0');
      const dd = String(parsed.d).padStart(2, '0');
      const hh = String(parsed.H || 0).padStart(2, '0');
      const min = String(parsed.M || 0).padStart(2, '0');
      const sec = String(Math.floor(parsed.S || 0)).padStart(2, '0');
      return {
        isoDate: `${yyyy}-${mm}-${dd}`,
        displayDate: `${dd}/${mm}/${yyyy}`,
        monthKey: `${yyyy}-${mm}`,
        time24: `${hh}:${min}`,
        timeFull: `${hh}:${min}:${sec}`,
        sortSeconds: (parsed.H || 0) * 3600 + (parsed.M || 0) * 60 + Math.floor(parsed.S || 0),
      };
    }
  }

  const str = String(rawVal).trim();
  if (!str) return null;

  // Match: (p1)/(p2)/(yyyy) hh:mm(:ss)? (AM/PM)?
  const slashMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?$/i);
  if (slashMatch) {
    const p1 = parseInt(slashMatch[1], 10);
    const p2 = parseInt(slashMatch[2], 10);
    const yyyy = slashMatch[3];
    let hhNum = parseInt(slashMatch[4], 10);
    const min = slashMatch[5].padStart(2, '0');
    const sec = (slashMatch[6] || '00').padStart(2, '0');
    const ampm = slashMatch[7] ? slashMatch[7].toUpperCase() : null;

    if (ampm === 'PM' && hhNum < 12) hhNum += 12;
    if (ampm === 'AM' && hhNum === 12) hhNum = 0;

    let dd, mm;

    if (p1 > 12) {
      // p1 is definitely Day -> DD/MM/YYYY
      dd = String(p1).padStart(2, '0');
      mm = String(p2).padStart(2, '0');
    } else if (p2 > 12) {
      // p2 is definitely Day -> MM/DD/YYYY
      mm = String(p1).padStart(2, '0');
      dd = String(p2).padStart(2, '0');
    } else {
      // Both <= 12: consult detected file format
      if (preferredFormat === 'MM/DD/YYYY') {
        mm = String(p1).padStart(2, '0');
        dd = String(p2).padStart(2, '0');
      } else {
        // Default standard DD/MM/YYYY for standard biometric reports
        dd = String(p1).padStart(2, '0');
        mm = String(p2).padStart(2, '0');
      }
    }

    const hh = String(hhNum).padStart(2, '0');
    const minNum = parseInt(min, 10);
    const secNum = parseInt(sec, 10);

    return {
      isoDate: `${yyyy}-${mm}-${dd}`,
      displayDate: `${dd}/${mm}/${yyyy}`,
      monthKey: `${yyyy}-${mm}`,
      time24: `${hh}:${min}`,
      timeFull: `${hh}:${min}:${sec}`,
      sortSeconds: hhNum * 3600 + minNum * 60 + secNum,
    };
  }

  // Match yyyy-MM-dd HH:mm(:ss)?
  const ymdMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (ymdMatch) {
    const yyyy = ymdMatch[1];
    const mm = ymdMatch[2].padStart(2, '0');
    const dd = ymdMatch[3].padStart(2, '0');
    const hhNum = parseInt(ymdMatch[4], 10);
    const hh = String(hhNum).padStart(2, '0');
    const min = ymdMatch[5].padStart(2, '0');
    const sec = (ymdMatch[6] || '00').padStart(2, '0');
    return {
      isoDate: `${yyyy}-${mm}-${dd}`,
      displayDate: `${dd}/${mm}/${yyyy}`,
      monthKey: `${yyyy}-${mm}`,
      time24: `${hh}:${min}`,
      timeFull: `${hh}:${min}:${sec}`,
      sortSeconds: hhNum * 3600 + parseInt(min, 10) * 60 + parseInt(sec, 10),
    };
  }

  return null;
}

/**
 * Generate a complete monthly sheet (1 to daysInMonth) for a given YYYY-MM
 */
export function buildFullMonthDays(monthKey, datePunchesMap = new Map(), defaultDeductMinus = false) {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();

  const rows = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dd = String(d).padStart(2, '0');
    const mm = String(month).padStart(2, '0');
    const isoDate = `${year}-${mm}-${dd}`;
    const displayDate = `${dd}/${mm}/${year}`;
    const weekday = new Date(year, month - 1, d).toLocaleDateString('en-US', { weekday: 'short' });

    const punches = datePunchesMap.get(isoDate) || [];
    const sorted = [...punches].sort((a, b) => a.sortSeconds - b.sortSeconds);

    let inTime = '';
    let outTime = '';
    let isOffDay = false;

    if (sorted.length === 0) {
      isOffDay = true;
    } else if (sorted.length === 1) {
      const onlyPunch = sorted[0];
      if (onlyPunch.sortSeconds < 15 * 3600) {
        inTime = onlyPunch.time24;
      } else {
        outTime = onlyPunch.time24;
      }
      isOffDay = false;
    } else {
      inTime = sorted[0].time24;
      outTime = sorted[sorted.length - 1].time24;
      isOffDay = false;
    }

    rows.push({
      day: d,
      isoDate,
      displayDate,
      weekday,
      inTime,
      outTime,
      isOffDay,
      forceWorkDay: false,
      deductMinus: defaultDeductMinus,
      punchCount: sorted.length,
      allPunches: sorted.map((p) => p.timeFull),
    });
  }

  return rows;
}

/**
 * Process raw JSON rows from XLS / CSV sheet into structured employee report packages
 */
export function processRawBiometricRows(rawRows, preferredFormat = 'AUTO') {
  const employeesMap = new Map();

  for (const row of rawRows) {
    const cleanRow = {};
    for (const [k, v] of Object.entries(row)) {
      cleanRow[String(k).trim()] = v;
    }

    const dtRaw =
      cleanRow['Date/Time'] ??
      cleanRow['DateTime'] ??
      cleanRow['Date'] ??
      cleanRow['Time'] ??
      cleanRow['Timestamp'] ??
      null;

    const parsedDT = parseDateTimeCell(dtRaw, preferredFormat);
    if (!parsedDT) continue;

    const empNo = String(cleanRow['No.'] ?? cleanRow['No'] ?? cleanRow['ID'] ?? cleanRow['AC-No.'] ?? '').trim();
    const empName = String(cleanRow['Name'] ?? cleanRow['Employee Name'] ?? (empNo ? `Employee ${empNo}` : '')).trim();
    const department = String(cleanRow['Department'] ?? '').trim();
    const cardNo = String(cleanRow['CardNo'] ?? cleanRow['Card No'] ?? '').trim();
    const locationId = String(cleanRow['Location ID'] ?? '').trim();

    const empKey = `${empNo || 'unknown'}__${empName || 'user'}`;

    if (!employeesMap.has(empKey)) {
      employeesMap.set(empKey, {
        empKey,
        employeeId: empNo,
        name: empName,
        department,
        cardNo,
        locationId,
        monthCounts: {},
        datePunchesMap: new Map(),
      });
    }

    const empEntry = employeesMap.get(empKey);
    empEntry.monthCounts[parsedDT.monthKey] = (empEntry.monthCounts[parsedDT.monthKey] || 0) + 1;

    if (!empEntry.datePunchesMap.has(parsedDT.isoDate)) {
      empEntry.datePunchesMap.set(parsedDT.isoDate, []);
    }
    empEntry.datePunchesMap.get(parsedDT.isoDate).push(parsedDT);
  }

  const results = [];

  for (const emp of employeesMap.values()) {
    const dominantMonth =
      Object.entries(emp.monthCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      new Date().toISOString().substring(0, 7);

    const rows = buildFullMonthDays(dominantMonth, emp.datePunchesMap, false);

    results.push({
      empKey: emp.empKey,
      employeeId: emp.employeeId,
      name: emp.name,
      department: emp.department,
      cardNo: emp.cardNo,
      locationId: emp.locationId,
      month: dominantMonth,
      rows,
    });
  }

  return results;
}

/**
 * Parse an uploaded ArrayBuffer (.xls / .xlsx / .csv) into employee attendance sheets
 */
export function parseBiometricXlsBuffer(arrayBuffer, fileName = '') {
  const isCsv = fileName.toLowerCase().endsWith('.csv');

  // For CSV files, read as UTF-8 string with raw: true so timestamps are not mangled
  let workbook;
  let rawText = '';

  if (isCsv) {
    const decoder = new TextDecoder('utf-8');
    rawText = decoder.decode(arrayBuffer);
    workbook = XLSX.read(rawText, { type: 'string', raw: true });
  } else {
    workbook = XLSX.read(arrayBuffer, { type: 'array' });
  }

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('No worksheet found in the uploaded file.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawMatrix = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (!rawMatrix || rawMatrix.length === 0) {
    throw new Error('The uploaded file is empty.');
  }

  // Detect whether dates in this file follow MM/DD/YYYY or DD/MM/YYYY
  const detectedFormat = detectDateFormatOrder(
    rawMatrix.flatMap((r) => (Array.isArray(r) ? r : Object.values(r)))
  );

  // Check if first row has recognizable headers
  const firstRow = rawMatrix[0] || [];
  const hasHeaders = firstRow.some(
    (cell) => typeof cell === 'string' && /(date|time|name|no\.|card|id|department)/i.test(cell)
  );

  let rawRows = [];

  if (hasHeaders) {
    rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  } else {
    // Headerless CSV or custom tabular output (e.g. 5,Ove,09/01/2026 09:51:38,0,5,K40)
    for (const line of rawMatrix) {
      if (!Array.isArray(line) || line.length === 0) continue;

      let dtVal = null;
      let empNo = '';
      let empName = '';

      for (let i = 0; i < line.length; i++) {
        const val = line[i];
        if (parseDateTimeCell(val, detectedFormat)) {
          dtVal = val;
          if (i >= 1 && !empNo) empNo = String(line[0] ?? '').trim();
          if (i >= 2 && !empName) empName = String(line[1] ?? '').trim();
          break;
        }
      }

      if (dtVal) {
        rawRows.push({
          'Date/Time': dtVal,
          'No.': empNo || String(line[0] ?? '').trim(),
          Name: empName || String(line[1] ?? '').trim(),
        });
      }
    }
  }

  if (rawRows.length === 0) {
    throw new Error('No valid attendance records found in the file.');
  }

  const parsedEmployees = processRawBiometricRows(rawRows, detectedFormat);
  if (parsedEmployees.length === 0) {
    throw new Error('No valid Date/Time attendance records found in the file.');
  }

  return parsedEmployees;
}

/**
 * Parse manual pasted text lines (like "9/1/2026 9:51\n9/1/2026 20:31" or CSV lines)
 */
export function parseManuallyPastedText(rawText, customMeta = {}) {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    throw new Error('No text lines provided to parse.');
  }

  // Detect format from lines
  const detectedFormat = detectDateFormatOrder(lines);

  const parsedPunches = [];
  const monthCounts = {};
  let detectedId = customMeta.employeeId || '';
  let detectedName = customMeta.name || '';

  for (const line of lines) {
    // Check if line is CSV-like
    if (line.includes(',')) {
      const parts = line.split(',').map((p) => p.trim());
      for (let i = 0; i < parts.length; i++) {
        const parsed = parseDateTimeCell(parts[i], detectedFormat);
        if (parsed) {
          if (!detectedId && i >= 1) detectedId = parts[0];
          if (!detectedName && i >= 2) detectedName = parts[1];
          parsedPunches.push(parsed);
          monthCounts[parsed.monthKey] = (monthCounts[parsed.monthKey] || 0) + 1;
          break;
        }
      }
      continue;
    }

    // Line is a single date/time string
    const parsed = parseDateTimeCell(line, detectedFormat);
    if (parsed) {
      parsedPunches.push(parsed);
      monthCounts[parsed.monthKey] = (monthCounts[parsed.monthKey] || 0) + 1;
    }
  }

  if (parsedPunches.length === 0) {
    throw new Error('Could not recognize any valid date/time entries. Example: 9/1/2026 9:51');
  }

  const dominantMonth =
    customMeta.month ||
    Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    new Date().toISOString().substring(0, 7);

  const datePunchesMap = new Map();
  for (const p of parsedPunches) {
    if (!datePunchesMap.has(p.isoDate)) {
      datePunchesMap.set(p.isoDate, []);
    }
    datePunchesMap.get(p.isoDate).push(p);
  }

  const rows = buildFullMonthDays(dominantMonth, datePunchesMap, false);

  return {
    employeeId: customMeta.employeeId || detectedId || '',
    name: customMeta.name || detectedName || '',
    designation: customMeta.designation || '',
    cardNo: customMeta.cardNo || '',
    month: dominantMonth,
    rows,
  };
}
