"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import {
  getSavedEmployees,
  saveEmployeeProfile,
  deleteEmployeeProfile,
} from '@/lib/storage';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [cardNo, setCardNo] = useState('');
  const [dutyHours, setDutyHours] = useState(9);
  const [dutyMinutes, setDutyMinutes] = useState(10);
  const [hourlyRate, setHourlyRate] = useState(100);

  useEffect(() => {
    setEmployees(getSavedEmployees());
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setEmployeeId('');
    setName('');
    setDesignation('');
    setCardNo('');
    setDutyHours(9);
    setDutyMinutes(10);
    setHourlyRate(100);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !employeeId.trim()) {
      Swal.fire('Warning', 'কর্মীর নাম এবং আইডি পূরণ করুন।', 'warning');
      return;
    }

    const updated = saveEmployeeProfile({
      id: editingId || undefined,
      employeeId,
      name,
      designation,
      cardNo,
      dutyHours: Number(dutyHours) || 0,
      dutyMinutes: Number(dutyMinutes) || 0,
      hourlyRate: Number(hourlyRate) || 0,
    });

    setEmployees(updated);
    Swal.fire({
      icon: 'success',
      title: editingId ? 'Employee Updated!' : 'Employee Added!',
      text: `${name} (Duty: ${dutyHours}h ${dutyMinutes}m, OT Rate: ৳${hourlyRate} BDT) লোকাল স্টোরেজে সেভ হয়েছে।`,
      timer: 1800,
      showConfirmButton: false,
    });
    resetForm();
  };

  const handleEdit = (emp) => {
    setEditingId(emp.id);
    setEmployeeId(emp.employeeId);
    setName(emp.name);
    setDesignation(emp.designation || '');
    setCardNo(emp.cardNo || '');
    setDutyHours(emp.dutyHours ?? 9);
    setDutyMinutes(emp.dutyMinutes ?? 10);
    setHourlyRate(emp.hourlyRate ?? 100);
  };

  const handleDelete = (emp) => {
    Swal.fire({
      title: 'Delete Employee?',
      text: `${emp.name} কে ডিলিট করতে চান?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Yes, Delete',
    }).then((res) => {
      if (res.isConfirmed) {
        const updated = deleteEmployeeProfile(emp.id);
        setEmployees(updated);
      }
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-lg">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
            FPC • LocalStorage Database
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Saved Employee Profiles
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            এখানে কর্মীদের নির্ধারিত ডিউটি টাইম (যেমন 9h 10m বা 8h 10m) এবং ওভারটাইম রেট (100 বা 200 BDT) সেভ করে রাখুন।
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-md transition"
        >
          ← Back to XLS Report & Print
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 h-fit">
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            {editingId ? '✏️ Edit Employee Profile' : '➕ Add New Employee'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Employee No. / ID *
                </label>
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ove"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Executive"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Card No.
                </label>
                <input
                  type="text"
                  value={cardNo}
                  onChange={(e) => setCardNo(e.target.value)}
                  placeholder="0013390820"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Standard Duty Time (Hours & Minutes)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-500">Hours (ঘণ্টা)</span>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={dutyHours}
                    onChange={(e) => setDutyHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Minutes (মিনিট)</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={dutyMinutes}
                    onChange={(e) => setDutyMinutes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDutyHours(9);
                    setDutyMinutes(10);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-sky-100 text-slate-700"
                >
                  Set 9h 10m
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDutyHours(8);
                    setDutyMinutes(10);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-sky-100 text-slate-700"
                >
                  Set 8h 10m
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Overtime Hourly Rate (BDT ৳)
              </label>
              <input
                type="number"
                step="any"
                required
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="100 or 200"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold"
              />
              <div className="flex gap-2 mt-2">
                {[100, 150, 200, 250].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setHourlyRate(r)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200"
                  >
                    ৳{r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-sm shadow-md hover:opacity-95 transition"
              >
                {editingId ? 'Update Employee' : 'Save Employee'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Saved Employees Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            👥 Saved Employees ({employees.length})
          </h2>

          {employees.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No saved employees yet. Add one using the form on the left.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">ID / No.</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Designation</th>
                    <th className="px-4 py-3 text-center">Duty Time</th>
                    <th className="px-4 py-3 text-center">OT Rate (BDT)</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{emp.employeeId}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{emp.name}</td>
                      <td className="px-4 py-3 text-slate-500">{emp.designation || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 font-bold text-xs border border-sky-200">
                          {emp.dutyHours}h {emp.dutyMinutes}m
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 font-bold text-xs border border-amber-200">
                          ৳ {emp.hourlyRate} BDT
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(emp)}
                          className="text-sky-600 hover:text-sky-800 font-bold text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(emp)}
                          className="text-rose-600 hover:text-rose-800 font-bold text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
