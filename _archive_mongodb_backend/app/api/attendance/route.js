import connectDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Employee from "@/models/Employee";
import { calculateOvertime } from "@/lib/calculation";
import { NextResponse } from "next/server";

// --- POST: অ্যাটেনডেন্স যোগ বা আপডেট করার জন্য ---
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { employeeId, attendanceRecords } = body;

    if (!employeeId || !attendanceRecords || !Array.isArray(attendanceRecords)) {
      return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json({ message: "Employee not found." }, { status: 404 });
    }
    const standardDutyMinutes = employee.standardDutyMinutes;

    const bulkOps = [];

    for (const record of attendanceRecords) {
      if (record.inTime && record.outTime) {
        
        const { dutyHours, overtimeHours, inTime, outTime } = calculateOvertime(
          record.date,
          record.inTime,
          record.outTime,
          standardDutyMinutes
        );

        if (inTime && outTime && dutyHours >= 0) {
          
          // --- সমাধান: তারিখের শুরু এবং শেষ দিয়ে একটি রেঞ্জ তৈরি করা ---
          const startOfDay = new Date(record.date + 'T00:00:00.000Z');
          const endOfDay = new Date(record.date + 'T23:59:59.999Z');

          bulkOps.push({
            updateOne: {
              // --- সমাধান: তারিখের রেঞ্জ দিয়ে ফিল্টার করা ---
              filter: { 
                employee: employeeId, 
                date: {
                  $gte: startOfDay,
                  $lte: endOfDay
                }
              },
              update: {
                $set: {
                  employee: employeeId,
                  date: startOfDay, // তারিখটিকে সবসময় দিনের শুরু হিসেবে সেভ করা
                  inTime,
                  outTime,
                  dutyHours,
                  overtimeHours,
                },
              },
              upsert: true,
            },
          });
        }
      }
    }

    if (bulkOps.length > 0) {
      await Attendance.bulkWrite(bulkOps);
    }

    return NextResponse.json(
      { message: `Attendance saved/updated successfully. Processed ${bulkOps.length} records.` },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in /api/attendance POST:", error);
    return NextResponse.json(
      { message: "An internal server error occurred.", error: error.message },
      { status: 500 }
    );
  }
}


// --- GET ফাংশন (অপরিবর্তিত থাকবে) ---
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');
    const month = searchParams.get('month');

    if (!employeeId || !month) {
      return NextResponse.json({ message: "Employee ID and month are required." }, { status: 400 });
    }

    await connectDB();

    const [year, m] = month.split('-').map(Number);
    const startDate = new Date(year, m - 1, 1);
    const endDate = new Date(year, m, 0, 23, 59, 59);

    const records = await Attendance.find({
      employee: employeeId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 'asc' });

    return NextResponse.json({ records }, { status: 200 });
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    return NextResponse.json({ message: "Failed to fetch attendance records." }, { status: 500 });
  }
}