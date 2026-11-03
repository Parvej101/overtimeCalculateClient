import connectDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Employee from "@/models/Employee";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    // URL থেকে employeeId এবং month প্যারামিটারগুলো নিন
    // যেমন: /api/reports?employeeId=...&month=2023-12
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');
    const month = searchParams.get('month'); // YYYY-MM ফরম্যাটে

    if (!employeeId || !month) {
      return NextResponse.json({ message: "Employee ID and month are required" }, { status: 400 });
    }

    // মাস থেকে শুরু এবং শেষের তারিখ বের করা
    const [year, monthIndex] = month.split('-').map(Number);
    const startDate = new Date(year, monthIndex - 1, 1);
    const endDate = new Date(year, monthIndex, 0, 23, 59, 59); // মাসের শেষ দিনের শেষ মুহূর্ত

    // নির্দিষ্ট এমপ্লয়ীর ওই মাসের সব অ্যাটেনডেন্স রেকর্ড খুঁজে বের করা
    const attendanceRecords = await Attendance.find({
      employee: employeeId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: 'asc' }); // তারিখ অনুযায়ী সাজিয়ে নেওয়া

    // এমপ্লয়ীর নিজের তথ্যও (যেমন hourlyRate) নিয়ে আসা
    const employeeDetails = await Employee.findById(employeeId);

    if (!employeeDetails) {
        return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    // একটি অবজেক্টে সবকিছু একত্রিত করে পাঠানো
    return NextResponse.json({
      employeeDetails,
      attendanceRecords,
    });

  } catch (error) {
    console.error("Error fetching report data:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching report data", error: error.message },
      { status: 500 }
    );
  }
}