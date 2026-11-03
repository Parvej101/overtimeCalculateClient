"use client";

import Image from 'next/image';
import { formatMinutesToHM, to12HourFormat } from '@/lib/calculation';

export default function PrintableA4Report({
  companyName,
  formattedMonthLabel,
  dutyHours,
  dutyMinutes,
  hourlyRate,
  employeeName,
  employeeId,
  designation,
  cardNo,
  summary,
  calculatedRows,
  editingRowDay,
  onToggleEditRow,
  onRowChange,
  onToggleRowMinus,
  onToggleOffDay,
}) {
  return (
    <section className="printable-area bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-8">
      {/* Official Report Header */}
      <div className="border-b border-slate-300 pb-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            {/* Company Logo - increased width and spacing */}
            <div className="w-16 h-14 relative flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-white">
              <Image
                src="/logo/logo.png"
                alt="Company Logo"
                fill
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div>
              <div className="flex items-baseline gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
                  {companyName || 'FPC'}
                </h2>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  OVERTIME REPORT
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-normal">
                Monthly Attendance & Overtime Calculation Sheet —{' '}
                <span className="text-slate-800 font-semibold">{formattedMonthLabel}</span>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600 space-y-0.5">
            <p>
              <span>Standard Duty:</span>{' '}
              <strong className="text-slate-900">{dutyHours}h {dutyMinutes}m</strong>
            </p>
            <p>
              <span>OT Rate:</span>{' '}
              <strong className="text-slate-900">BDT {Number(hourlyRate) || 0} / hr</strong>
            </p>
            <p className="text-[11px] text-slate-400">
              Print Date: {new Date().toLocaleDateString('en-GB')}
            </p>
          </div>
        </div>

        {/* Employee Metadata Strip */}
        <div className="mt-3 pt-2.5 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-slate-500">Employee Name: </span>
            <strong className="text-slate-900 text-sm">{employeeName || '—'}</strong>
          </div>
          <div>
            <span className="text-slate-500">Employee No/ID: </span>
            <strong className="text-slate-900">{employeeId || '—'}</strong>
          </div>
          <div>
            <span className="text-slate-500">Designation: </span>
            <strong className="text-slate-900">{designation || '—'}</strong>
          </div>
          <div>
            <span className="text-slate-500">Card No: </span>
            <strong className="text-slate-900 font-mono">{cardNo || '—'}</strong>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip - Clean Soft Neutral / Gray Theme */}
      <div className="print-summary-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-5">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <p className="text-[11px] font-semibold uppercase text-slate-500">Present / Off Days</p>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            {summary.presentDays} Days{' '}
            <span className="text-xs font-normal text-slate-500">/ {summary.offDays} Off</span>
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <p className="text-[11px] font-semibold uppercase text-slate-500">Gross Overtime (+)</p>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            +{formatMinutesToHM(summary.grossOvertimeMinutes)}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <p className="text-[11px] font-semibold uppercase text-slate-500">Short Duty Minus (-)</p>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            {summary.deductedShortMinutes > 0
              ? `-${formatMinutesToHM(summary.deductedShortMinutes)}`
              : '0h 00m'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <p className="text-[11px] font-semibold uppercase text-slate-500">Net Total Overtime</p>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            {formatMinutesToHM(summary.netOvertimeMinutes)}
            <span className="block text-[10px] font-normal text-slate-500">
              ({summary.netOvertimeHoursDecimal.toFixed(2)} hrs × ৳{summary.hourlyRate})
            </span>
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-100 border border-slate-300 text-center">
          <p className="text-[11px] font-bold uppercase text-slate-600">Total Payable (BDT)</p>
          <p className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
            BDT {summary.totalBillBDT.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Full Month Attendance Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-slate-300 text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-700 uppercase text-[11px] font-bold">
              <th className="border border-slate-300 px-2 py-2 text-center w-24">Date</th>
              <th className="border border-slate-300 px-2 py-2 text-center w-14">Day</th>
              <th className="border border-slate-300 px-2 py-2 text-center">In Time (12h)</th>
              <th className="border border-slate-300 px-2 py-2 text-center">Out Time (12h)</th>
              <th className="border border-slate-300 px-2 py-2 text-center">Duty Time</th>
              <th className="border border-slate-300 px-2 py-2 text-center">Overtime / Short</th>
              <th className="no-print border border-slate-300 px-2 py-2 text-center w-48">
                Minus / Edit Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {calculatedRows.map((row) => {
              const isEditing = editingRowDay === row.day;

              return (
                <tr
                  key={row.day}
                  className={`transition-colors ${
                    row.status === 'OFF_DAY'
                      ? 'bg-slate-50/80 text-slate-400'
                      : row.status === 'SINGLE_PUNCH'
                      ? 'bg-amber-50/30'
                      : row.isShortDuty && row.deductMinus
                      ? 'bg-rose-50/30'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Date */}
                  <td className="border border-slate-300 px-2 py-1 text-center font-mono font-medium text-slate-800 whitespace-nowrap">
                    {row.displayDate}
                    {row.punchCount >= 3 && (
                      <span
                        className="no-print ml-1 inline-block text-[10px] px-1 rounded bg-slate-200 text-slate-700 font-sans"
                        title={`All punches: ${row.allPunches?.join(', ')} (1st=In, Last=Out)`}
                      >
                        {row.punchCount}x
                      </span>
                    )}
                  </td>

                  {/* Weekday */}
                  <td className="border border-slate-300 px-2 py-1 text-center font-medium text-slate-600">
                    {row.weekday}
                  </td>

                  {/* In Time & Out Time (or OFF DAY banner) */}
                  {row.status === 'OFF_DAY' && !isEditing ? (
                    <td
                      colSpan={4}
                      onClick={() => onToggleOffDay(row.day)}
                      className="border border-slate-300 px-2 py-1 text-center font-semibold tracking-wider uppercase text-slate-400 bg-slate-50 cursor-pointer hover:bg-slate-100 transition"
                      title="Click '+ Work' or click here to add In/Out time"
                    >
                      OFF DAY
                    </td>
                  ) : (
                    <>
                      {/* In Time */}
                      <td className="border border-slate-300 px-2 py-1 text-center whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="time"
                            value={row.inTime}
                            onChange={(e) => onRowChange(row.day, 'inTime', e.target.value)}
                            className="no-print px-2 py-0.5 border border-slate-400 rounded text-xs font-mono bg-white text-slate-900"
                          />
                        ) : (
                          <span
                            onClick={() => onToggleEditRow(row.day)}
                            className={`cursor-pointer font-medium ${
                              !row.inTime ? 'text-amber-700 italic underline' : 'text-slate-800 hover:text-slate-900'
                            }`}
                            title="Click to edit In Time"
                          >
                            {row.inTime ? to12HourFormat(row.inTime) : 'Set In Time'}
                          </span>
                        )}
                      </td>

                      {/* Out Time */}
                      <td className="border border-slate-300 px-2 py-1 text-center whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="time"
                            value={row.outTime}
                            onChange={(e) => onRowChange(row.day, 'outTime', e.target.value)}
                            className="no-print px-2 py-0.5 border border-slate-400 rounded text-xs font-mono bg-white text-slate-900"
                          />
                        ) : (
                          <span
                            onClick={() => onToggleEditRow(row.day)}
                            className={`cursor-pointer font-medium ${
                              !row.outTime ? 'text-amber-700 italic underline' : 'text-slate-800 hover:text-slate-900'
                            }`}
                            title="Click to edit Out Time"
                          >
                            {row.outTime ? to12HourFormat(row.outTime) : 'Set Out Time'}
                          </span>
                        )}
                      </td>

                      {/* Worked Duty Hours */}
                      <td className="border border-slate-300 px-2 py-1 text-center font-medium text-slate-800 whitespace-nowrap">
                        {row.status === 'SINGLE_PUNCH' ? (
                          <span className="text-amber-700 text-xs font-medium">Incomplete</span>
                        ) : (
                          formatMinutesToHM(row.workedMinutes)
                        )}
                      </td>

                      {/* Overtime / Short Column */}
                      <td className="border border-slate-300 px-2 py-1 text-center whitespace-nowrap">
                        {row.overtimeMinutes > 0 ? (
                          <span className="font-bold text-slate-900">
                            +{formatMinutesToHM(row.overtimeMinutes)}
                          </span>
                        ) : row.isShortDuty ? (
                          row.deductMinus ? (
                            <span className="font-bold text-rose-700">
                              -{formatMinutesToHM(row.shortMinutes)}
                            </span>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-slate-400 font-medium">0h 00m</span>
                              <span className="no-print text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                                Short -{formatMinutesToHM(row.shortMinutes)}
                              </span>
                            </div>
                          )
                        ) : (
                          <span className="text-slate-400">0h 00m</span>
                        )}
                      </td>
                    </>
                  )}

                  {/* Action Column (No-Print) */}
                  <td className="no-print border border-slate-300 px-2 py-1 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      {row.isShortDuty && (
                        <button
                          type="button"
                          onClick={() => onToggleRowMinus(row.day)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                            row.deductMinus
                              ? 'bg-rose-700 text-white'
                              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                          }`}
                          title="Toggle short duty deduction"
                        >
                          {row.deductMinus
                            ? `Minus (-${formatMinutesToHM(row.shortMinutes)})`
                            : `- Deduct`}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onToggleEditRow(row.day)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium border transition ${
                          isEditing
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {isEditing ? 'Done' : 'Edit'}
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleOffDay(row.day)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium border transition ${
                          row.status === 'OFF_DAY'
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                        }`}
                        title={
                          row.status === 'OFF_DAY'
                            ? 'Convert Off Day to Working Day'
                            : 'Mark this day as Off Day'
                        }
                      >
                        {row.status === 'OFF_DAY' ? '+ Work' : 'Off'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Table Footer Totals - Neutral Slate / Gray Look */}
          <tfoot>
            <tr className="bg-slate-100 font-bold text-slate-800 text-xs sm:text-sm">
              <td colSpan={4} className="border border-slate-300 px-3 py-2 text-right uppercase tracking-wider text-slate-600">
                Monthly Total ({summary.presentDays} Working Days, {summary.offDays} Off Days):
              </td>
              <td className="border border-slate-300 px-2 py-2 text-center font-bold text-slate-900">
                {formatMinutesToHM(summary.totalWorkedMinutes)}
              </td>
              <td className="border border-slate-300 px-2 py-2 text-center font-black text-slate-900">
                {formatMinutesToHM(summary.netOvertimeMinutes, {
                  showPlus: summary.netOvertimeMinutes > 0,
                })}
              </td>
              <td className="no-print border border-slate-300 px-2 py-2 text-center font-bold text-slate-900">
                BDT {summary.totalBillBDT.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Final Calculation Breakdown & Signatures for A4 Print */}
      <div className="mt-4 pt-3 border-t border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-1 text-slate-700">
          <p>
            <strong>Calculation Formula: </strong>
            Gross Overtime (<strong>{formatMinutesToHM(summary.grossOvertimeMinutes)}</strong>)
            {summary.deductedShortMinutes > 0 && (
              <>
                {' '}
                − Short Duty Minus (
                <strong className="text-rose-700">
                  -{formatMinutesToHM(summary.deductedShortMinutes)}
                </strong>
                )
              </>
            )}{' '}
            = Net Overtime (<strong>{formatMinutesToHM(summary.netOvertimeMinutes)}</strong> /{' '}
            <strong>{summary.netOvertimeHoursDecimal.toFixed(2)} hrs</strong>) × Rate (
            <strong>BDT {summary.hourlyRate}</strong>)
          </p>
        </div>

        <div className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold text-sm whitespace-nowrap">
          Net Overtime Payable: BDT {summary.totalBillBDT.toFixed(2)}
        </div>
      </div>

      {/* Official Signature Block */}
      <div className="mt-10 pt-4 grid grid-cols-3 gap-8 text-center text-xs text-slate-600">
        <div>
          <div className="border-t border-slate-400 pt-1 font-medium">Employee Signature</div>
        </div>
        <div>
          <div className="border-t border-slate-400 pt-1 font-medium">Prepared / Checked By</div>
        </div>
        <div>
          <div className="border-t border-slate-400 pt-1 font-medium">
            Approved By
          </div>
        </div>
      </div>
    </section>
  );
}
