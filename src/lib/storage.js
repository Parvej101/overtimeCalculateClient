const EMPLOYEES_STORAGE_KEY = 'fpc_employees_v2';
const WORKSPACE_STORAGE_KEY = 'fpc_active_workspace_v2';
const REPORTS_HISTORY_KEY = 'fpc_reports_history_v2';
const MAX_EMPLOYEES_LIMIT = 100;
const MAX_HISTORY_LIMIT = 15;

/**
 * Remove legacy / unused keys to free up localStorage space
 */
function cleanupLegacyKeys() {
  if (typeof window === 'undefined') return;
  const allowedKeys = new Set([
    EMPLOYEES_STORAGE_KEY,
    WORKSPACE_STORAGE_KEY,
    REPORTS_HISTORY_KEY,
  ]);

  const keysToRemove = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && (key.startsWith('fpc_') || key.startsWith('overtime_')) && !allowedKeys.has(key)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((k) => window.localStorage.removeItem(k));
}

/**
 * Safely write to localStorage.
 * If QuotaExceededError occurs (storage is full), automatically delete older records
 * and retry so saving new data never fails.
 */
function safeSetItem(key, dataObj) {
  if (typeof window === 'undefined') return;
  cleanupLegacyKeys();

  const serialized = JSON.stringify(dataObj);

  try {
    window.localStorage.setItem(key, serialized);
  } catch (err) {
    // Storage is full (QuotaExceededError) -> automatically evict older data
    console.warn('LocalStorage full, evicting older entries automatically...');
    try {
      // 1. Remove older report history first
      const rawHistory = window.localStorage.getItem(REPORTS_HISTORY_KEY);
      if (rawHistory) {
        const hist = JSON.parse(rawHistory);
        if (Array.isArray(hist) && hist.length > 2) {
          // Keep only the 2 newest reports
          window.localStorage.setItem(REPORTS_HISTORY_KEY, JSON.stringify(hist.slice(-2)));
        } else {
          window.localStorage.removeItem(REPORTS_HISTORY_KEY);
        }
      }

      // 2. Trim oldest employees if employee list is large
      if (key === EMPLOYEES_STORAGE_KEY && Array.isArray(dataObj) && dataObj.length > 10) {
        const trimmedEmployees = dataObj.slice(-Math.floor(dataObj.length / 2));
        window.localStorage.setItem(key, JSON.stringify(trimmedEmployees));
        return;
      }

      // 3. Try setting the item again after freeing space
      window.localStorage.setItem(key, serialized);
    } catch (retryErr) {
      // Final fallback: clear all non-essential keys and save the newest item
      window.localStorage.clear();
      try {
        window.localStorage.setItem(key, serialized);
      } catch (finalErr) {
        console.error('Could not write to localStorage even after clearing:', finalErr);
      }
    }
  }
}

export function getSavedEmployees() {
  if (typeof window === 'undefined') return [];
  try {
    cleanupLegacyKeys();
    const raw = window.localStorage.getItem(EMPLOYEES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read employees from localStorage:', err);
    return [];
  }
}

export function saveEmployeeProfile(profile) {
  if (typeof window === 'undefined') return [];
  const employees = getSavedEmployees();
  const dutyH = parseInt(profile.dutyHours ?? 9, 10) || 0;
  const dutyM = parseInt(profile.dutyMinutes ?? 10, 10) || 0;
  const standardDutyMinutes = dutyH * 60 + dutyM;

  const normalized = {
    id: profile.id || `emp_${Date.now()}`,
    employeeId: String(profile.employeeId || '').trim(),
    name: String(profile.name || '').trim(),
    designation: String(profile.designation || '').trim(),
    cardNo: String(profile.cardNo || '').trim(),
    dutyHours: dutyH,
    dutyMinutes: dutyM,
    standardDutyMinutes,
    hourlyRate: Number(profile.hourlyRate) || 0,
    updatedAt: Date.now(),
  };

  const existingIndex = employees.findIndex(
    (e) =>
      e.id === normalized.id ||
      (normalized.employeeId && e.employeeId.toLowerCase() === normalized.employeeId.toLowerCase())
  );

  let updated;
  if (existingIndex >= 0) {
    updated = [...employees];
    updated[existingIndex] = { ...updated[existingIndex], ...normalized };
  } else {
    updated = [...employees, normalized];
  }

  // If exceeds MAX_EMPLOYEES_LIMIT, automatically remove the oldest saved profiles first
  if (updated.length > MAX_EMPLOYEES_LIMIT) {
    updated = updated
      .sort((a, b) => (a.updatedAt || 0) - (b.updatedAt || 0))
      .slice(updated.length - MAX_EMPLOYEES_LIMIT);
  }

  safeSetItem(EMPLOYEES_STORAGE_KEY, updated);
  return updated;
}

export function deleteEmployeeProfile(id) {
  if (typeof window === 'undefined') return [];
  const employees = getSavedEmployees().filter((e) => e.id !== id);
  safeSetItem(EMPLOYEES_STORAGE_KEY, employees);
  return employees;
}

export function getActiveWorkspaceState() {
  if (typeof window === 'undefined') return null;
  try {
    cleanupLegacyKeys();
    const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load workspace from localStorage:', err);
    return null;
  }
}

/**
 * Save active workspace in a compact format and automatically evict older uploaded sheets
 * if storage gets large.
 */
export function saveActiveWorkspaceState(state) {
  if (typeof window === 'undefined') return;

  // Compact rows so they take minimal space in localStorage
  const compactRows = (state.rows || []).map((r) => ({
    day: r.day,
    isoDate: r.isoDate,
    displayDate: r.displayDate,
    weekday: r.weekday,
    inTime: r.inTime || '',
    outTime: r.outTime || '',
    isOffDay: Boolean(r.isOffDay),
    forceWorkDay: Boolean(r.forceWorkDay),
    deductMinus: Boolean(r.deductMinus),
    punchCount: r.punchCount || 0,
  }));

  // Keep only the latest 10 uploaded employee sheets in memory/storage to prevent bloat
  const compactSheets = (state.uploadedSheets || []).slice(-MAX_HISTORY_LIMIT).map((s) => ({
    empKey: s.empKey,
    employeeId: s.employeeId,
    name: s.name,
    cardNo: s.cardNo,
    month: s.month,
    rows: (s.rows || []).map((r) => ({
      day: r.day,
      isoDate: r.isoDate,
      displayDate: r.displayDate,
      weekday: r.weekday,
      inTime: r.inTime || '',
      outTime: r.outTime || '',
      isOffDay: Boolean(r.isOffDay),
      deductMinus: Boolean(r.deductMinus),
      punchCount: r.punchCount || 0,
    })),
  }));

  const compactState = {
    companyName: state.companyName,
    employeeId: state.employeeId,
    employeeName: state.employeeName,
    designation: state.designation,
    cardNo: state.cardNo,
    month: state.month,
    dutyHours: state.dutyHours,
    dutyMinutes: state.dutyMinutes,
    hourlyRate: state.hourlyRate,
    fileName: state.fileName,
    rows: compactRows,
    uploadedSheets: compactSheets,
    savedAt: Date.now(),
  };

  safeSetItem(WORKSPACE_STORAGE_KEY, compactState);
}

export function clearActiveWorkspaceState() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear workspace from localStorage:', err);
  }
}
