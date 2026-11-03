"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Swal from 'sweetalert2';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import { DateTime } from 'luxon'; // Luxon ইম্পোর্ট করা

export default function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7));
  const [attendanceData, setAttendanceData] = useState([]);
  
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSheetLoading, setIsSheetLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const timeZone = 'Asia/Dhaka'; // আপনার নির্দিষ্ট টাইমজোন

  // --- ডেটা লোড করার চূড়ান্ত এবং নির্ভরযোগ্য ফাংশন ---
  const fetchAndPrepareSheet = async () => {
    if (!selectedEmployee || !month) {
      setAttendanceData([]);
      return;
    }
    setIsSheetLoading(true);
    
    const [year, m] = month.split('-').map(Number);
    const daysInMonth = new Date(year, m, 0).getDate();
    const blankSheet = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      date: new Date(year, m - 1, i + 1).toLocaleDateString('en-CA'),
      inTime: '',
      outTime: '',
    }));

    try {
      const res = await fetch(`/api/attendance?employeeId=${selectedEmployee}&month=${month}`);
      if (!res.ok) throw new Error('Could not load existing attendance data.');
      
      const { records } = await res.json();
      
      const recordsMap = new Map(
        records.map(r => [
          DateTime.fromISO(r.date).setZone(timeZone).toISODate(), // Key: "YYYY-MM-DD"
          r,
        ])
      );

      const mergedSheet = blankSheet.map(dayInfo => {
        const dbRecord = recordsMap.get(dayInfo.date);

        if (dbRecord) {
          const formatTime = (isoString) => DateTime.fromISO(isoString).setZone(timeZone).toFormat('HH:mm');
          return {
            ...dayInfo,
            inTime: formatTime(dbRecord.inTime),
            outTime: formatTime(dbRecord.outTime),
          };
        }
        return dayInfo;
      });
      setAttendanceData(mergedSheet);
    } catch (error) {
      setAttendanceData(blankSheet);
      console.error("Fetch attendance error:", error.message);
    } finally {
      setIsSheetLoading(false);
    }
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsPageLoading(true);
      try {
        const res = await fetch('/api/employees');
        if (!res.ok) throw new Error('Failed to fetch employees');
        const data = await res.json();
        setEmployees(data.employees);
      } catch (error) {
        Swal.fire('Error', error.message, 'error');
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAndPrepareSheet();
  }, [selectedEmployee, month]);

  const handleInputChange = (day, field, value) => {
    setAttendanceData(prevData => prevData.map(d =>
      d.day === day ? { ...d, [field]: value } : d
    ));
  };

  const handleSave = async () => {
    if (!selectedEmployee) {
      Swal.fire('Warning!', 'Please select an employee first.', 'warning');
      return;
    }
    
    setIsSaving(true);
    
    const recordsToSave = attendanceData.filter(record => record.inTime && record.outTime);

    if (recordsToSave.length === 0) {
        Swal.fire('Info', 'There is no new or updated attendance data to save.', 'info');
        setIsSaving(false);
        return;
    }

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          attendanceRecords: recordsToSave,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: data.message || 'Attendance updated successfully!',
          timer: 2000,
          showConfirmButton: false,
        });
        fetchAndPrepareSheet(); // UI রিফ্রেশ করা
      } else {
        throw new Error(data.message || 'Failed to save attendance.');
      }
    } catch (error) {
      Swal.fire('Error!', error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isPageLoading) {
    return <div className="text-center p-10">Loading Data...</div>;
  }

  return (
    <main>
      <div className="space-y-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Monthly Attendance</h1>
            <p className="mt-1 text-sm text-gray-500">Manage daily attendance for employees.</p>
          </div>
          <Link href="/reports" className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#11b1e6] hover:bg-[#00424D]">
            View Reports →
          </Link>
        </div>
        
        <div className="p-6 bg-white rounded-xl shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
              <select id="employee" value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="w-full p-3 border rounded-lg">
                <option value="">-- Select --</option>
                {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId})</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
              <input type="month" id="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-full p-3 border rounded-lg"/>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-8 rounded-xl shadow-lg min-h-[400px]">
          {selectedEmployee ? (
            isSheetLoading ? (
              <div className="text-center py-20 text-gray-500">Loading Attendance Sheet...</div>
            ) : (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-6">Sheet for: <span className="text-indigo-600">{employees.find(e => e._id === selectedEmployee)?.name}</span></h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">In Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Out Time</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Clear</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceData.map(data => (
                        <tr key={data.day} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{data.date}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(data.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })}</td>
                          
                          <td className="px-4 py-2">
                            <TimePicker
                              onChange={(time) => handleInputChange(data.day, 'inTime', time)}
                              value={data.inTime || null}
                              format="HH:mm"
                              locale="sv-SE"
                              disableClock={false}
                              clearIcon={null}
                              className="react-time-picker-custom"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <TimePicker
                              onChange={(time) => handleInputChange(data.day, 'outTime', time)}
                              value={data.outTime || null}
                              format="HH:mm"
                              locale="sv-SE"
                              disableClock={false}
                              clearIcon={null}
                              className="react-time-picker-custom"
                            />
                          </td>
                          
                          <td className="px-4 py-2 text-center">
                            <button onClick={() => { handleInputChange(data.day, 'inTime', ''); handleInputChange(data.day, 'outTime', ''); }} className="text-red-500 hover:text-red-700 font-bold">X</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-8 flex justify-end">
                  <button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-green-400">
                    {isSaving ? 'Saving...' : 'Save / Update Attendance'}
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-20 text-gray-400 flex flex-col items-center justify-center">
              <p className="text-lg">Please select an employee to begin.</p>
              <p className="text-sm mt-1">The attendance sheet will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}