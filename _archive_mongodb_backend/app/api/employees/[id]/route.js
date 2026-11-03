import connectDB from "@/lib/mongodb";
import Employee from "@/models/Employee";
import { NextResponse } from "next/server";

// --- PUT: একজন নির্দিষ্ট এমপ্লয়ীর তথ্য আপডেট করার জন্য ---
export async function PUT(req, { params }) {
  const { id } = params; // URL থেকে এমপ্লয়ীর ID নেওয়া
  const body = await req.json(); // ফ্রন্টএন্ড থেকে নতুন তথ্য নেওয়া

  try {
    await connectDB();
    const updatedEmployee = await Employee.findByIdAndUpdate(id, body, {
      new: true, // এটি নিশ্চিত করে যে আপডেটেড ডকুমেন্টটি রিটার্ন করা হবে
      runValidators: true, // এটি নিশ্চিত করে যে আপডেটের সময়ও মডেলের ভ্যালিডেশন নিয়মগুলো চলবে
    });

    if (!updatedEmployee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Employee updated successfully", employee: updatedEmployee },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Error:", error);
    // যদি ডুপ্লিকেট employeeId দিয়ে আপডেট করার চেষ্টা হয়
    if (error.code === 11000) {
        return NextResponse.json({ message: `Another employee with ID '${body.employeeId}' already exists.` }, { status: 409 });
    }
    return NextResponse.json({ message: "An error occurred during update" }, { status: 500 });
  }
}

// --- DELETE: একজন নির্দিষ্ট এমপ্লয়ীকে মুছে ফেলার জন্য ---
export async function DELETE(req, { params }) {
  const { id } = params; // URL থেকে এমপ্লয়ীর ID নেওয়া

  try {
    await connectDB();
    const deletedEmployee = await Employee.findByIdAndDelete(id);

    if (!deletedEmployee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Employee deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ message: "An error occurred during deletion" }, { status: 500 });
  }
}

// --- GET: একজন নির্দিষ্ট এমপ্লয়ীর তথ্য পাওয়ার জন্য (ঐচ্ছিক, Edit Form-এর জন্য দরকার হবে) ---
export async function GET(req, { params }) {
    const { id } = params;
    try {
        await connectDB();
        const employee = await Employee.findById(id);
        if (!employee) {
            return NextResponse.json({ message: "Employee not found" }, { status: 404 });
        }
        return NextResponse.json({ employee }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Failed to fetch employee" }, { status: 500 });
    }
}