"use client";

import { useState } from 'react';

export default function ManualPasteModal({
  isOpen,
  onClose,
  onApplyManualData,
  initialId = '',
  initialName = '',
  initialDesignation = '',
  initialCardNo = '',
}) {
  const [pastedText, setPastedText] = useState('');
  const [empId, setEmpId] = useState(initialId);
  const [empName, setEmpName] = useState(initialName);
  const [designation, setDesignation] = useState(initialDesignation);
  const [cardNo, setCardNo] = useState(initialCardNo);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleApply = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!pastedText.trim()) {
      setErrorMsg('অনুগ্রহ করে ডেটা পেস্ট করুন (Please paste attendance date/time lines or CSV).');
      return;
    }

    try {
      onApplyManualData(pastedText, {
        employeeId: empId.trim(),
        name: empName.trim(),
        designation: designation.trim(),
        cardNo: cardNo.trim(),
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'ডেটা পার্স করতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              📋 Manual Attendance Paste / Custom Input
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              সরাসরি ডেট/টাইম লাইন বা CSV কপি করে এখানে পেস্ট করুন। একই তারিখে ১ম টি In এবং শেষেরটি Out টাইম হবে।
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleApply} className="space-y-4">
          {/* Optional Meta fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Employee Name (যদি থাকে)</label>
              <input
                type="text"
                value={empName}
                onChange={(e) => setEmpName(e.target.value)}
                placeholder="e.g. Ove (অথবা খালি রাখুন)"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Employee ID / No. (যদি থাকে)</label>
              <input
                type="text"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                placeholder="e.g. 5 (অথবা খালি রাখুন)"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Designation (যদি থাকে)</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Staff / Executive"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Card No. (না থাকলে খালি রাখুন)</label>
              <input
                type="text"
                value={cardNo}
                onChange={(e) => setCardNo(e.target.value)}
                placeholder="খালি থাকবে (পরে নিজে বসাতে পারবেন)"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Paste Date/Time or CSV Rows:
              </label>
              <button
                type="button"
                onClick={() =>
                  setPastedText(`9/1/2026 9:51\n9/1/2026 20:31\n9/2/2026 9:51\n9/2/2026 20:41\n9/3/2026 9:47\n9/3/2026 19:02\n9/4/2026 9:53\n9/4/2026 19:05`)
                }
                className="text-[11px] text-sky-600 hover:text-sky-800 font-bold underline"
              >
                Insert Example
              </button>
            </div>
            <textarea
              rows={8}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder={`উদাহরণ ফরম্যাট ১ (শুধু ডেট-টাইম):\n9/1/2026 9:51\n9/1/2026 20:31\n9/2/2026 9:51\n9/2/2026 20:41\n\nবা উদাহরণ ফরম্যাট ২ (CSV লাইন):\n5,Ove,09/01/2026 09:51:38,0,5,K40\n5,Ove,09/01/2026 20:31:23,0,5,K40`}
              className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            ></textarea>
          </div>

          {errorMsg && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              ⚠️ {errorMsg}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-extrabold shadow-md hover:opacity-95 transition"
            >
              ⚡ Process & Calculate Overtime
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

