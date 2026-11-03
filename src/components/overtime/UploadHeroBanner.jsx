"use client";

import { useRef } from 'react';

export default function UploadHeroBanner({
  companyName,
  fileInputRef,
  fileName,
  uploadedSheets,
  savedEmployees,
  onFileUpload,
  onClearSheet,
  onOpenManualPaste,
  onExportPdf,
  isExportingPdf,
  onSelectUploadedEmployee,
  onSelectSavedProfile,
}) {
  const csvInputRef = useRef(null);

  return (
    <section className="no-print bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
            <span>Company: {companyName || 'FPC'}</span>
            <span>•</span>
            <span>12-Hour AM/PM</span>
            <span>•</span>
            <span>Currency: BDT (৳)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Biometric XLS / CSV Overtime Calculator & A4 Report
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
            Upload attendance (.xls, .xlsx, or .csv) or paste punch lines directly. Computes daily duty hours, negative/positive overtime, and prints or exports an A4 PDF report.
          </p>
        </div>

        {/* Clean Monochrome (Black, White & Slate) Button Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* XLS / XLSX Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xls,.xlsx"
            onChange={onFileUpload}
            className="hidden"
            id="xls-file-upload"
          />
          <label
            htmlFor="xls-file-upload"
            className="cursor-pointer inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs border border-white/20 transition-all active:scale-95"
            title="Upload standard .xls or .xlsx spreadsheet"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload XLS
          </label>

          {/* CSV Upload */}
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={onFileUpload}
            className="hidden"
            id="csv-file-upload"
          />
          <label
            htmlFor="csv-file-upload"
            className="cursor-pointer inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white font-semibold text-xs border border-slate-700 transition-all active:scale-95"
            title="Upload biometric machine .csv file"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Upload CSV
          </label>

          {/* Manual Text / Custom Option Paste Button */}
          <button
            type="button"
            onClick={onOpenManualPaste}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white font-semibold text-xs border border-slate-700 transition-all active:scale-95"
            title="Paste punch lines or custom timestamps"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Paste Manually
          </button>

          {/* Export PDF Button */}
          <button
            type="button"
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-50 font-semibold text-xs border border-white/20 transition-all active:scale-95"
            title="Download clean A4 PDF file directly"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {isExportingPdf ? 'Exporting...' : 'Export PDF'}
          </button>

          {/* Print A4 */}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white font-semibold text-xs border border-slate-700 transition-all active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print A4
          </button>

          {/* Clear Sheet */}
          <button
            type="button"
            onClick={onClearSheet}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-transparent text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 font-medium text-xs border border-slate-800 transition-all active:scale-95"
            title="Reset active sheet"
          >
            Clear
          </button>
        </div>
      </div>

      {/* File & Multi-Employee Selector Bar */}
      {(fileName || uploadedSheets.length > 1 || savedEmployees.length > 0) && (
        <div className="mt-4 pt-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            {fileName ? (
              <span className="px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700 text-slate-200 font-mono">
                {fileName}
              </span>
            ) : (
              <span className="text-slate-500 italic">
                No file uploaded (manual mode)
              </span>
            )}
            {uploadedSheets.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Switch Employee:</span>
                <select
                  onChange={(e) => onSelectUploadedEmployee(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-hidden"
                >
                  {uploadedSheets.map((s) => (
                    <option key={s.empKey} value={s.empKey}>
                      {s.name || 'Unknown'} (No. {s.employeeId || '—'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {savedEmployees.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Saved Employee Defaults:</span>
              <select
                onChange={(e) => onSelectSavedProfile(e.target.value)}
                defaultValue=""
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-hidden"
              >
                <option value="">-- Load Saved Profile --</option>
                {savedEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} (ID: {emp.employeeId}) — {emp.dutyHours}h {emp.dutyMinutes}m | ৳{emp.hourlyRate}/hr
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
