"use client";

export default function DynamicConfigPanel({
  companyName,
  setCompanyName,
  employeeName,
  setEmployeeName,
  employeeId,
  setEmployeeId,
  designation,
  setDesignation,
  month,
  onMonthChange,
  dutyHours,
  setDutyHours,
  dutyMinutes,
  setDutyMinutes,
  standardDutyMinutes,
  hourlyRate,
  setHourlyRate,
  summary,
  allShortDaysMinusEnabled,
  onToggleAllShortMinus,
  onSaveEmployeeToLocal,
}) {
  return (
    <section className="no-print bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            Employee & Overtime Configuration
          </h2>
          <p className="text-xs text-slate-500">
            Set employee profile details, standard duty time, hourly rate, and short-duty deduction rules.
          </p>
        </div>
        <button
          type="button"
          onClick={onSaveEmployeeToLocal}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition"
        >
          Save Employee Default
        </button>
      </div>

      {/* Employee Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Company Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-slate-400 focus:outline-hidden"
            placeholder="FPC"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Employee Name</label>
          <input
            type="text"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-slate-400 focus:outline-hidden"
            placeholder="e.g. Ove"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Employee No. / ID</label>
          <input
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-slate-400 focus:outline-hidden"
            placeholder="e.g. 5"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Designation</label>
          <input
            type="text"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 focus:ring-2 focus:ring-slate-400 focus:outline-hidden"
            placeholder="Designation"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Report Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => onMonthChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-slate-400 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Dynamic Duty Time, OT Rate (BDT), and Short-Duty Minus Toggle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
        {/* 1. Standard Duty Time Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Standard Duty Time
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-white border border-slate-300 text-slate-800">
              {dutyHours}h {dutyMinutes}m ({standardDutyMinutes} min)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Hours</label>
              <input
                type="number"
                min="0"
                max="23"
                value={dutyHours}
                onChange={(e) => setDutyHours(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Minutes</label>
              <input
                type="number"
                min="0"
                max="59"
                value={dutyMinutes}
                onChange={(e) => setDutyMinutes(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500 mr-1">Presets:</span>
            {[
              { label: '9h 10m', h: 9, m: 10 },
              { label: '8h 10m', h: 8, m: 10 },
              { label: '9h 00m', h: 9, m: 0 },
              { label: '8h 00m', h: 8, m: 0 },
            ].map((preset) => {
              const active = Number(dutyHours) === preset.h && Number(dutyMinutes) === preset.m;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setDutyHours(preset.h);
                    setDutyMinutes(preset.m);
                  }}
                  className={`px-2 py-0.5 rounded-md text-xs font-semibold transition ${
                    active
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Dynamic Overtime Rate (BDT) Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Overtime Rate (BDT)
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-white border border-slate-300 text-slate-800">
              BDT {Number(hourlyRate) || 0} / hr
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Hourly Rate
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-slate-500">৳</span>
              <input
                type="number"
                step="any"
                min="0"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full pl-8 pr-14 py-1.5 rounded-lg border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                placeholder="100 or 200"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                BDT
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500 mr-1">Presets:</span>
            {[100, 120, 150, 200, 250].map((rateVal) => {
              const active = Number(hourlyRate) === rateVal;
              return (
                <button
                  key={rateVal}
                  type="button"
                  onClick={() => setHourlyRate(rateVal)}
                  className={`px-2 py-0.5 rounded-md text-xs font-semibold transition ${
                    active
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  ৳{rateVal}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Short Duty Minus Button Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Short Duty Deduction
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                summary.activeMinusDaysCount > 0
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'bg-white text-slate-600 border border-slate-300'
              }`}
            >
              {summary.activeMinusDaysCount} / {summary.shortDutyDaysCount} active
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            When working time is less than standard duty ({dutyHours}h {dutyMinutes}m), deduct shortfall from total overtime.
          </p>

          <button
            type="button"
            onClick={onToggleAllShortMinus}
            disabled={summary.shortDutyDaysCount === 0}
            className={`w-full py-2 px-3 rounded-lg font-semibold text-xs transition-all ${
              summary.shortDutyDaysCount === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : allShortDaysMinusEnabled
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            {allShortDaysMinusEnabled
              ? 'Deduct Short Duty: ON (Click to turn off)'
              : `Deduct Short Duty (${summary.shortDutyDaysCount} days short)`}
          </button>
        </div>
      </div>
    </section>
  );
}
