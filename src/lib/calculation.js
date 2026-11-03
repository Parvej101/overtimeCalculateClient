import { DateTime } from 'luxon';

/**
 * Convert 24-hour time string ("HH:mm" or "HH:mm:ss") to 12-hour AM/PM format (e.g. "10:34 AM", "08:16 PM")
 */
export function to12HourFormat(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return '—';
  const trimmed = timeStr.trim();
  if (!trimmed) return '—';

  const parts = trimmed.split(':');
  if (parts.length < 2) return trimmed;

  const hours24 = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours24) || isNaN(minutes)) return trimmed;

  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const hStr = String(hours12).padStart(2, '0');
  const mStr = String(minutes).padStart(2, '0');

  return `${hStr}:${mStr} ${period}`;
}

/**
 * Normalize time string ("HH:mm:ss" or "H:mm") to "HH:mm" for HTML time inputs
 */
export function to24HourHHMM(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return '';
  const trimmed = timeStr.trim();
  if (!trimmed) return '';
  const parts = trimmed.split(':');
  if (parts.length < 2) return '';
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return '';
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Parse "HH:mm" or "HH:mm:ss" into total minutes from midnight
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

/**
 * Format total minutes into "Xh Ym" (with optional + / - sign)
 */
export function formatMinutesToHM(totalMinutes, options = {}) {
  const { showPlus = false, zeroLabel = '0h 00m' } = options;
  if (typeof totalMinutes !== 'number' || isNaN(totalMinutes) || totalMinutes === 0) {
    return zeroLabel;
  }
  const isNegative = totalMinutes < 0;
  const absMins = Math.round(Math.abs(totalMinutes));
  const hours = Math.floor(absMins / 60);
  const mins = absMins % 60;
  const sign = isNegative ? '-' : showPlus ? '+' : '';
  return `${sign}${hours}h ${String(mins).padStart(2, '0')}m`;
}

/**
 * Calculate daily attendance & overtime metrics for a single date row
 */
export function calculateDailyRow(row, standardDutyMinutes = 550) {
  const inTime = to24HourHHMM(row.inTime);
  const outTime = to24HourHHMM(row.outTime);
  const hasIn = Boolean(inTime);
  const hasOut = Boolean(outTime);

  // If marked as Off Day, or has neither In nor Out AND user hasn't clicked "+ Work"
  if (row.isOffDay || (!hasIn && !hasOut && !row.forceWorkDay)) {
    return {
      ...row,
      inTime: '',
      outTime: '',
      inTime12: '—',
      outTime12: '—',
      status: 'OFF_DAY',
      workedMinutes: 0,
      diffMinutes: 0,
      overtimeMinutes: 0,
      shortMinutes: 0,
      netOvertimeMinutes: 0,
      isShortDuty: false,
    };
  }

  // If user clicked "+ Work" or only one punch is present -> allow editing In/Out
  if (!hasIn || !hasOut) {
    return {
      ...row,
      inTime,
      outTime,
      inTime12: hasIn ? to12HourFormat(inTime) : 'Set In Time',
      outTime12: hasOut ? to12HourFormat(outTime) : 'Set Out Time',
      status: 'SINGLE_PUNCH',
      workedMinutes: 0,
      diffMinutes: 0,
      overtimeMinutes: 0,
      shortMinutes: 0,
      netOvertimeMinutes: 0,
      isShortDuty: false,
    };
  }

  const inMins = parseTimeToMinutes(inTime);
  let outMins = parseTimeToMinutes(outTime);

  if (outMins < inMins) {
    outMins += 24 * 60;
  }

  const workedMinutes = Math.max(0, outMins - inMins);
  const diffMinutes = workedMinutes - standardDutyMinutes;
  const isShortDuty = diffMinutes < 0;
  const overtimeMinutes = diffMinutes > 0 ? diffMinutes : 0;
  const shortMinutes = diffMinutes < 0 ? Math.abs(diffMinutes) : 0;

  const netOvertimeMinutes =
    diffMinutes > 0
      ? diffMinutes
      : diffMinutes < 0 && row.deductMinus
      ? diffMinutes
      : 0;

  return {
    ...row,
    inTime,
    outTime,
    inTime12: to12HourFormat(inTime),
    outTime12: to12HourFormat(outTime),
    status: diffMinutes > 0 ? 'OVERTIME' : diffMinutes < 0 ? 'SHORT_DUTY' : 'REGULAR',
    workedMinutes,
    diffMinutes,
    overtimeMinutes,
    shortMinutes,
    netOvertimeMinutes,
    isShortDuty,
  };
}

/**
 * Calculate monthly summary totals from calculated daily rows
 */
export function calculateMonthlySummary(calculatedRows, hourlyRate = 0) {
  let presentDays = 0;
  let offDays = 0;
  let singlePunchDays = 0;
  let shortDutyDaysCount = 0;
  let activeMinusDaysCount = 0;
  let totalWorkedMinutes = 0;
  let grossOvertimeMinutes = 0;
  let totalShortMinutes = 0;
  let deductedShortMinutes = 0;

  for (const r of calculatedRows) {
    if (r.status === 'OFF_DAY') {
      offDays += 1;
    } else if (r.status === 'SINGLE_PUNCH') {
      singlePunchDays += 1;
    } else {
      presentDays += 1;
      totalWorkedMinutes += r.workedMinutes;
      grossOvertimeMinutes += r.overtimeMinutes;
      if (r.isShortDuty) {
        shortDutyDaysCount += 1;
        totalShortMinutes += r.shortMinutes;
        if (r.deductMinus) {
          activeMinusDaysCount += 1;
          deductedShortMinutes += r.shortMinutes;
        }
      }
    }
  }

  const netOvertimeMinutes = grossOvertimeMinutes - deductedShortMinutes;
  const netOvertimeHoursDecimal = netOvertimeMinutes / 60;
  const rate = Number(hourlyRate) || 0;
  const totalBillBDT = netOvertimeHoursDecimal * rate;

  return {
    presentDays,
    offDays,
    singlePunchDays,
    shortDutyDaysCount,
    activeMinusDaysCount,
    totalWorkedMinutes,
    grossOvertimeMinutes,
    totalShortMinutes,
    deductedShortMinutes,
    netOvertimeMinutes,
    netOvertimeHoursDecimal,
    hourlyRate: rate,
    totalBillBDT,
  };
}

export function calculateOvertime(dateString, inTimeString, outTimeString, standardDutyMinutes) {
  if (!inTimeString || !outTimeString || !standardDutyMinutes) {
    return { dutyHours: 0, overtimeHours: 0, inTime: null, outTime: null };
  }
  const timeZone = 'Asia/Dhaka';
  try {
    let inTime = DateTime.fromFormat(`${dateString} ${inTimeString}`, 'yyyy-MM-dd HH:mm', { zone: timeZone });
    let outTime = DateTime.fromFormat(`${dateString} ${outTimeString}`, 'yyyy-MM-dd HH:mm', { zone: timeZone });
    if (outTime < inTime) {
      outTime = outTime.plus({ days: 1 });
    }
    const diff = outTime.diff(inTime, 'minutes').toObject();
    const totalMinutes = diff.minutes || 0;
    if (totalMinutes < 0) return { dutyHours: 0, overtimeHours: 0, inTime: null, outTime: null };
    let overtimeMinutes = 0;
    if (totalMinutes > standardDutyMinutes) {
      overtimeMinutes = totalMinutes - standardDutyMinutes;
    }
    const dutyHours = parseFloat((totalMinutes / 60).toFixed(2));
    const overtimeHours = parseFloat((overtimeMinutes / 60).toFixed(2));
    return { dutyHours, overtimeHours, inTime: inTime.toJSDate(), outTime: outTime.toJSDate() };
  } catch (error) {
    return { dutyHours: 0, overtimeHours: 0, inTime: null, outTime: null };
  }
}
