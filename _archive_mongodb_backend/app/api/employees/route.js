// ফাইল পাথ: src/app/api/employees/route.js
import connectDB from "@/lib/mongodb";
import Employee from "@/models/Employee";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // সার্ভার টার্মিনালে ফাইনাল চেক
    console.log("Data received by API:", body);

    const { employeeId, name, designation, hourlyRate, standardDutyMinutes } = body;

    if (!employeeId || !name || !hourlyRate || standardDutyMinutes === undefined || standardDutyMinutes === null) {
      return NextResponse.json({ message: "All required fields must be provided and valid." }, { status: 400 });
    }

    const newEmployee = new Employee({
      employeeId,
      name,
      designation,
      hourlyRate,
      standardDutyMinutes,
    });

    await newEmployee.save();

    return NextResponse.json({ message: "Employee created successfully", employee: newEmployee }, { status: 201 });

  } catch (error) {
    console.error("API Error:", error.message);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    if (error.code === 11000) {
      return NextResponse.json({ message: `Employee with ID '${body.employeeId}' already exists.` }, { status: 409 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const employees = await Employee.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ employees });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch employees" }, { status: 500 });
  }
}