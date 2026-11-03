"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import Swal from 'sweetalert2';
import {
  parseBiometricXlsBuffer,
  parseManuallyPastedText,
  buildFullMonthDays,
} from '@/lib/xlsParser';
import {
  calculateDailyRow,
  calculateMonthlySummary,
} from '@/lib/calculation';
import {
  getSavedEmployees,
  saveEmployeeProfile,
  getActiveWorkspaceState,
  saveActiveWorkspaceState,
  clearActiveWorkspaceState,
} from '@/lib/storage';

export function useOvertimeWorkspace() {
  const fileInputRef = useRef(null);

  const currentYearMonth = new Date().toISOString().substring(0, 7);

  const [companyName, setCompanyName] = useState('FPC');
  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [designation, setDesignation] = useState('');
  const [cardNo, setCardNo] = useState('');
  const [month, setMonth] = useState(currentYearMonth);

  const [dutyHours, setDutyHours] = useState(9);
  const [dutyMinutes, setDutyMinutes] = useState(10);
  const [hourlyRate, setHourlyRate] = useState(100);

  const [rows, setRows] = useState([]);
  const [uploadedSheets, setUploadedSheets] = useState([]);
  const [savedEmployees, setSavedEmployees] = useState([]);
  const [fileName, setFileName] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [editingRowDay, setEditingRowDay] = useState(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const standardDutyMinutes = useMemo(() => {
    const h = parseInt(dutyHours, 10) || 0;
    const m = parseInt(dutyMinutes, 10) || 0;
    return Math.max(1, h * 60 + m);
  }, [dutyHours, dutyMinutes]);

  const applyMatchingSavedEmployee = (empId, empName, empCard, currentSavedList) => {
    const list = currentSavedList || savedEmployees;
    const match = list.find(
      (e) =>
        (empId && String(e.employeeId).toLowerCase() === String(empId).toLowerCase()) ||
        (empName && String(e.name).toLowerCase() === String(empName).toLowerCase())
    );
    if (match) {
      setDutyHours(match.dutyHours ?? 9);
      setDutyMinutes(match.dutyMinutes ?? 10);
      setHourlyRate(match.hourlyRate ?? 100);
      if (match.designation) setDesignation(match.designation);
      if (match.cardNo && !empCard) setCardNo(match.cardNo);
    }
  };

  useEffect(() => {
    const emps = getSavedEmployees();
    setSavedEmployees(emps);

    const savedWorkspace = getActiveWorkspaceState();
    if (savedWorkspace && Array.isArray(savedWorkspace.rows) && savedWorkspace.rows.length > 0) {
      setCompanyName(savedWorkspace.companyName || 'FPC');
      setEmployeeId(savedWorkspace.employeeId || '');
      setEmployeeName(savedWorkspace.employeeName || '');
      setDesignation(savedWorkspace.designation || '');
      setCardNo(savedWorkspace.cardNo || '');
      setMonth(savedWorkspace.month || currentYearMonth);
      setDutyHours(savedWorkspace.dutyHours ?? 9);
      setDutyMinutes(savedWorkspace.dutyMinutes ?? 10);
      setHourlyRate(savedWorkspace.hourlyRate ?? 100);
      setRows(savedWorkspace.rows);
      setUploadedSheets(savedWorkspace.uploadedSheets || []);
      setFileName(savedWorkspace.fileName || '');
      setIsLoaded(true);
    } else {
      const blankRows = buildFullMonthDays(currentYearMonth, new Map(), false);
      setRows(blankRows);
      setIsLoaded(true);
    }
  }, [currentYearMonth]);

  useEffect(() => {
    if (!isLoaded) return;
    saveActiveWorkspaceState({
      companyName,
      employeeId,
      employeeName,
      designation,
      cardNo,
      month,
      dutyHours,
      dutyMinutes,
      hourlyRate,
      rows,
      uploadedSheets,
      fileName,
    });
  }, [
    isLoaded,
    companyName,
    employeeId,
    employeeName,
    designation,
    cardNo,
    month,
    dutyHours,
    dutyMinutes,
    hourlyRate,
    rows,
    uploadedSheets,
    fileName,
  ]);

  const calculatedRows = useMemo(() => {
    return rows.map((r) => calculateDailyRow(r, standardDutyMinutes));
  }, [rows, standardDutyMinutes]);

  const summary = useMemo(() => {
    return calculateMonthlySummary(calculatedRows, hourlyRate);
  }, [calculatedRows, hourlyRate]);

  const allShortDaysMinusEnabled = useMemo(() => {
    const shortRows = calculatedRows.filter((r) => r.isShortDuty);
    if (shortRows.length === 0) return false;
    return shortRows.every((r) => r.deductMinus);
  }, [calculatedRows]);

  const formattedMonthLabel = useMemo(() => {
    if (!month) return '';
    const [y, m] = month.split('-');
    const dateObj = new Date(Number(y), Number(m) - 1, 1);
    return dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }, [month]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const parsedEmployees = parseBiometricXlsBuffer(buffer, file.name);
      const first = parsedEmployees[0];

      setFileName(file.name);
      setUploadedSheets(parsedEmployees);
      setEmployeeId(first.employeeId || '');
      setEmployeeName(first.name || '');
      setCardNo(first.cardNo || '');
      setMonth(first.month);
      setRows(first.rows);
      setEditingRowDay(null);
      applyMatchingSavedEmployee(first.employeeId, first.name, first.cardNo);

      Swal.fire({
        icon: 'success',
        title: `${file.name.endsWith('.csv') ? 'CSV' : 'XLS'} ফাইল লোড হয়েছে!`,
        text: `${first.name || 'Employee'} (ID: ${first.employeeId || 'N/A'}) এর ${first.month} মাসের হাজিরা প্রস্তুত।`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'File Parse Error',
        text: error.message || 'Could not read the file.',
      });
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleApplyManualData = (rawText, customMeta) => {
    const parsed = parseManuallyPastedText(rawText, customMeta);
    setFileName('Manual_Pasted_Data.txt');
    setUploadedSheets([]);
    if (parsed.employeeId) setEmployeeId(parsed.employeeId);
    if (parsed.name) setEmployeeName(parsed.name);
    if (parsed.designation) setDesignation(parsed.designation);
    setCardNo(parsed.cardNo || '');
    setMonth(parsed.month);
    setRows(parsed.rows);
    setEditingRowDay(null);
    applyMatchingSavedEmployee(parsed.employeeId, parsed.name, parsed.cardNo);

    Swal.fire({
      icon: 'success',
      title: 'ম্যানুয়াল ডেটা প্রসেস হয়েছে!',
      text: `${parsed.rows.length} দিনের হাজিরা শিট তৈরি হয়েছে (${parsed.month})।`,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleExportPdf = async () => {
    if (typeof window === 'undefined') return;

    setIsExportingPdf(true);

    try {
      const { exportReportToPdf } = await import('@/lib/pdfExport');

      exportReportToPdf({
        companyName,
        employeeName,
        employeeId,
        designation,
        cardNo,
        month,
        formattedMonthLabel,
        dutyHours,
        dutyMinutes,
        hourlyRate,
        calculatedRows,
        summary,
      });

      Swal.fire({
        icon: 'success',
        title: 'PDF Export Complete!',
        text: 'পিডিএফ রিপোর্ট সফলভাবে তৈরি ও ডাউনলোড হয়েছে।',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleSelectUploadedEmployee = (empKey) => {
    const found = uploadedSheets.find((s) => s.empKey === empKey);
    if (!found) return;
    setEmployeeId(found.employeeId || '');
    setEmployeeName(found.name || '');
    setCardNo(found.cardNo || '');
    setMonth(found.month);
    setRows(found.rows);
    setEditingRowDay(null);
    applyMatchingSavedEmployee(found.employeeId, found.name, found.cardNo);
  };

  const handleSelectSavedProfile = (profileId) => {
    if (!profileId) return;
    const emp = savedEmployees.find((e) => e.id === profileId);
    if (!emp) return;
    setEmployeeId(emp.employeeId || '');
    setEmployeeName(emp.name || '');
    setDesignation(emp.designation || '');
    if (emp.cardNo) setCardNo(emp.cardNo);
    setDutyHours(emp.dutyHours ?? 9);
    setDutyMinutes(emp.dutyMinutes ?? 10);
    setHourlyRate(emp.hourlyRate ?? 100);
  };

  const handleClearSheet = () => {
    clearActiveWorkspaceState();
    setFileName('');
    setUploadedSheets([]);
    setEmployeeId('');
    setEmployeeName('');
    setDesignation('');
    setCardNo('');
    setEditingRowDay(null);
    const blankDays = buildFullMonthDays(month || currentYearMonth, new Map(), false);
    setRows(blankDays);
    Swal.fire({
      icon: 'info',
      title: 'শিট ক্লিয়ার করা হয়েছে',
      text: 'নতুন XLS / CSV আপলোড করুন অথবা Paste Manually ক্লিক করে ডেটা দিন।',
      timer: 1600,
      showConfirmButton: false,
    });
  };

  const handleMonthChange = (newMonth) => {
    setMonth(newMonth);
    if (!newMonth) return;
    setEditingRowDay(null);
    const blankDays = buildFullMonthDays(newMonth, new Map(), false);
    setRows(blankDays);
  };

  const handleRowChange = (day, field, value) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.day !== day) return r;
        const updated = { ...r, [field]: value };
        if ((field === 'inTime' || field === 'outTime') && value) {
          updated.isOffDay = false;
          updated.forceWorkDay = true;
        }
        return updated;
      })
    );
  };

  const handleToggleOffDay = (day) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.day !== day) return r;
        const calc = calculateDailyRow(r, standardDutyMinutes);
        const isCurrentlyOff = calc.status === 'OFF_DAY';

        if (isCurrentlyOff) {
          setEditingRowDay(day);
          return {
            ...r,
            isOffDay: false,
            forceWorkDay: true,
            inTime: r.inTime || '09:50',
            outTime: r.outTime || '19:00',
          };
        } else {
          if (editingRowDay === day) setEditingRowDay(null);
          return {
            ...r,
            isOffDay: true,
            forceWorkDay: false,
            inTime: '',
            outTime: '',
            deductMinus: false,
          };
        }
      })
    );
  };

  const handleToggleEditRow = (day) => {
    if (editingRowDay === day) {
      setEditingRowDay(null);
      return;
    }
    setRows((prev) =>
      prev.map((r) => {
        if (r.day !== day) return r;
        if (r.isOffDay || (!r.inTime && !r.outTime)) {
          return {
            ...r,
            isOffDay: false,
            forceWorkDay: true,
            inTime: r.inTime || '09:50',
            outTime: r.outTime || '19:00',
          };
        }
        return r;
      })
    );
    setEditingRowDay(day);
  };

  const handleToggleRowMinus = (day) => {
    setRows((prev) =>
      prev.map((r) => (r.day === day ? { ...r, deductMinus: !r.deductMinus } : r))
    );
  };

  const handleToggleAllShortMinus = () => {
    const targetState = !allShortDaysMinusEnabled;
    setRows((prev) =>
      prev.map((r) => {
        const calc = calculateDailyRow(r, standardDutyMinutes);
        if (calc.isShortDuty) {
          return { ...r, deductMinus: targetState };
        }
        return r;
      })
    );
  };

  const handleSaveEmployeeToLocal = () => {
    if (!employeeName.trim()) {
      Swal.fire('Warning', 'কর্মীর নাম লিখুন (Please enter employee name).', 'warning');
      return;
    }
    const updatedList = saveEmployeeProfile({
      employeeId,
      name: employeeName,
      designation,
      cardNo,
      dutyHours,
      dutyMinutes,
      hourlyRate,
    });
    setSavedEmployees(updatedList);
    Swal.fire({
      icon: 'success',
      title: 'Saved to LocalStorage!',
      text: `${employeeName} (Duty: ${dutyHours}h ${dutyMinutes}m, OT Rate: ৳${hourlyRate}) সেভ করা হয়েছে।`,
      timer: 1800,
      showConfirmButton: false,
    });
  };

  return {
    fileInputRef,
    companyName,
    setCompanyName,
    employeeId,
    setEmployeeId,
    employeeName,
    setEmployeeName,
    designation,
    setDesignation,
    cardNo,
    setCardNo,
    month,
    dutyHours,
    setDutyHours,
    dutyMinutes,
    setDutyMinutes,
    hourlyRate,
    setHourlyRate,
    standardDutyMinutes,
    uploadedSheets,
    savedEmployees,
    fileName,
    editingRowDay,
    setEditingRowDay,
    isManualModalOpen,
    setIsManualModalOpen,
    isExportingPdf,
    handleExportPdf,
    calculatedRows,
    summary,
    allShortDaysMinusEnabled,
    formattedMonthLabel,
    handleFileUpload,
    handleApplyManualData,
    handleSelectUploadedEmployee,
    handleSelectSavedProfile,
    handleClearSheet,
    handleMonthChange,
    handleRowChange,
    handleToggleOffDay,
    handleToggleEditRow,
    handleToggleRowMinus,
    handleToggleAllShortMinus,
    handleSaveEmployeeToLocal,
  };
}
